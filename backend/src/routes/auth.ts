import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'

const app = new Hono()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const googleAuthSchema = z.object({
  idToken: z.string()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional()
})

const createSubscriptionSchema = z.object({
  sport: z.enum(['football', 'basketball', 'tennis', 'hockey']),
  planName: z.string(),
  monthlyQuota: z.number().min(100)
})

// ============================================
// ROTAS DE AUTENTICAÇÃO
// ============================================

// Login via Google
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

// Login via Email/Senha
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

// Registro manual
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
    }, 201)
  } catch (err: any) {
    if (err.code === 'P2002') {
      return c.json({ success: false, error: 'Email já cadastrado' }, 409)
    }
    return c.json({ success: false, error: err.message }, 500)
  }
})

// Criar assinatura manual
app.post('/subscription', zValidator('json', createSubscriptionSchema), async (c) => {
  const { sport, planName, monthlyQuota } = c.req.valid('json')
  const userId = c.req.header('x-user-id') 

  if (!userId) {
    return c.json({ success: false, error: 'Usuário não autenticado' }, 401)
  }

  try {
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

    const apiKey = `se_live_${Buffer.from(subscription.id + Date.now()).toString('base64url').slice(0, 24)}`
    
    await prisma.apiKey.create({
      data: {
        key: apiKey,
        subscriptionId: subscription.id
      }
    })

    return c.json({
      success: true,
      data: { subscription, apiKey }
    }, 201)
  } catch (err: any) {
    return c.json({ success: false, error: err.message }, 500)
  }
})

export const authRoutes = app