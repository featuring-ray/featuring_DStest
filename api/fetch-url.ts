import type { VercelRequest, VercelResponse } from '@vercel/node'

/** HTML에서 본문 텍스트를 추출 (태그, 스크립트, 스타일 제거) */
function extractText(html: string): { title: string; text: string } {
  // title 추출
  const titleMatch = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : ''

  // script, style, nav, footer, header 제거
  let cleaned = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<nav[\s\S]*?<\/nav>/gi, '')
    .replace(/<footer[\s\S]*?<\/footer>/gi, '')
    .replace(/<header[\s\S]*?<\/header>/gi, '')

  // 블록 태그를 줄바꿈으로
  cleaned = cleaned.replace(/<\/(p|div|h[1-6]|li|tr|br|section|article)>/gi, '\n')
  // 모든 태그 제거
  cleaned = cleaned.replace(/<[^>]+>/g, ' ')
  // HTML 엔티티 디코딩
  cleaned = cleaned
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
  // 연속 공백/줄바꿈 정리
  cleaned = cleaned.replace(/[ \t]+/g, ' ').replace(/\n\s*\n/g, '\n').trim()

  // 3000자로 제한 (토큰 예산)
  const text = cleaned.length > 3000 ? cleaned.slice(0, 3000) + '\n...(이하 생략)' : cleaned

  return { title, text }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { url } = req.body as { url?: string }
  if (!url) {
    return res.status(400).json({ error: 'url is required' })
  }

  // 기본적인 URL 검증
  try {
    new URL(url)
  } catch {
    return res.status(400).json({ error: '유효하지 않은 URL입니다.' })
  }

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FeaturingBot/1.0)',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(10000),
    })

    if (!response.ok) {
      return res.status(400).json({ error: `URL 접근 실패 (${response.status})` })
    }

    const contentType = response.headers.get('content-type') || ''
    if (!contentType.includes('text/html') && !contentType.includes('text/plain')) {
      return res.status(400).json({ error: 'HTML 또는 텍스트 페이지만 분석할 수 있습니다.' })
    }

    const html = await response.text()
    const { title, text } = extractText(html)

    res.status(200).json({ title: title || url, text, charCount: text.length })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'URL을 가져올 수 없습니다.'
    res.status(500).json({ error: message })
  }
}
