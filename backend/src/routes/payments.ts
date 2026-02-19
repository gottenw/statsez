import { Hono } from 'hono';
import { processPayment } from '../services/mercadopago.js';

const app = new Hono();

app.post('/process', async (c) => {
  try {
    const body = await c.req.json();
    const result = await processPayment(body);
    
    return c.json({
      success: true,
      status: result.status,
      status_detail: result.status_detail,
      id: result.id
    });
  } catch (error: any) {
    return c.json({
      success: false,
      error: error.message
    }, 400);
  }
});

export const paymentRoutes = app;
