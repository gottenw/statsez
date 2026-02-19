import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';

const app = new Hono();

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

// Middleware para verificar JWT
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

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
    include: {
      subscriptions: {
        include: { apiKey: true },
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

    // Gera nova key
    const newKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;

    const updatedKey = await prisma.apiKey.upsert({
      where: { subscriptionId: sub.id },
      update: { key: newKey, isActive: true, createdAt: new Date() },
      create: { key: newKey, subscriptionId: sub.id, isActive: true }
    });

    return c.json({ success: true, data: { key: updatedKey.key } });
  } catch (error: any) {
    console.error('[Rotate] Erro na rotação de chave');
    return c.json({ success: false, error: 'Erro ao rotacionar chave' }, 500);
  }
});

app.get('/payments', async (c) => {
  const userId = c.get('userId');

  const payments = await prisma.payment.findMany({
    where: { userId },
    include: { subscription: { select: { planName: true, sport: true } } },
    orderBy: { createdAt: 'desc' }
  });

  return c.json({ success: true, data: payments });
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
        const apiKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
        const newKey = await prisma.apiKey.create({
          data: {
            key: apiKey,
            subscriptionId: existingSub.id,
            isActive: true
          }
        });
        return c.json({ success: true, data: { key: newKey.key, subscriptionId: existingSub.id } });
      }
      // Já tem tudo
      return c.json({ success: true, data: { key: existingSub.apiKey.key, subscriptionId: existingSub.id } });
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
        biWeeklyQuota: 500,
        startsAt: now,
        expiresAt,
        cycleStartDate: now,
        cycleEndDate,
        isActive: true,
      }
    });

    const apiKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
    
    const newKey = await prisma.apiKey.create({
      data: {
        key: apiKey,
        subscriptionId: subscription.id,
        isActive: true
      }
    });

    return c.json({ success: true, data: { key: newKey.key, subscriptionId: subscription.id } });
  } catch (error: any) {
    console.error('[Generate] Erro ao gerar chave');
    return c.json({ success: false, error: 'Erro ao gerar chave' }, 500);
  }
});

export const userRoutes = app;
