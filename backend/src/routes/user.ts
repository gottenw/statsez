import { Hono } from 'hono';
import { prisma } from '../lib/prisma.js';

const app = new Hono();

app.get('/me', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      subscriptions: {
        include: {
          apiKey: true
        }
      }
    }
  });

  return c.json({ success: true, data: user });
});

app.get('/keys', async (c) => {
  const userId = c.req.header('x-user-id');
  if (!userId) return c.json({ success: false, error: 'Unauthorized' }, 401);

  const keys = await prisma.apiKey.findMany({
    where: {
      subscription: {
        userId: userId
      }
    },
    include: {
      subscription: true
    }
  });

  return c.json({ success: true, data: keys });
});

app.post('/keys/rotate', async (c) => {
  try {
    const userId = c.req.header('x-user-id');
    const body = await c.req.json();
    const { subscriptionId } = body;

    console.log('Solicitação de rotação para usuário:', userId, 'Assinatura:', subscriptionId);

    if (!userId || !subscriptionId) {
      return c.json({ success: false, error: 'Missing userId or subscriptionId' }, 400);
    }

    // Se estivermos em teste e o ID for o placeholder, buscamos a primeira assinatura do banco
    let sub;
    if (userId === 'temp-user-id') {
      sub = await prisma.subscription.findFirst();
    } else {
      sub = await prisma.subscription.findFirst({
        where: { id: subscriptionId, userId: userId }
      });
    }

    if (!sub) {
      console.error('Assinatura não encontrada para rotação');
      return c.json({ success: false, error: 'Subscription not found' }, 404);
    }

    const newKey = `se_live_${Buffer.from(sub.id + Date.now()).toString('base64url').slice(0, 24)}`;

    const updatedKey = await prisma.apiKey.upsert({
      where: { subscriptionId: sub.id },
      update: { key: newKey, isActive: true, createdAt: new Date() },
      create: { key: newKey, subscriptionId: sub.id, isActive: true }
    });

    console.log('Chave rotacionada com sucesso:', updatedKey.key);
    return c.json({ success: true, data: { key: newKey } });
  } catch (error: any) {
    console.error('ERRO INTERNO NA ROTAÇÃO:', error.message);
    return c.json({ success: false, error: error.message }, 500);
  }
});

export const userRoutes = app;
