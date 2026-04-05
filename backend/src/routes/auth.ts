import { Hono } from 'hono'
import { zValidator } from '@hono/zod-validator'
import { z } from 'zod'
import { prisma } from '../lib/prisma.js'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import crypto from 'crypto'
import { hashApiKey } from '../middleware/auth.js'

import type { Context } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'

const app = new Hono()
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const IS_PROD = process.env.NODE_ENV === 'production'

function setAuthCookie(c: Context, token: string) {
  setCookie(c, 'statsez_token', token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: 'Lax',
    domain: IS_PROD ? '.statsez.com' : undefined, // Compartilha entre statsez.com e api.statsez.com
    path: '/',
    maxAge: 60 * 60 * 24, // 24h
  })
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
      biWeeklyQuota: 250, // 500/mês = 250 por ciclo de 15 dias
      startsAt: now,
      expiresAt,
      cycleStartDate: now,
      cycleEndDate,
      isActive: true,
    }
  })

  const rawKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`
  const hashedKey = hashApiKey(rawKey)

  await prisma.apiKey.create({
    data: {
      key: hashedKey,
      subscriptionId: subscription.id,
      isActive: true
    }
  })

  return { subscription, apiKey: rawKey }
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

    const existingSubscription = await prisma.subscription.findFirst({
      where: { userId: user.id, isActive: true },
      include: { apiKey: true }
    })

    // rawApiKey só é disponível quando criamos uma key nova (não podemos reverter hash)
    let rawApiKey: string | null = null

    if (!existingSubscription) {
      // Verifica se o usuário JÁ teve um plano free antes (evita renovação infinita)
      const hadFreePlan = await prisma.subscription.findFirst({
        where: { userId: user.id, planName: 'free' }
      })

      if (!hadFreePlan) {
        const freeSub = await createFreeSubscription(user.id)
        subscription = freeSub.subscription
        rawApiKey = freeSub.apiKey
      } else {
        // Já usou o free — não cria outro. Retorna a subscription inativa mais recente para contexto.
        subscription = hadFreePlan
      }
    } else {
      subscription = existingSubscription
      rawApiKey = null
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    setAuthCookie(c, token)

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        token,
        isNewUser,
        subscription: {
          planName: subscription.planName,
          apiKey: rawApiKey
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
    { userId: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '24h' }
  )

  setAuthCookie(c, token)

  return c.json({
    success: true,
    data: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
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
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    )

    setAuthCookie(c, token)

    return c.json({
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
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

// Logout — limpa o cookie httpOnly
app.post('/logout', (c) => {
  deleteCookie(c, 'statsez_token', {
    path: '/',
    domain: IS_PROD ? '.statsez.com' : undefined,
  })
  return c.json({ success: true })
})

export const authRoutes = app
