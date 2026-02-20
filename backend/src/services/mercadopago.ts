import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

const payment = new Payment(client);

export async function processPayment(body: {
  transaction_amount: number;
  payment_method_id: string;
  token?: string;
  installments?: number;
  issuer_id?: string;
  description?: string;
  external_reference: string;
  payer: { email: string; identification?: { type: string; number: string } };
}) {
  try {
    const result = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        payment_method_id: body.payment_method_id,
        token: body.token,
        installments: body.installments,
        issuer_id: body.issuer_id ? Number(body.issuer_id) : undefined,
        description: body.description,
        external_reference: body.external_reference,
        payer: body.payer,
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
