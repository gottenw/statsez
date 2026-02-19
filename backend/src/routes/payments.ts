import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import crypto from 'crypto';
import { processPayment, getPayment } from '../services/mercadopago.js';
import { prisma } from '../lib/prisma.js';
import jwt from 'jsonwebtoken';

const app = new Hono();

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

const WEBHOOK_SECRET = process.env.MERCADOPAGO_WEBHOOK_SECRET || '';

// Schema de validação para pagamentos
const paymentSchema = z.object({
  transaction_amount: z.number().positive(),
  token: z.string().min(1),
  payment_method_id: z.string().min(1),
  installments: z.number().int().positive().optional(),
  issuer_id: z.string().optional(),
  description: z.string().optional(),
  planName: z.enum(['dev', 'enterprise', 'gold']),
  sport: z.enum(['football', 'basketball', 'tennis', 'hockey']).default('football'),
  payer: z.object({
    email: z.string().email(),
    identification: z.object({
      type: z.string().min(1),
      number: z.string().min(1),
    }),
  }),
});

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

  const apiKey = `se_live_${crypto.randomBytes(32).toString('base64url')}`;
  await prisma.apiKey.create({
    data: {
      key: apiKey,
      subscriptionId: subscription.id,
      isActive: true
    }
  });

  return { subscription, apiKey };
}

app.post('/process', async (c) => {
  try {
    const authHeader = c.req.header('Authorization');
    const token = authHeader?.replace('Bearer ', '');
    let userId: string | null = null;

    if (token) {
      try {
        const decoded: any = jwt.verify(token, JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true }
        });
        if (user) {
          userId = user.id;
        }
      } catch (err) {
        // Token inválido - continua como guest
      }
    }

    // Requer autenticação para pagamento
    if (!userId) {
      return c.json({ success: false, error: 'Autenticação necessária para processar pagamento' }, 401);
    }

    const body = await c.req.json();

    // Validação do payload
    const parsed = paymentSchema.safeParse(body);
    if (!parsed.success) {
      return c.json({ success: false, error: 'Dados de pagamento inválidos' }, 400);
    }

    const validated = parsed.data;

    const result = await processPayment({
      transaction_amount: validated.transaction_amount,
      token: validated.token,
      payment_method_id: validated.payment_method_id,
      installments: validated.installments,
      issuer_id: validated.issuer_id,
      description: validated.description,
      payer: validated.payer,
      external_reference: `${userId}|${validated.planName}|${validated.sport}`
    });

    let subscription = null;
    let apiKey = null;

    if (result.status === 'approved') {
      try {
        const subResult = await createSubscriptionForUser(
          userId,
          validated.planName,
          validated.sport
        );
        subscription = subResult.subscription;
        apiKey = subResult.apiKey;
      } catch (subErr: any) {
        console.error('[Payment] Erro ao criar subscription');
      }
    }

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
    console.error('[Payment] Erro no processamento');
    return c.json({
      success: false,
      error: 'Erro ao processar pagamento'
    }, 400);
  }
});

app.post('/webhook', async (c) => {
  try {
    // Validação de assinatura do Mercado Pago
    if (WEBHOOK_SECRET) {
      const xSignature = c.req.header('x-signature') || '';
      const xRequestId = c.req.header('x-request-id') || '';

      // Extrai ts e v1 do header x-signature
      const parts: Record<string, string> = {};
      xSignature.split(',').forEach((part) => {
        const [key, value] = part.split('=').map(s => s.trim());
        if (key && value) parts[key] = value;
      });

      const ts = parts['ts'];
      const v1 = parts['v1'];

      if (ts && v1) {
        const query = c.req.query();
        const dataId = query['data.id'] || '';

        // Monta o template conforme documentação do Mercado Pago
        const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;
        const hmac = crypto
          .createHmac('sha256', WEBHOOK_SECRET)
          .update(manifest)
          .digest('hex');

        if (hmac !== v1) {
          return c.json({ error: 'Invalid signature' }, 401);
        }
      }
    }

    const query = c.req.query();
    const body = await c.req.json();

    const topic = query.type || body.type;
    const id = query['data.id'] || (body.data && body.data.id);

    if (topic === 'payment' && id) {
      const paymentData = await getPayment(id);

      await prisma.payment.updateMany({
        where: { providerId: String(id) },
        data: {
          status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
          paidAt: paymentData.status === 'approved' ? new Date() : null,
        }
      });

      if (paymentData.status === 'approved' && paymentData.external_reference) {
        const refParts = paymentData.external_reference.split('|');
        const userId = refParts[0];
        const planName = refParts[1] || 'dev';
        const sport = refParts[2] || 'football';

        // Valida que planName é um plano válido
        const validPlans = ['dev', 'enterprise', 'gold'];
        if (!validPlans.includes(planName)) {
          return c.json({ received: true }, 200);
        }

        if (userId && userId !== 'guest' && userId !== 'anonymous') {
          const user = await prisma.user.findUnique({
            where: { id: userId }
          });

          if (user) {
            const existingSub = await prisma.subscription.findFirst({
              where: {
                userId,
                isActive: true,
                planName: planName
              }
            });

            if (!existingSub) {
              const { subscription } = await createSubscriptionForUser(userId, planName, sport);

              await prisma.payment.updateMany({
                where: { providerId: String(id) },
                data: { subscriptionId: subscription.id }
              });
            }
          }
        }
      }
    }

    return c.json({ received: true }, 200);
  } catch (error: any) {
    console.error('[Webhook] Erro no processamento');
    return c.json({ received: true }, 200);
  }
});

export const paymentRoutes = app;
