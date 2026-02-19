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

const app = new Hono()






app.use('*', cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
  credentials: true
}))


app.use('*', logger())


app.use('*', prettyJSON())


app.use('*', rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000'),
  maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS_IP || '100')
}))






app.route('/health', healthRoutes)


app.route('/auth', authRoutes)

app.route('/payments', paymentRoutes)






app.use('/v1/:sport/*', apiKeyAuth())
app.use('/v1/:sport/*', decrementQuota)
app.use('/v1/:sport/*', requestLogger)
app.route('/v1', sportRoutes)





app.get('/', (c) => {
  return c.json({
    success: true,
    message: 'API Gateway de Esportes',
    version: '1.0.0',
    documentation: '/docs',
    status: 'online'
  })
})





app.onError((err, c) => {
  console.error('Erro:', err)
  return c.json({
    success: false,
    error: 'Erro interno do servidor',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  }, 500)
})





const port = parseInt(process.env.PORT || '3001')

serve({
  fetch: app.fetch,
  port
}, (info) => {
  console.log(`🚀 Servidor rodando em http://localhost:${info.port}`)
  console.log(`📚 Ambiente: ${process.env.NODE_ENV || 'development'}`)
})
