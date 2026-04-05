import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { hashApiKey } from '../middleware/auth.js';

const app = new Hono();

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

import { getCookie } from 'hono/cookie';

// Middleware para verificar JWT (cookie httpOnly ou header Authorization)
const authMiddleware = async (c: any, next: any) => {
  // Tenta cookie httpOnly primeiro, fallback para Authorization header
  let token = getCookie(c, 'statsez_token') || null;

  if (!token) {
    const authHeader = c.req.header('authorization');
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
  }

  if (!token) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    c.set('userId', decoded.userId);
    await next();
  } catch (err) {
    return c.json({ success: false, error: 'Invalid token' }, 401);
  }
};

app.use('*', authMiddleware);

app.get('/me', async (c) => {
  const userId = c.get('userId');

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
      subscriptions: {
        include: { apiKey: { select: { id: true, key: true, isActive: true, lastUsedAt: true, createdAt: true } } },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!user) return c.json({ success: false, error: 'User not found' }, 404);
  return c.json({ success: true, data: user });
});

app.get('/keys', async (c) => {
  const userId = c.get('userId');

  const keys = await prisma.apiKey.findMany({
    where: {
      subscription: { userId, isActive: true }
    },
    include: { subscription: true }
  });

  return c.json({ success: true, data: keys });
});

app.post('/keys/rotate', async (c) => {
  try {
    const userId = c.get('userId');
    const { subscriptionId } = await c.req.json();

    if (!subscriptionId) {
      return c.json({ success: false, error: 'Missing subscriptionId' }, 400);
    }

    // Verifica se a assinatura pertence ao usuário
    const sub = await prisma.subscription.findFirst({
      where: { id: subscriptionId, userId }
    });

    if (!sub) {
      return c.json({ success: false, error: 'Subscription not found' }, 404);
    }

    // Gera nova key — armazena hash, retorna raw uma única vez
    const rawKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
    const hashed = hashApiKey(rawKey);

    await prisma.apiKey.upsert({
      where: { subscriptionId: sub.id },
      update: { key: hashed, isActive: true, createdAt: new Date() },
      create: { key: hashed, subscriptionId: sub.id, isActive: true }
    });

    return c.json({ success: true, data: { key: rawKey } });
  } catch (error: any) {
    console.error('[Rotate] Erro na rotação de chave');
    return c.json({ success: false, error: 'Erro ao rotacionar chave' }, 500);
  }
});

// Gerar nova chave (cria plano free se não existir)
app.post('/keys/generate', async (c) => {
  try {
    const userId = c.get('userId');

    // Verifica se já existe assinatura ativa
    const existingSub = await prisma.subscription.findFirst({
      where: { userId, isActive: true },
      include: { apiKey: true }
    });

    if (existingSub) {
      // Se já tem assinatura mas não tem api key, cria uma
      if (!existingSub.apiKey) {
        const rawKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
        const hashed = hashApiKey(rawKey);
        await prisma.apiKey.create({
          data: {
            key: hashed,
            subscriptionId: existingSub.id,
            isActive: true
          }
        });
        return c.json({ success: true, data: { key: rawKey, subscriptionId: existingSub.id } });
      }
      // Já tem key — não podemos mostrar a raw (só temos o hash).
      // O usuário deve usar /keys/rotate para obter uma nova.
      return c.json({ success: true, data: { key: null, subscriptionId: existingSub.id, message: 'Key já existe. Use /keys/rotate para gerar uma nova.' } });
    }

    // Verifica se já teve free antes (evita renovação infinita)
    const hadFreePlan = await prisma.subscription.findFirst({
      where: { userId, planName: 'free' }
    });

    if (hadFreePlan) {
      return c.json({ success: false, error: 'Plano free já utilizado. Entre em contato para assinar um plano.' }, 403);
    }

    // Cria nova subscription free
    const now = new Date();
    const expiresAt = new Date(now);
    expiresAt.setDate(expiresAt.getDate() + 30);
    const cycleEndDate = new Date(now);
    cycleEndDate.setDate(cycleEndDate.getDate() + 15);

    const subscription = await prisma.subscription.create({
      data: {
        userId,
        sport: 'football',
        planName: 'free',
        monthlyQuota: 500,
        biWeeklyQuota: 250,
        startsAt: now,
        expiresAt,
        cycleStartDate: now,
        cycleEndDate,
        isActive: true,
      }
    });

    const rawKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
    const hashed = hashApiKey(rawKey);

    await prisma.apiKey.create({
      data: {
        key: hashed,
        subscriptionId: subscription.id,
        isActive: true
      }
    });

    return c.json({ success: true, data: { key: rawKey, subscriptionId: subscription.id } });
  } catch (error: any) {
    console.error('[Generate] Erro ao gerar chave');
    return c.json({ success: false, error: 'Erro ao gerar chave' }, 500);
  }
});

export const userRoutes = app;
