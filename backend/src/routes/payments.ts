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
    
    const result = await processPayment(body);
    
    // Vincular o pagamento ao usuário real
    await prisma.payment.create({
      data: {
        amount: result.transaction_amount || 0,
        status: result.status || 'pending',
        provider: 'mercadopago',
        providerId: String(result.id),
        subscriptionId: body.planId || 'temp-sub-id',
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
      
      const updatedPayment = await prisma.payment.updateMany({
        where: { providerId: String(id) },
        data: {
          status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
          paidAt: paymentData.status === 'approved' ? new Date() : null,
        }
      });

      if (paymentData.status === 'approved') {
        const localPayment = await prisma.payment.findFirst({
          where: { providerId: String(id) }
        });

        if (localPayment && localPayment.subscriptionId !== 'temp-sub-id') {
          await prisma.subscription.update({
            where: { id: localPayment.subscriptionId },
            data: { isActive: true }
          });
          console.log(`✅ Assinatura ${localPayment.subscriptionId} ativada via Webhook.`);
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