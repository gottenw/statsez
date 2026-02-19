"use client";

import { useEffect } from "react";
import { initMercadoPago, Payment } from "@mercadopago/sdk-react";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "");

interface CheckoutBrickProps {
  amount: number;
  description: string;
  onSuccess?: (id: string) => void;
  onError?: (error: any) => void;
}

export function CheckoutBrick({ amount, description, onSuccess, onError }: CheckoutBrickProps) {
  const initialization = {
    amount: amount,
    preferenceId: "", 
  };

  const customization = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
  };

  const onSubmit = async ({ selectedPaymentMethod, formData }: any) => {
    return new Promise((resolve, reject) => {
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/payments/process`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          description,
        }),
      })
        .then((response) => response.json())
        .then((result) => {
          if (result.success) {
            onSuccess?.(result.id);
            resolve(result);
          } else {
            onError?.(result.error);
            reject(result.error);
          }
        })
        .catch((error) => {
          onError?.(error);
          reject(error);
        });
    });
  };

  return (
    <div className="w-full max-w-[600px] mx-auto bg-background p-6 border border-border">
      <Payment
        initialization={initialization}
        customization={customization}
        onSubmit={onSubmit}
        onReady={() => console.log("Payment Brick ready")}
        onError={(error) => onError?.(error)}
      />
    </div>
  );
}
