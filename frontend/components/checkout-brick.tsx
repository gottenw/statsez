"use client";

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
  };

  const customization: any = {
    paymentMethods: {
      ticket: "all",
      bankTransfer: "all",
      creditCard: "all",
      debitCard: "all",
      mercadoPago: "all",
    },
    visual: {
      style: {
        theme: "flat", // Tema minimalista
        customVariables: {
          borderRadiusMedium: "0px", // Brutalista (sem curvas)
          borderRadiusSmall: "0px",
          borderRadiusLarge: "0px",
          formBackgroundColor: "#ffffff",
          baseColor: "#000000",
          accentColor: "#000000",
          inputBackgroundColor: "#ffffff",
          inputFilledBackgroundColor: "#f4f4f5",
          inputFocusedBackgroundColor: "#ffffff",
          buttonTextColor: "#ffffff",
          secondaryColor: "#71717a",
        },
      },
    },
  };

  const onSubmit = async ({ formData }: any) => {
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
    <div className="w-full bg-white font-mono">
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
