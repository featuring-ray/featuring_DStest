import type { Slide } from '../types/slides'
import { parseAndValidateSlides } from '../utils/slideValidator'

/* ═══════════════════════ 타입 ═══════════════════════ */

export type PhaseEvent =
  | { phase: 'loading' }
  | { phase: 'analyzing' }
  | { phase: 'generating' }
  | { phase: 'complete'; slides: Slide[] }
  | { phase: 'error'; message: string }

export interface GenerateRequest {
  prompt: string
  campaignId?: string
  attachedData?: string
}

/* ═══════════════════════ 유틸 ═══════════════════════ */

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/** 최소 지속시간을 보장하면서 phase 이벤트를 전송 */
async function emitWithMinDuration(
  onPhase: (event: PhaseEvent) => void,
  event: PhaseEvent,
  minMs: number,
): Promise<void> {
  const start = Date.now()
  onPhase(event)
  const elapsed = Date.now() - start
  if (elapsed < minMs) {
    await delay(minMs - elapsed)
  }
}

/* ═══════════════════════ 슬라이드 생성 ═══════════════════════ */

export async function generateSlides(
  request: GenerateRequest,
  onPhase: (event: PhaseEvent) => void,
  signal?: AbortSignal,
): Promise<void> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 60000)

  // signal 연동
  if (signal) {
    signal.addEventListener('abort', () => controller.abort())
  }

  try {
    const response = await fetch('/api/generate-slides', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt: request.prompt, campaignId: request.campaignId, attachedData: request.attachedData }),
      signal: controller.signal,
    })

    if (!response.ok) {
      const errBody = await response.text()
      throw new Error(`API 오류 (${response.status}): ${errBody}`)
    }

    if (!response.body) {
      throw new Error('스트리밍 응답을 받을 수 없습니다.')
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder()
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // SSE 이벤트 파싱
      const lines = buffer.split('\n')
      buffer = lines.pop() || ''

      for (const line of lines) {
        if (!line.startsWith('data: ')) continue
        const jsonStr = line.slice(6).trim()
        if (!jsonStr) continue

        try {
          const event = JSON.parse(jsonStr) as Record<string, unknown>

          if (event.phase === 'analyzing') {
            await emitWithMinDuration(onPhase, { phase: 'analyzing' }, 800)
          } else if (event.phase === 'generating') {
            await emitWithMinDuration(onPhase, { phase: 'generating' }, 800)
          } else if (event.phase === 'complete' && typeof event.content === 'string') {
            const slides = parseAndValidateSlides(event.content)
            if (slides) {
              onPhase({ phase: 'complete', slides })
            } else {
              onPhase({ phase: 'error', message: 'AI 응답을 슬라이드로 변환할 수 없습니다. 다시 시도해주세요.' })
            }
          } else if (event.phase === 'error') {
            onPhase({ phase: 'error', message: String(event.message || 'AI 생성 중 오류가 발생했습니다.') })
          }
        } catch {
          // SSE 파싱 오류 무시
        }
      }
    }
  } catch (err) {
    if (controller.signal.aborted) {
      onPhase({ phase: 'error', message: '생성 시간이 초과되었습니다. 다시 시도해주세요.' })
    } else {
      onPhase({
        phase: 'error',
        message: err instanceof Error ? err.message : '네트워크 오류가 발생했습니다.',
      })
    }
  } finally {
    clearTimeout(timeoutId)
  }
}

/* ═══════════════════════ Magic Edit ═══════════════════════ */

export async function editSlide(
  slide: Slide,
  instruction: string,
): Promise<Slide | null> {
  const response = await fetch('/api/edit-slide', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ slide, instruction }),
  })

  if (!response.ok) {
    throw new Error(`Magic Edit 오류 (${response.status})`)
  }

  const result = await response.json() as { content: string }
  const slides = parseAndValidateSlides(result.content)
  return slides?.[0] ?? null
}
