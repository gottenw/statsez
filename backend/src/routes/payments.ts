import { Hono } from 'hono';
import { processPayment, getPayment } from '../services/mercadopago.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const app = new Hono();

app.post('/process', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId = 'anonymous';

    if (token) {
      try {
        const decoded: any = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        userId = decoded.userId;
      } catch (err) {
        console.warn('Token de pagamento inválido, processando como anônimo');
      }
    }

    const body = await c.req.json();
    console.log('Iniciando processamento de pagamento para usuário:', userId);
    
    const result = await processPayment({
      ...body,
      external_reference: `${userId}|${body.planName || 'dev'}|${body.sport || 'football'}`
    });
    
    // Vincular o pagamento ao usuário real (sem subscription ainda)
    await prisma.payment.create({
      data: {
        amount: result.transaction_amount || 0,
        status: result.status || 'pending',
        provider: 'mercadopago',
        providerId: String(result.id),
        subscriptionId: null, // Será atualizado quando o webhook confirmar
        userId: userId,
      }
    });

    return c.json({
      success: true,
      status: result.status,
      status_detail: result.status_detail,
      id: result.id
    });
  } catch (error: any) {
    console.error('ERRO MERCADO PAGO:', error.message, error.stack);
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

    const topic = query.type || body.type;
    const id = query['data.id'] || (body.data && body.data.id);

    if (topic === 'payment' && id) {
      const paymentData = await getPayment(id);
      
      // Atualiza o pagamento local
      await prisma.payment.updateMany({
        where: { providerId: String(id) },
        data: {
          status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
          paidAt: paymentData.status === 'approved' ? new Date() : null,
        }
      });

      // Se foi aprovado e tem external_reference, cria a subscription
      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const [userId, planName, sport] = paymentData.external_reference.split('|');
        
        if (userId && userId !== 'anonymous') {
          // Busca o pagamento local
          const localPayment = await prisma.payment.findFirst({
            where: { providerId: String(id) }
          });

          if (localPayment) {
            // Verifica se já tem subscription ativa para este usuário
            const existingSub = await prisma.subscription.findFirst({
              where: { userId, isActive: true }
            });

            if (!existingSub) {
              // Configurações dos planos
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

              // Cria a subscription
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

              // Cria a API key
              const apiKey = `se_live_${Buffer.from(subscription.id + Date.now()).toString('base64url').slice(0, 32)}`;
              await prisma.apiKey.create({
                data: {
                  key: apiKey,
                  subscriptionId: subscription.id,
                  isActive: true
                }
              });

              // Atualiza o pagamento com o subscriptionId
              await prisma.payment.update({
                where: { id: localPayment.id },
                data: { subscriptionId: subscription.id }
              });

              console.log(`✅ Assinatura ${subscription.id} criada via webhook para usuário ${userId}`);
            }
          }
        }
      }
    }

    return c.json({ received: true }, 200);
  } catch (error) {
    console.error('Erro no Webhook:', error);
    return c.json({ received: true }, 200);
  }
});

export const paymentRoutes = app;
