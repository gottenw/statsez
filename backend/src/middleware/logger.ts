import type { MiddlewareHandler } from 'hono'
import { prisma } from '../lib/prisma.js'


export const requestLogger: MiddlewareHandler = async (c, next) => {
  const startTime = Date.now()
  
  await next()
  
  const endTime = Date.now()
  const responseTime = endTime - startTime
  
  
  const auth = c.get('auth')
  if (!auth) return

  
  const cached = c.get('cached') || false
  const sport = c.req.param('sport') || auth.sport
  const endpoint = c.req.path

  
  prisma.requestLog.create({
    data: {
      apiKeyId: auth.subscriptionId,
      subscriptionId: auth.subscriptionId,
      sport,
      endpoint,
      statusCode: c.res.status,
      cached,
      responseTimeMs: responseTime
    }
  }).catch(() => {
    // Erro silencioso no logging
  })
}
