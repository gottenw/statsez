import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { rateLimit } from './middleware/rateLimit.js'
import { apiKeyAuth } from './middleware/auth.js'
import { prisma } from './lib/prisma.js'
import { requestLogger } from './middleware/logger.js'
import { sportRoutes } from './routes/sports.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'

import { userRoutes } from './routes/user.js'
import { adminRoutes } from './routes/admin.js'


const app = new Hono()

// Lista explícita de origens permitidas
const ALLOWED_ORIGINS = [
  'https://statsez.com',
  'https://www.statsez.com',
  ...(process.env.NODE_ENV === 'development' ? ['http://localhost:3000', 'http://localhost:3001'] : []),
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use('*', cors({
  origin: (origin) => {
    if (!origin) return 'https://statsez.com';
    if (ALLOWED_ORIGINS.includes(origin)) {
      return origin;
    }
    return 'https://statsez.com';
  },
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'Accept'],
  credentials: true,
  maxAge: 600,
}))

app.options('*', (c) => {
  return c.text('', 204 as any)
})

// Security headers
app.use('*', async (c, next) => {
  await next()
  c.header('X-Content-Type-Options', 'nosniff')
  c.header('X-Frame-Options', 'DENY')
  c.header('X-XSS-Protection', '1; mode=block')
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
})

app.use('*', logger())
app.use('*', prettyJSON())

app.use('*', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_IP || '100')
}))

app.route('/health', healthRoutes)
app.route('/auth', authRoutes)

app.route('/user', userRoutes)
app.route('/admin', adminRoutes)


app.use('/v1/:sport/*', apiKeyAuth())
app.use('/v1/:sport/*', requestLogger)
app.route('/v1', sportRoutes)

app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'Statsez API Gateway',
    version: '1.0.0',
    status: 'online'
  })
})

app.onError((err, c) => {
  // Log com contexto para debug mas sem vazar para o cliente
  const path = c.req.path
  const method = c.req.method
  console.error(`[Error] ${method} ${path}:`, err.message || err)

  // Diferenciar entre erros de conectividade (502) e erros internos (500)
  const isUpstream = err.message?.includes('fetch') || err.message?.includes('ECONNREFUSED') || err.message?.includes('timeout')

  return c.json({
    success: false,
    error: isUpstream ? 'Upstream service unavailable. Try again.' : 'Internal server error'
  }, isUpstream ? 502 : 500)
})

const port = parseInt(process.env.PORT || '3001')

// Desativa subscriptions expiradas a cada hora
async function deactivateExpiredSubscriptions() {
  try {
    const result = await prisma.subscription.updateMany({
      where: {
        isActive: true,
        expiresAt: { lt: new Date() }
      },
      data: { isActive: false }
    })
    if (result.count > 0) {
      console.log(`[Cron] ${result.count} subscription(s) expirada(s) desativada(s)`)
    }
  } catch (err) {
    console.error('[Cron] Erro ao desativar subscriptions expiradas:', err)
  }
}

// Executa ao iniciar e a cada hora
deactivateExpiredSubscriptions()
setInterval(deactivateExpiredSubscriptions, 60 * 60 * 1000)

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${info.port}`)
})