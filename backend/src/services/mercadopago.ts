import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ 
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '' 
});

const payment = new Payment(client);

export async function processPayment(body: any) {
  try {
    const result = await payment.create({
      body: {
        transaction_amount: body.transaction_amount,
        token: body.token,
        description: body.description,
        installments: body.installments,
        payment_method_id: body.payment_method_id,
        issuer_id: body.issuer_id,
        external_reference: body.external_reference, // Importante para identificar o usuário/plano
        payer: {
          email: body.payer.email,
          identification: {
            type: body.payer.identification.type,
            number: body.payer.identification.number,
          },
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
