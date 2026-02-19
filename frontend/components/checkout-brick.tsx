"use client";

import { initMercadoPago, Payment } from "@mercadopago/sdk-react";
import { getUser, getToken } from "../lib/api";

initMercadoPago(process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || "");

interface CheckoutBrickProps {
  amount: number;
  description: string;
  planName?: string;
  sport?: string;
  onSuccess?: (id: string) => void;
  onError?: (error: any) => void;
}

export function CheckoutBrick({ amount, description, planName = "dev", sport = "football", onSuccess, onError }: CheckoutBrickProps) {
  const initialization = {
    amount: amount,
  };

  const customization: any = {
    paymentMethods: {
      ticket: "none",
      bankTransfer: "all", // PIX in Brazil
      creditCard: "none",
      debitCard: "none",
      mercadoPago: "none",
    },
    visual: {
      style: {
        theme: "flat",
        customVariables: {
          borderRadiusMedium: "0px",
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
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";
    const user = getUser();
    const token = getToken();
    
    const externalReference = user ? `${user.id}|${planName}|${sport}` : `${planName}|${sport}`;
    
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    
    // Adiciona o token se existir
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    return new Promise((resolve, reject) => {
      fetch(`${apiUrl}/payments/process`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          ...formData,
          description,
          external_reference: externalReference,
          planName,
          sport,
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
        onReady={() => {}}
        onError={(error) => onError?.(error)}
      />
    </div>
  );
}
