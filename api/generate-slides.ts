import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const BASE_SYSTEM_PROMPT = `You are a presentation slide generator for a marketing campaign analytics platform called "피처링(Featuring)".

Generate a JSON array of slides matching this exact TypeScript interface:

type SlideType = 'title' | 'kpi' | 'chart' | 'comparison' | 'insight' | 'recommendation' | 'influencer'

interface SlideElement {
  id: string
  kind: 'text' | 'kpi-grid' | 'bar-chart' | 'list' | 'influencer-profile' | 'audience-chart' | 'content-grid' | 'ad-performance'
  content: string
  data?: any
}

interface Slide {
  id: string
  type: SlideType
  title: string
  summary: string
  elements: SlideElement[]
}

Rules:
- Generate 5-8 slides
- First slide must be type "title" with 2-3 text elements (campaign name, period/details, subtitle)
- Include at least one "kpi" slide with one kpi-grid element. kpi-grid data: { label: string; value: string; sub: string }[] (4-6 items)
- Include at least one "chart" slide with one bar-chart element. bar-chart data: { label: string; value: number; pct: number; color: string }[] (3-5 items, pct 0-100, colors as hex)
- Include at least one "insight" slide with one list element. list data: { text: string }[] (2-4 items)
- Include at least one "recommendation" slide with one list element. list data: { text: string }[] (2-4 items)
- All id fields must be unique (use s1, s2... for slides, e1, e2... for elements)
- All text content must be in Korean
- summary should be 1-2 sentences describing the slide purpose
- Make the data realistic and internally consistent

When the user provides attached data (CSV/Excel data in markdown table format):
- Use the ACTUAL values from the attached data — do NOT fabricate numbers
- For kpi-grid, compute aggregates from the actual data columns
- For bar-chart, use the actual data values
- Reference specific data points in insights

When the user provides web page content:
- Extract key facts and statistics from the web page text
- Use the web content as context for relevant slides

Respond with ONLY valid JSON array. No markdown fences, no explanation.`

const INFLUENCER_SYSTEM_PROMPT = `You are a presentation slide generator for an influencer analytics platform called "피처링(Featuring)".

Generate a JSON array of slides. You MUST use the influencer-specific element kinds described below.

type SlideType = 'title' | 'kpi' | 'chart' | 'comparison' | 'insight' | 'recommendation' | 'influencer'

interface SlideElement {
  id: string
  kind: 'text' | 'kpi-grid' | 'bar-chart' | 'list' | 'influencer-profile' | 'audience-chart' | 'content-grid' | 'ad-performance'
  content: string
  data?: any
}

interface Slide { id: string; type: SlideType; title: string; summary: string; elements: SlideElement[] }

REQUIRED SLIDES (you MUST include ALL of these):

1. type "title" — Title slide with influencer name
2. type "influencer" — 핵심 지표. MUST use kind "influencer-profile" with data as array:
   [{ "label": "팔로워", "value": "9,204만", "pct": 100, "color": "#4f46e5" }, { "label": "참여율", "value": "10%", "pct": 100, "color": "#0d9488" }, { "label": "예상 도달", "value": "920,400", "pct": 80, "color": "#7c3aed" }, { "label": "평균 좋아요", "value": "92,040", "pct": 70, "color": "#ec4899" }, { "label": "평균 영상조회", "value": "184,080", "pct": 65, "color": "#f59e0b" }, { "label": "예상 CPR", "value": "10,000원", "pct": 40, "color": "#059669" }]

3. type "influencer" — 오디언스 분석. MUST use kind "audience-chart" with data as OBJECT (not array):
   { "gender": [{ "label": "여성", "pct": 72, "color": "#ec4899" }, { "label": "남성", "pct": 25, "color": "#3b82f6" }, { "label": "기타", "pct": 3, "color": "#9ca3af" }], "age": [{ "label": "13-17", "pct": 8, "color": "#c084fc" }, { "label": "18-24", "pct": 35, "color": "#818cf8" }, { "label": "25-34", "pct": 38, "color": "#4f46e5" }, { "label": "35-44", "pct": 14, "color": "#6366f1" }, { "label": "45+", "pct": 5, "color": "#a5b4fc" }] }

4. type "influencer" — 인기 콘텐츠. MUST use kind "content-grid" with data as array:
   [{ "title": "콘텐츠 제목", "likes": "245,000", "comments": "3,200", "date": "2026.03.12" }, ...]

5. type "influencer" — 광고 성과. MUST use kind "ad-performance" with data as array:
   [{ "label": "평균 CPE", "value": "137원", "pct": 45, "color": "#4f46e5" }, { "label": "광고 참여율", "value": "8.2%", "pct": 82, "color": "#0d9488" }, { "label": "브랜드 언급률", "value": "94%", "pct": 94, "color": "#7c3aed" }, { "label": "광고 ROI", "value": "312%", "pct": 78, "color": "#f59e0b" }]

6. type "insight" — AI 인사이트 with kind "list"
7. type "recommendation" — 협업 제안 with kind "list"

Rules:
- Use the ACTUAL values from the provided influencer data — do NOT make up numbers
- All id fields must be unique (s1, s2... for slides, e1, e2... for elements)
- All text in Korean
- content field can be empty string "" for data-driven elements
- For audience-chart, data is an OBJECT with gender and age keys, NOT an array

Respond with ONLY valid JSON array. No markdown fences, no explanation.`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { prompt, campaignId, attachedData } = req.body as { prompt?: string; campaignId?: string; attachedData?: string }
  if (!prompt) {
    return res.status(400).json({ error: 'prompt is required' })
  }

  const client = new Anthropic({ apiKey })

  // SSE 헤더 설정
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')

  const sendEvent = (data: Record<string, unknown>) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`)
  }

  try {
    // Phase: analyzing
    sendEvent({ phase: 'analyzing' })

    let userMessage = `사용자 요청: ${prompt}`
    if (campaignId) userMessage += `\n대상 캠페인: ${campaignId}`
    if (attachedData) userMessage += `\n\n${attachedData}`

    // 인플루언서 데이터가 포함되어 있으면 전용 프롬프트 사용
    const hasInfluencerData = attachedData?.includes('=== 인플루언서:')
    const systemPrompt = hasInfluencerData ? INFLUENCER_SYSTEM_PROMPT : BASE_SYSTEM_PROMPT

    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-20250514',
      max_tokens: hasInfluencerData ? 8000 : (attachedData ? 6000 : 4096),
      system: systemPrompt,
      messages: [{ role: 'user', content: userMessage }],
    })

    let fullText = ''
    let generatingPhase = false

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
        fullText += event.delta.text

        // 첫 번째 슬라이드 구조가 감지되면 generating phase로 전환
        if (!generatingPhase && fullText.includes('"type"')) {
          generatingPhase = true
          sendEvent({ phase: 'generating' })
        }
      }
    }

    // Phase: complete
    sendEvent({ phase: 'complete', content: fullText })
    sendEvent({ phase: 'done' })
    res.end()
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    sendEvent({ phase: 'error', message })
    res.end()
  }
}
