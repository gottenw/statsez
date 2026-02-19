import type { MiddlewareHandler } from 'hono'
import { prisma } from '../lib/prisma.js'
import type { AuthContext, Sport } from '../types/index.js'


declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
    cached: boolean
  }
}


export const apiKeyAuth = (allowedSport?: Sport): MiddlewareHandler => {
  return async (c, next) => {
    const apiKey = c.req.header('x-api-key')
    const sportFromPath = c.req.param('sport') as Sport

    
    if (!apiKey) {
      return c.json({
        success: false,
        error: 'API Key não fornecida. Use o header x-api-key'
      }, 401)
    }

    
    const keyRecord = await prisma.apiKey.findUnique({
      where: { key: apiKey },
      include: {
        subscription: true
      }
    })

    if (!keyRecord || !keyRecord.isActive) {
      return c.json({
        success: false,
        error: 'API Key inválida ou desativada'
      }, 401)
    }

    const subscription = keyRecord.subscription

    
    if (!subscription.isActive) {
      return c.json({
        success: false,
        error: 'Assinatura inativa. Renove seu plano para continuar.'
      }, 403)
    }

    
    const sportToCheck = allowedSport || sportFromPath
    
    if (sportToCheck && subscription.sport !== sportToCheck) {
      return c.json({
        success: false,
        error: `Esta API Key não tem acesso ao esporte '${sportToCheck}'. ` +
               `Esporte permitido: '${subscription.sport}'`
      }, 403)
    }

    
    const now = new Date()
    const cycleStart = subscription.cycleStartDate
    const daysInCycle = Math.floor((now.getTime() - cycleStart.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysInCycle >= 15) {
      
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentUsage: 0,
          cycleStartDate: now
        }
      })
      subscription.currentUsage = 0
    }

    
    if (subscription.currentUsage >= subscription.biWeeklyQuota) {
      return c.json({
        success: false,
        error: 'Quota quinzenal esgotada. Aguarde o próximo ciclo (dia 1 ou 15)',
        meta: {
          remainingQuota: 0,
          totalQuota: subscription.biWeeklyQuota,
          resetDate: new Date(subscription.cycleStartDate.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
        }
      }, 429)
    }

    
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: now }
    })

    
    c.set('auth', {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      sport: subscription.sport as Sport,
      apiKey: apiKey,
      remainingQuota: subscription.biWeeklyQuota - subscription.currentUsage
    })

    await next()
  }
}


export const decrementQuota: MiddlewareHandler = async (c, next) => {
  await next()
  
  
  if (c.res.status >= 200 && c.res.status < 300) {
    const auth = c.get('auth')
    
    if (auth) {
      await prisma.subscription.update({
        where: { id: auth.subscriptionId },
        data: {
          currentUsage: {
            increment: 1
          }
        }
      })
    }
  }
}
