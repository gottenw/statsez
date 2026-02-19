import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'

const app = new Hono()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

// ============================================
// SCHEMAS DE VALIDAÇÃO
// ============================================

const googleAuthSchema = z.object({
  idToken: z.string()
})

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
})

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[A-Z]/, 'Senha deve conter pelo menos uma letra maiúscula')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  name: z.string().optional()
})

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

async function createFreeSubscription(userId: string) {
  const now = new Date()
  const expiresAt = new Date(now)
  expiresAt.setDate(expiresAt.getDate() + 30)
  
  const cycleEndDate = new Date(now)
  cycleEndDate.setDate(cycleEndDate.getDate() + 15)

  // Cria assinatura free
  const subscription = await prisma.subscription.create({
    data: {
      userId,
      sport: 'football',
      planName: 'free',
      monthlyQuota: 500,
      biWeeklyQuota: 500, // Free tem quota única de 500
      startsAt: now,
      expiresAt,
      cycleStartDate: now,
      cycleEndDate,
      isActive: true,
    }
  })

  const apiKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`

  await prisma.apiKey.create({
    data: {
      key: apiKey,
      subscriptionId: subscription.id,
      isActive: true
    }
  })

  return { subscription, apiKey }
}

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

    let isNewUser = false
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name,
          googleId: payload.sub
        }
      })
      isNewUser = true
    } else if (!user.googleId) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { googleId: payload.sub }
      })
    }

    // Se for novo usuário ou não tiver assinatura ativa, cria plano free
    let subscription = null
    let apiKey = null
    
    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, isActive: true },
      include: { apiKey: true }
    })

    if (!existingSubscription) {
      const freeSub = await createFreeSubscription(user.id)
      subscription = freeSub.subscription
      apiKey = freeSub.apiKey
    } else {
      subscription = existingSubscription
      apiKey = existingSubscription.apiKey
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        token,
        subscription: {
          planName: subscription.planName,
          apiKey: typeof apiKey === 'object' && apiKey !== null ? (apiKey as any).key : null
        }
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

  if (!user || !user.passwordHash) {
    return c.json({ success: false, error: 'Credenciais inválidas' }, 401)
  }

  const isValidPassword = await bcrypt.compare(password, user.passwordHash)
  if (!isValidPassword) {
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
    const passwordHash = await bcrypt.hash(password, 12)

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name
      }
    })

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '24h' }
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
    return c.json({ success: false, error: 'Erro interno' }, 500)
  }
})

export const authRoutes = app
