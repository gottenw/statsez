import type { MiddlewareHandler } from 'hono'
import { prisma } from '../lib/prisma.js'
import type { AuthContext, Sport } from '../types/index.js'


declare module 'hono' {
  interface ContextVariableMap {
    auth: AuthContext
    cached: boolean
    userId: string
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

    // Verifica se a assinatura expirou
    if (subscription.expiresAt && new Date() > subscription.expiresAt) {
      // Desativa a assinatura
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: { isActive: false }
      });
      
      return c.json({
        success: false,
        error: 'Assinatura expirada. Renove seu plano para continuar.',
        meta: {
          expiredAt: subscription.expiresAt.toISOString()
        }
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
    
    // Verifica se o ciclo quinzenal acabou
    if (subscription.cycleEndDate && now > subscription.cycleEndDate) {
      // Inicia novo ciclo
      const newCycleStart = subscription.cycleEndDate
      const newCycleEnd = new Date(newCycleStart)
      newCycleEnd.setDate(newCycleEnd.getDate() + 15)
      
      await prisma.subscription.update({
        where: { id: subscription.id },
        data: {
          currentUsage: 0,
          cycleStartDate: newCycleStart,
          cycleEndDate: newCycleEnd
        }
      })
      
      subscription.currentUsage = 0
      subscription.cycleEndDate = newCycleEnd
    }

    // Verifica quota quinzenal
    if (subscription.currentUsage >= subscription.biWeeklyQuota) {
      const nextReset = subscription.cycleEndDate 
        ? subscription.cycleEndDate.toISOString()
        : new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000).toISOString()
        
      return c.json({
        success: false,
        error: 'Quota quinzenal esgotada. Aguarde o próximo ciclo.',
        meta: {
          remainingQuota: 0,
          totalQuota: subscription.biWeeklyQuota,
          usedQuota: subscription.currentUsage,
          resetDate: nextReset
        }
      }, 429)
    }

    
    await prisma.apiKey.update({
      where: { id: keyRecord.id },
      data: { lastUsedAt: now }
    })

    const remainingQuota = subscription.biWeeklyQuota - subscription.currentUsage
    
    c.set('auth', {
      userId: subscription.userId,
      subscriptionId: subscription.id,
      sport: subscription.sport as Sport,
      apiKey: apiKey,
      remainingQuota: remainingQuota
    })

    // Adiciona headers informativos
    c.header('X-RateLimit-Limit', subscription.biWeeklyQuota.toString())
    c.header('X-RateLimit-Remaining', Math.max(0, remainingQuota).toString())
    c.header('X-RateLimit-Reset', subscription.cycleEndDate?.toISOString() || '')

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
