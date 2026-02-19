import { Hono } from 'hono';
import { processPayment, getPayment } from '../services/mercadopago.js';
import { prisma } from '../lib/prisma.js';

const app = new Hono();

app.post('/process', async (c) => {
  try {
    const body = await c.req.json();
    console.log('Iniciando processamento de pagamento:', body.description);
    const result = await processPayment(body);
    
    await prisma.payment.create({
      data: {
        amount: result.transaction_amount || 0,
        status: result.status || 'pending',
        provider: 'mercadopago',
        providerId: String(result.id),
        subscriptionId: 'temp-sub-id',
        userId: 'temp-user-id',
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
      
      // Atualiza o pagamento no nosso banco
      const updatedPayment = await prisma.payment.updateMany({
        where: { providerId: String(id) },
        data: {
          status: paymentData.status === 'approved' ? 'paid' : paymentData.status,
          paidAt: paymentData.status === 'approved' ? new Date() : null,
        }
      });

      // Lógica de Ativação: Se o pagamento foi aprovado, ativamos a assinatura
      if (paymentData.status === 'approved') {
        const localPayment = await prisma.payment.findFirst({
          where: { providerId: String(id) }
        });

        if (localPayment) {
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
    // Respondemos 200 para o MP não ficar tentando reenviar em caso de erro de lógica
    return c.json({ received: true }, 200);
  }
});

export const paymentRoutes = app;

