import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

const payment = new Payment(client);

export async function processPayment(body: {
  transaction_amount: number;
  payment_method_id: 'pix';
  description?: string;
  external_reference: string;
  payer: { email: string };
}) {
  try {
    const result = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        payment_method_id: 'pix',
        description: body.description,
        external_reference: body.external_reference,
        payer: {
          email: body.payer.email,
        },
      }
    });
    return result;
  } catch (error) {
    console.error('Erro ao processar pagamento Mercado Pago');
    throw error;
  }
}

export async function getPayment(paymentId: string) {
  try {
    const result = await payment.get({ id: paymentId });
    return result;
  } catch (error) {
    console.error('Erro ao buscar pagamento Mercado Pago');
    throw error;
  }
}
