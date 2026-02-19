import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import type { Sport, PlanName } from '../types/index.js'

const app = new Hono()


const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

const createSubscriptionSchema = z.object({
  sport: z.enum(['football', 'basketball', 'tennis', 'hockey']),
  planName: z.enum(['Basic', 'Pro', 'Custom']),
  monthlyQuota: z.number().min(100).max(1000000)
})


app.post('/register', zValidator('json', registerSchema), async (c) => {
  const { email, password, name } = c.req.valid('json')

  try {
    
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: password, 
        name
      }
    })

    return c.json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        id: user.id,
        email: user.email,
        name: user.name
      }
    }, 201)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return c.json({
        success: false,
        error: 'Email já cadastrado'
      }, 409)
    }
    throw err
  }
})


app.post('/subscription', zValidator('json', createSubscriptionSchema), async (c) => {
  const { sport, planName, monthlyQuota } = c.req.valid('json')
  const userId = c.req.header('x-user-id') 

  if (!userId) {
    return c.json({
      success: false,
      error: 'Usuário não autenticado'
    }, 401)
  }

  const biWeeklyQuota = Math.floor(monthlyQuota / 2)

  
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      sport,
      planName,
      monthlyQuota,
      biWeeklyQuota,
      cycleStartDate: new Date()
    }
  })

  
  const apiKey = `br_${sport}_${Buffer.from(subscription.id).toString('base64url').slice(0, 20)}`
  
  await prisma.apiKey.create({
    data: {
      key: apiKey,
      subscriptionId: subscription.id
    }
  })

  return c.json({
    success: true,
    message: 'Assinatura criada com sucesso',
    data: {
      subscription: {
        id: subscription.id,
        sport: subscription.sport,
        planName: subscription.planName,
        monthlyQuota: subscription.monthlyQuota,
        biWeeklyQuota: subscription.biWeeklyQuota
      },
      apiKey
    }
  }, 201)
})


app.post('/rotate-key', async (c) => {
  const apiKey = c.req.header('x-api-key')

  if (!apiKey) {
    return c.json({
      success: false,
      error: 'API Key não fornecida'
    }, 401)
  }

  const existingKey = await prisma.apiKey.findUnique({
    where: { key: apiKey },
    include: { subscription: true }
  })

  if (!existingKey) {
    return c.json({
      success: false,
      error: 'API Key inválida'
    }, 401)
  }

  
  await prisma.apiKey.update({
    where: { id: existingKey.id },
    data: { isActive: false }
  })

  
  const newKey = `br_${existingKey.subscription.sport}_${Buffer.from(existingKey.subscriptionId + Date.now().toString()).toString('base64url').slice(0, 20)}`
  
  const newApiKey = await prisma.apiKey.create({
    data: {
      key: newKey,
      subscriptionId: existingKey.subscriptionId
    }
  })

  return c.json({
    success: true,
    message: 'API Key rotacionada com sucesso',
    data: {
      oldKey: apiKey,
      newKey: newApiKey.key,
      invalidatedAt: new Date().toISOString()
    }
  })
})

export const authRoutes = app
