import { Hono } from 'hono';
import { processPayment, getPayment } from '../services/mercadopago.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const app = new Hono();

// Função auxiliar para criar subscription
async function createSubscriptionForUser(userId: string, planName: string, sport: string) {
  const planConfigs: Record<string, { quota: number; price: number }> = {
    dev: { quota: 40000, price: 79 },
    enterprise: { quota: 250000, price: 349 },
    gold: { quota: 600000, price: 699 },
  };

  const config = planConfigs[planName] || planConfigs.dev;
  const now = new Date();
  const expiresAt = new Date(now);
  expiresAt.setDate(expiresAt.getDate() + 30);
  const cycleEndDate = new Date(now);
  cycleEndDate.setDate(cycleEndDate.getDate() + 15);

  // Desativa todas as subscriptions anteriores do usuário
  await prisma.subscription.updateMany({
    where: { userId, isActive: true },
    data: { isActive: false }
  });

  const subscription = await prisma.subscription.create({
    data: {
      userId,
      sport: sport || 'football',
      planName: planName || 'dev',
      monthlyQuota: config.quota,
      biWeeklyQuota: Math.floor(config.quota / 2),
      startsAt: now,
      expiresAt,
      cycleStartDate: now,
      cycleEndDate,
      isActive: true,
    }
  });

  const apiKey = `se_live_${Buffer.from(subscription.id + Date.now()).toString('base64url').slice(0, 32)}`;
  await prisma.apiKey.create({
    data: {
      key: apiKey,
      subscriptionId: subscription.id,
      isActive: true
    }
  });

  console.log(`✅ Subscription criada: ${subscription.id} para user ${userId}`);
  return { subscription, apiKey };
}

app.post('/process', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true }
        });
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        console.warn('Token inválido');
      }
    }

    const body = await c.req.json();
    console.log('[Payment] Processando para user:', userId || 'NÃO_LOGADO');
    
    const result = await processPayment({
      ...body,
      external_reference: userId 
        ? `${userId}|${body.planName || 'dev'}|${body.sport || 'football'}`
        : `guest|${body.planName || 'dev'}|${body.sport || 'football'}`
    });
    
    console.log('[Payment] Resultado MP:', { 
      id: result.id, 
      status: result.status, 
      external_reference: result.external_reference 
    });

    let subscription = null;
    let apiKey = null;

    // Se o pagamento foi aprovado imediatamente, cria a subscription agora
    if (result.status === 'approved' && userId) {
      console.log('[Payment] Pagamento aprovado imediatamente, criando subscription...');
      try {
        const subResult = await createSubscriptionForUser(
          userId, 
          body.planName || 'dev', 
          body.sport || 'football'
        );
        subscription = subResult.subscription;
        apiKey = subResult.apiKey;
      } catch (subErr: any) {
        console.error('[Payment] Erro ao criar subscription:', subErr.message);
      }
    }

    // Salva o pagamento no banco
    if (userId) {
      await prisma.payment.create({
        data: {
          amount: result.transaction_amount || 0,
          status: result.status === 'approved' ? 'paid' : (result.status || 'pending'),
          provider: 'mercadopago',
          providerId: String(result.id),
          subscriptionId: subscription?.id || null,
          userId: userId,
          paidAt: result.status === 'approved' ? new Date() : null,
        }
      });
      console.log('[Payment] Pagamento salvo no banco');
    }

    return c.json({
      success: true,
      status: result.status,
      status_detail: result.status_detail,
      id: result.id,
      subscription: subscription ? {
        planName: subscription.planName,
        apiKey: apiKey
      } : null
    });
  } catch (error: any) {
    console.error('[Payment] ERRO:', error.message);
    return c.json({
      success: false,
      error: error.message
    }, 400);
  }
});

app.post('/webhook', async (c) => {
  try {
    const query = c.req.query();
    const body = await c.req.json();

    console.log('[Webhook] Recebido:', { query, body });

    const topic = query.type || body.type;
    const id = query['data.id'] || (body.data && body.data.id);

    if (topic === 'payment' && id) {
      console.log('[Webhook] Buscando pagamento:', id);
      const paymentData = await getPayment(id);
      console.log('[Webhook] Dados do MP:', { 
        id: paymentData.id, 
        status: paymentData.status,
        external_reference: paymentData.external_reference 
      });
      
      // Atualiza o pagamento local (se existir)
      const updateResult = await prisma.payment.updateMany({
        where: { providerId: String(id) },
        data: {
          status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
          paidAt: paymentData.status === 'approved' ? new Date() : null,
        }
      });
      console.log('[Webhook] Pagamentos atualizados:', updateResult.count);

      // Se foi aprovado e tem external_reference
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const parts = paymentData.external_reference.split('|');
        const userId = parts[0];
        const planName = parts[1] || 'dev';
        const sport = parts[2] || 'football';
        
        console.log('[Webhook] Processando para user:', userId);
        
        if (userId && userId !== 'guest' && userId !== 'anonymous') {
          // Verifica se o usuário existe
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });

          if (user) {
            // Verifica se já tem subscription (pode ter sido criada no /process)
            const existingSub = await prisma.subscription.findFirst({
              where: { 
                userId, 
                isActive: true,
                planName: planName
              }
            });

            if (!existingSub) {
              console.log('[Webhook] Criando subscription via webhook...');
              const { subscription } = await createSubscriptionForUser(userId, planName, sport);

              // Atualiza o pagamento com o subscriptionId
              await prisma.payment.updateMany({
                where: { providerId: String(id) },
                data: { subscriptionId: subscription.id }
              });
            } else {
              console.log('[Webhook] Subscription já existe:', existingSub.id);
            }
          } else {
            console.warn('[Webhook] Usuário não encontrado:', userId);
          }
        }
      }
    }

    return c.json({ received: true }, 200);
  } catch (error: any) {
    console.error('[Webhook] ERRO:', error.message);
    return c.json({ received: true }, 200);
  }
});

export const paymentRoutes = app;
