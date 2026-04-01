import Anthropic from '@anthropic-ai/sdk'
import type { VercelRequest, VercelResponse } from '@vercel/node'

const SYSTEM_PROMPT = `You are a slide content editor for a marketing campaign presentation tool.

You will receive:
1. The current slide data as JSON (matching the Slide interface)
2. An edit instruction from the user

Your job is to modify the slide according to the instruction and return the updated slide as JSON.

Rules:
- Keep the same id, type, and structure
- Only modify the content/data that the instruction asks to change
- Keep all text in Korean
- Return ONLY valid JSON of the single updated Slide object, no markdown fences

Slide interface:
interface SlideElement {
  id: string
  kind: 'text' | 'kpi-grid' | 'bar-chart' | 'list'
  content: string
  data?: Record<string, unknown>[]
}

interface Slide {
  id: string
  type: 'title' | 'kpi' | 'chart' | 'comparison' | 'insight' | 'recommendation'
  title: string
  summary: string
  elements: SlideElement[]
}`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const { slide, instruction } = req.body as { slide?: unknown; instruction?: string }
  if (!slide || !instruction) {
    return res.status(400).json({ error: 'slide and instruction are required' })
  }

  const client = new Anthropic({ apiKey })

  try {
    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: SYSTEM_PROMPT,
      messages: [{
        role: 'user',
        content: `현재 슬라이드:\n${JSON.stringify(slide, null, 2)}\n\n편집 지시:\n${instruction}`,
      }],
    })

    const text = message.content[0].type === 'text' ? message.content[0].text : ''
    res.status(200).json({ content: text })
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: errorMessage })
  }
}
