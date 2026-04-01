import type { Slide, SlideElement, SlideType } from '../types/slides'

const VALID_SLIDE_TYPES: SlideType[] = ['title', 'kpi', 'chart', 'comparison', 'insight', 'recommendation', 'influencer']
const VALID_ELEMENT_KINDS: SlideElement['kind'][] = ['text', 'kpi-grid', 'bar-chart', 'list', 'influencer-profile', 'audience-chart', 'content-grid', 'ad-performance']

let idCounter = 0
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${++idCounter}`
}

function validateElement(el: unknown, index: number): SlideElement | null {
  if (!el || typeof el !== 'object') return null
  const e = el as Record<string, unknown>

  const kind = VALID_ELEMENT_KINDS.includes(e.kind as SlideElement['kind'])
    ? (e.kind as SlideElement['kind'])
    : 'text'

  const element: SlideElement = {
    id: typeof e.id === 'string' && e.id ? e.id : generateId(`e${index}`),
    kind,
    content: typeof e.content === 'string' ? e.content : '',
  }

  if (Array.isArray(e.data)) {
    if (kind === 'kpi-grid') {
      element.data = e.data.map(d => {
        const item = d as Record<string, unknown>
        return {
          label: String(item.label ?? ''),
          value: String(item.value ?? ''),
          sub: String(item.sub ?? ''),
        }
      })
    } else if (kind === 'bar-chart') {
      element.data = e.data.map(d => {
        const item = d as Record<string, unknown>
        return {
          label: String(item.label ?? ''),
          value: typeof item.value === 'number' ? item.value : Number(item.value) || 0,
          pct: Math.max(0, Math.min(100, typeof item.pct === 'number' ? item.pct : Number(item.pct) || 0)),
          color: typeof item.color === 'string' ? item.color : '#4f46e5',
        }
      })
    } else if (kind === 'list') {
      element.data = e.data.map(d => {
        const item = d as Record<string, unknown>
        return { text: String(item.text ?? '') }
      })
    } else if (kind === 'influencer-profile' || kind === 'ad-performance') {
      element.data = e.data.map(d => {
        const item = d as Record<string, unknown>
        return {
          label: String(item.label ?? ''),
          value: String(item.value ?? ''),
          pct: typeof item.pct === 'number' ? item.pct : Number(item.pct) || 0,
          color: typeof item.color === 'string' ? item.color : '#4f46e5',
        }
      })
    } else if (kind === 'content-grid') {
      element.data = e.data.map(d => {
        const item = d as Record<string, unknown>
        return {
          title: String(item.title ?? ''),
          likes: String(item.likes ?? ''),
          comments: String(item.comments ?? ''),
          date: String(item.date ?? ''),
        }
      })
    }
  }

  // audience-chart uses object data, not array
  if (kind === 'audience-chart' && e.data && !Array.isArray(e.data) && typeof e.data === 'object') {
    element.data = e.data as Record<string, unknown>
  }

  return element
}

function validateSlide(raw: unknown, index: number): Slide | null {
  if (!raw || typeof raw !== 'object') return null
  const s = raw as Record<string, unknown>

  const type = VALID_SLIDE_TYPES.includes(s.type as SlideType)
    ? (s.type as SlideType)
    : 'title'

  const elements = Array.isArray(s.elements)
    ? (s.elements.map((e, i) => validateElement(e, i)).filter(Boolean) as SlideElement[])
    : []

  return {
    id: typeof s.id === 'string' && s.id ? s.id : generateId(`s${index}`),
    type,
    title: typeof s.title === 'string' ? s.title : `슬라이드 ${index + 1}`,
    summary: typeof s.summary === 'string' ? s.summary : '',
    elements,
  }
}

/**
 * LLM 응답 JSON 문자열을 파싱하고 검증하여 Slide[] 반환.
 * 파싱 실패 시 null 반환.
 */
export function parseAndValidateSlides(jsonString: string): Slide[] | null {
  // JSON 코드 블록 래핑 제거
  let cleaned = jsonString.trim()
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '')
  }

  let parsed: unknown
  try {
    parsed = JSON.parse(cleaned)
  } catch {
    // 불완전한 JSON 복구 시도: 마지막 닫히지 않은 괄호 닫기
    try {
      let repaired = cleaned
      const openBrackets = (repaired.match(/\[/g) || []).length
      const closeBrackets = (repaired.match(/\]/g) || []).length
      for (let i = 0; i < openBrackets - closeBrackets; i++) repaired += ']'
      const openBraces = (repaired.match(/\{/g) || []).length
      const closeBraces = (repaired.match(/\}/g) || []).length
      for (let i = 0; i < openBraces - closeBraces; i++) repaired += '}'
      parsed = JSON.parse(repaired)
    } catch {
      return null
    }
  }

  // 배열이 아니면 배열로 감싸기
  const arr = Array.isArray(parsed) ? parsed : [parsed]
  if (arr.length === 0) return null

  const slides = arr.map((s, i) => validateSlide(s, i)).filter(Boolean) as Slide[]
  return slides.length > 0 ? slides : null
}
