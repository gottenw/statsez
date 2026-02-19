"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../../../lib/auth-context";
import { CheckoutBrick } from "../../../components/checkout-brick";
import { X, Lock, Check, Zap } from "lucide-react";

const plans = [
  {
    id: "dev",
    name: "Dev",
    requests: "40.000",
    biweekly: "20.000",
    price: "79,00",
    pricePerReq: "0,0019",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    requests: "250.000",
    biweekly: "125.000",
    price: "349,00",
    pricePerReq: "0,0013",
    featured: false,
  },
  {
    id: "gold",
    name: "Gold",
    requests: "600.000",
    biweekly: "300.000",
    price: "699,00",
    pricePerReq: "0,0011",
    featured: false,
  },
];

// Mock de faturas - depois virá da API
const mockInvoices = [
  { id: "INV-88294-01", date: "2026-02-01", amount: "79,00", status: "PAID", method: "PIX_GATEWAY" },
];

export default function BillingPage() {
  const { user, isLoggedIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    // Pega o token do localStorage para debug/testes
    const storedToken = localStorage.getItem("statsez_token");
    setToken(storedToken);
    console.log("[Billing] Token:", storedToken);
  }, []);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    setSelectedPlan(plan);
  };

  // Testa o token fazendo uma chamada para a API
  const testToken = async () => {
    if (!token) {
      alert("Nenhum token encontrado!");
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/user/me`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        alert("Token válido! Usuário: " + JSON.stringify(data));
      } else {
        alert("Token inválido ou expirado. Status: " + res.status);
      }
    } catch (err) {
      alert("Erro ao testar token: " + err);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      <header className="border-b border-border pb-12">
        <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">
          FINANCIAL_RECORDS
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          Billing_&_Subscriptions
        </h1>
        
        {/* Debug - Token Info */}
        {token && (
          <div className="mt-4 p-4 border border-border bg-foreground/[0.02]">
            <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
              Auth Token (Debug)
            </p>
            <p className="font-mono text-xs mt-2 truncate text-foreground/60">
              {token.slice(0, 50)}...
            </p>
            <button
              onClick={testToken}
              className="mt-2 font-mono text-[10px] uppercase tracking-widest border border-border px-3 py-2 hover:bg-foreground hover:text-background transition-all"
            >
              Testar Token
            </button>
          </div>
        )}
      </header>

      {/* Current Plan Status */}
      <div className="border border-border p-10 bg-background grid grid-cols-1 md:grid-cols-3 gap-12 items-center shadow-sm">
        <div>
          <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">
            Current_License
          </span>
          <h3 className="font-sans text-2xl font-medium uppercase mt-2 tracking-tight">
            Free_Tier
          </h3>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            500 requests / month
          </p>
        </div>
        <div>
          <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">
            Status
          </span>
          <div className="flex items-center gap-2 mt-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <p className="font-mono text-base uppercase font-bold text-foreground">
              Active
            </p>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <span className="text-xs font-mono font-bold text-foreground/40 uppercase tracking-widest">
            User
          </span>
          <p className="font-mono text-sm text-foreground">
            {user?.email || "Not logged in"}
          </p>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <span className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-[0.2em]">
            AVAILABLE_PLANS
          </span>
          <span className="font-mono text-xs text-muted-foreground">
            Upgrade your capacity
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <motion.div
              key={plan.id}
              whileHover={{ y: -4 }}
              className={`border border-border p-8 bg-background relative ${
                plan.featured ? "border-foreground/30" : ""
              }`}
            >
              {plan.featured && (
                <div className="absolute top-0 right-0 bg-foreground text-background px-3 py-1">
                  <span className="font-mono text-[9px] uppercase tracking-widest font-bold">
                    Popular
                  </span>
                </div>
              )}

              <div className="space-y-6">
                <div>
                  <h3 className="font-sans text-xl font-medium uppercase tracking-tight">
                    {plan.name}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground mt-1">
                    {plan.requests} requests / month
                  </p>
                </div>

                <div className="border-t border-border pt-6">
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-medium tracking-tighter">
                      R$ {plan.price}
                    </span>
                    <span className="font-mono text-xs text-muted-foreground">/mês</span>
                  </div>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest mt-1">
                    R$ {plan.pricePerReq} /req
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-border">
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    <span className="font-mono text-xs">{plan.requests} requests</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    <span className="font-mono text-xs">{plan.biweekly} bi-weekly quota</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check size={14} className="text-green-500" />
                    <span className="font-mono text-xs">All sports included</span>
                  </div>
                </div>

                <button
                  onClick={() => handlePlanSelect(plan)}
                  className="w-full font-mono text-[10px] font-bold uppercase tracking-[0.2em] border border-border py-4 hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  Subscribe
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Transaction History */}
      <div className="space-y-6">
        <span className="text-xs font-mono font-bold text-foreground/50 uppercase tracking-[0.2em]">
          TRANSACTION_HISTORY
        </span>
        <div className="border border-border overflow-hidden bg-background shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-foreground/[0.03] border-b border-border">
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  Entry_ID
                </th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  Date
                </th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  Amount
                </th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                  Provider
                </th>
                <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold text-right">
                  Verification
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {mockInvoices.length > 0 ? (
                mockInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-foreground/[0.01] transition-colors">
                    <td className="p-6 font-mono text-sm font-medium">{inv.id}</td>
                    <td className="p-6 font-mono text-sm text-muted-foreground">{inv.date}</td>
                    <td className="p-6 font-mono text-base font-bold text-foreground">
                      R$ {inv.amount}
                    </td>
                    <td className="p-6 font-mono text-xs text-muted-foreground font-bold uppercase">
                      {inv.method}
                    </td>
                    <td className="p-6 text-right">
                      <span className="font-mono text-[10px] font-bold border border-blue-600 text-blue-600 px-3 py-1 uppercase tracking-widest">
                        {inv.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="p-12 text-center">
                    <p className="font-mono text-sm text-muted-foreground">
                      No transactions found
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal de Checkout */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-3xl bg-background border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Close Button */}
              <div className="absolute top-0 right-0 border-l border-b border-border z-[110]">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-3 text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Header */}
              <div className="p-8 border-b border-border bg-foreground/[0.01]">
                <div className="flex items-center gap-4 mb-4">
                  <span className="data-label text-[10px] opacity-50">SECURE_GATEWAY</span>
                  <div className="h-px flex-1 bg-border/50" />
                </div>

                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="font-sans text-xl font-medium uppercase tracking-tight text-foreground">
                      {selectedPlan.name} Plan
                    </h3>
                    <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                      Monthly Data Access License
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="font-mono text-2xl font-medium tracking-tighter">
                      R$ {selectedPlan.price}
                    </span>
                    <p className="font-mono text-[9px] text-muted-foreground uppercase">
                      Billed Monthly
                    </p>
                  </div>
                </div>
              </div>

              {/* Checkout Area */}
              <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
                <CheckoutBrick
                  amount={parseFloat(selectedPlan.price.replace(".", "").replace(",", "."))}
                  description={`STATSEZ API - ${selectedPlan.name.toUpperCase()}`}
                  onSuccess={(id) => {
                    window.location.href = `/dashboard/welcome?payment_id=${id}`;
                  }}
                />
              </div>

              {/* Footer */}
              <div className="px-8 py-4 border-t border-border bg-foreground/[0.02] flex justify-between items-center">
                <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                  Verified Production Environment
                </span>
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <span className="font-mono text-[9px] text-foreground uppercase tracking-widest font-bold">
                    Encrypted
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
