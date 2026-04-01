import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import type { Plugin } from 'vite'

/**
 * 로컬 개발용 API 미들웨어.
 * /api/* 요청을 Vercel serverless function처럼 처리합니다.
 */
function apiMiddleware(): Plugin {
  return {
    name: 'api-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) return next()

        const routeName = req.url.replace('/api/', '').split('?')[0]
        try {
          const handler = await server.ssrLoadModule(`./api/${routeName}.ts`)
          if (typeof handler.default === 'function') {
            // body 파싱
            let body = ''
            for await (const chunk of req) body += chunk
            const parsedBody = body ? JSON.parse(body) : {}
            const fakeReq = { ...req, method: req.method, body: parsedBody }

            // 간단한 VercelResponse 모킹
            const fakeRes = {
              statusCode: 200,
              headers: {} as Record<string, string>,
              setHeader(k: string, v: string) { this.headers[k] = v; res.setHeader(k, v); return this },
              status(code: number) { this.statusCode = code; return this },
              json(data: unknown) { res.writeHead(this.statusCode, { 'Content-Type': 'application/json' }); res.end(JSON.stringify(data)) },
              write(chunk: string) { res.write(chunk) },
              end() { res.end() },
            }

            await handler.default(fakeReq, fakeRes)
          } else {
            next()
          }
        } catch (err) {
          console.error('API middleware error:', err)
          res.writeHead(500, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify({ error: 'Internal server error' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // API 키를 서버 사이드에서 접근 가능하게 설정
  process.env.ANTHROPIC_API_KEY = env.ANTHROPIC_API_KEY

  return {
    plugins: [react(), apiMiddleware()],
  }
})
