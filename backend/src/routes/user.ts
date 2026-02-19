import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const app = new Hono();

// Middleware para verificar JWT
const authMiddleware = async (c: any, next: any) => {
  const authHeader = c.req.header('authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return c.json({ success: false, error: 'Unauthorized' }, 401);
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret') as any;
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
    const newKey = `se_live_${Buffer.from(sub.id + Date.now()).toString('base64url').slice(0, 32)}`;

    const updatedKey = await prisma.apiKey.upsert({
      where: { subscriptionId: sub.id },
      update: { key: newKey, isActive: true, createdAt: new Date() },
      create: { key: newKey, subscriptionId: sub.id, isActive: true }
    });

    return c.json({ success: true, data: { key: updatedKey.key } });
  } catch (error: any) {
    console.error('[Rotate] Error:', error.message);
    return c.json({ success: false, error: error.message }, 500);
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

export const userRoutes = app;
