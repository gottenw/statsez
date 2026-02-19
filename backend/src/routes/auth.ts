import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

const app = new Hono()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const googleAuthSchema = z.object({
  idToken: z.string()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

app.post('/google', zValidator('json', googleAuthSchema), async (c) => {
  const { idToken } = c.req.valid('json')

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    if (!payload || !payload.email) {
      return c.json({ success: false, error: 'Token inválido' }, 400)
    }

    let user = await prisma.user.findUnique({
      where: { email: payload.email }
    })

    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub
        }
      })
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub }
      })
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' }
    )

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token
      }
    })
  } catch (error: any) {
    console.error('Erro no Google Auth:', error.message)
    return c.json({ success: false, error: 'Falha na autenticação' }, 401)
  }
})

app.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json')

  const user = await prisma.user.findUnique({
    where: { email }
  })

  if (!user || user.passwordHash !== password) {
    return c.json({ success: false, error: 'Credenciais inválidas' }, 401)
  }

  const token = jwt.sign(
    { userId: user.id, email: user.email },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '7d' }
  )

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      token
    }
  })
})
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
