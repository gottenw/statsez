import 'dotenv/config'
import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { prettyJSON } from 'hono/pretty-json'
import { rateLimit } from './middleware/rateLimit.js'
import { apiKeyAuth, decrementQuota } from './middleware/auth.js'
import { requestLogger } from './middleware/logger.js'
import { sportRoutes } from './routes/sports.js'
import { authRoutes } from './routes/auth.js'
import { healthRoutes } from './routes/health.js'
import { paymentRoutes } from './routes/payments.js'
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
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
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
app.route('/payments', paymentRoutes)
app.route('/user', userRoutes)
app.route('/admin', adminRoutes)


app.use('/v1/:sport/*', apiKeyAuth())
app.use('/v1/:sport/*', decrementQuota)
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
  console.error('Erro interno do servidor')
  return c.json({
    success: false,
    error: 'Erro interno do servidor'
  }, 500)
})

const port = parseInt(process.env.PORT || '3001')

serve({
  fetch: app.fetch,
  port,
  hostname: '0.0.0.0'
}, (info) => {
  console.log(`🚀 Servidor rodando em http://0.0.0.0:${info.port}`)
})