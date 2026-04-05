import type { MiddlewareHandler } from 'hono'
import { getCookie } from 'hono/cookie'
import { prisma } from '../lib/prisma.js'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

export const adminAuth: MiddlewareHandler = async (c, next) => {
  // Tenta cookie httpOnly primeiro, fallback para Authorization header
  let token = getCookie(c, 'statsez_token') || null

  if (!token) {
    const authHeader = c.req.header('authorization')
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1]
    }
  }

  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401)
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; email: string; role: string }
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: { id: true, role: true }
    })

    if (!user || user.role !== 'ADMIN') {
      return c.json({ success: false, error: 'Forbidden: admin only' }, 403)
    }

    c.set('userId', decoded.userId)
    await next()
  } catch {
    return c.json({ success: false, error: 'Invalid token' }, 401)
  }
}
