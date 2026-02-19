"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserInfo, getPayments } from "../../../lib/api";
import { CheckoutBrick } from "../../../components/checkout-brick";

const PLANS = [
  {
    id: "dev",
    name: "Dev",
    requests: "40.000",
    price: "79,00",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    requests: "250.000",
    price: "349,00",
    featured: false,
  },
  {
    id: "gold",
    name: "Gold",
    requests: "600.000",
    price: "699,00",
    featured: false,
  },
];

interface Subscription {
  id: string;
  planName: string;
  sport: string;
  monthlyQuota: number;
  biWeeklyQuota: number;
  currentUsage: number;
  expiresAt: string;
  cycleEndDate: string;
  isActive: boolean;
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  paidAt: string;
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [userData, paymentsData] = await Promise.all([
          getUserInfo(),
          getPayments(),
        ]);

        if (userData.success && userData.data.subscriptions?.length > 0) {
          setSubscription(userData.data.subscriptions[0]);
        }
        if (paymentsData.success) {
          setPayments(paymentsData.data);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-padding py-24 border-b border-border">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-foreground/5 w-32" />
            <div className="h-16 bg-foreground/5 w-96" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">BILLING</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              Gerencie sua<br />
              <span className="text-muted">Assinatura</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Current Plan Status */}
      {subscription && (
        <div className="section-padding py-16 border-b border-border">
          <div className="grid grid-cols-12 gap-8">
            <div className="col-span-12 md:col-span-3">
              <span className="data-label">PLANO ATUAL</span>
              <h3 className="font-sans text-4xl font-medium uppercase mt-4 tracking-tight">
                {subscription.planName}
              </h3>
            </div>
            <div className="col-span-12 md:col-span-3">
              <span className="data-label">QUOTA MENSAL</span>
              <p className="font-mono text-3xl font-medium mt-4 tracking-tighter">
                {subscription.monthlyQuota.toLocaleString()}
              </p>
              <p className="font-mono text-sm text-muted-foreground mt-1 uppercase tracking-widest">
                requisições
              </p>
            </div>
            <div className="col-span-12 md:col-span-3">
              <span className="data-label">DIAS RESTANTES</span>
              <p className={`font-mono text-3xl font-medium mt-4 tracking-tighter ${
                getDaysRemaining(subscription.expiresAt) < 7 ? "text-red-500" : ""
              }`}>
                {getDaysRemaining(subscription.expiresAt)}
              </p>
              <p className="font-mono text-sm text-muted-foreground mt-1 uppercase tracking-widest">
                até {formatDate(subscription.expiresAt)}
              </p>
            </div>
            <div className="col-span-12 md:col-span-3">
              <span className="data-label">USO QUINZENAL</span>
              <p className="font-mono text-3xl font-medium mt-4 tracking-tighter">
                {subscription.currentUsage.toLocaleString()}
              </p>
              <p className="font-mono text-sm text-muted-foreground mt-1 uppercase tracking-widest">
                de {subscription.biWeeklyQuota.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Usage Bar */}
          <div className="mt-12">
            <div className="h-px bg-border mb-4" />
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Progresso do Ciclo Quinzenal
              </span>
              <span className="font-mono text-xs uppercase tracking-widest">
                {Math.round((subscription.currentUsage / subscription.biWeeklyQuota) * 100)}%
              </span>
            </div>
            <div className="h-2 bg-foreground/10 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${(subscription.currentUsage / subscription.biWeeklyQuota) * 100}%` }}
                className="h-full bg-foreground"
                transition={{ duration: 1, delay: 0.5 }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Available Plans */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">UPGRADE</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">
              Planos Disponíveis
            </h3>
          </div>
        </div>

        <div className="space-y-0">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={`grid grid-cols-12 gap-8 py-12 border-b border-border group cursor-default transition-all duration-500 ${
                plan.featured ? "bg-foreground/[0.03]" : "hover:bg-foreground/[0.01]"
              }`}
            >
              <div className="col-span-12 md:col-span-1">
                <span className="font-mono text-xl text-muted group-hover:text-foreground transition-colors duration-500">
                  0{index + 1}
                </span>
              </div>

              <div className="col-span-12 md:col-span-3">
                <h4 className="font-sans text-2xl font-medium tracking-tight uppercase">
                  {plan.name}
                  {plan.featured && (
                    <span className="ml-3 text-xs bg-foreground text-background px-2 py-0.5 align-middle tracking-widest">
                      POPULAR
                    </span>
                  )}
                </h4>
                <p className="font-mono text-sm text-muted-foreground mt-2 uppercase tracking-widest">
                  {plan.requests} req/mês
                </p>
              </div>

              <div className="col-span-12 md:col-span-4">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-2">
                    <span className="data-label text-xs opacity-50">REQUISIÇÕES</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-medium tracking-tighter">
                        {plan.requests}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <span className="data-label text-xs opacity-50">VALIDADE</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-3xl font-medium tracking-tighter text-muted">
                        30
                      </span>
                      <span className="font-mono text-sm text-muted-foreground">dias</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="col-span-12 md:col-span-2">
                <div className="space-y-2">
                  <span className="data-label text-xs opacity-50">INVESTIMENTO</span>
                  <div className="flex items-baseline gap-1">
                    <span className="font-mono text-3xl font-medium tracking-tighter">
                      R$ {plan.price}
                    </span>
                  </div>
                  <p className="font-mono text-xs text-muted-foreground uppercase tracking-widest">
                    /mês
                  </p>
                </div>
              </div>

              <div className="col-span-12 md:col-span-2 flex items-center justify-end">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  disabled={subscription?.planName.toLowerCase() === plan.id}
                  className={`w-full md:w-auto font-mono text-xs font-bold uppercase tracking-[0.2em] border border-border px-10 py-5 transition-all duration-500 whitespace-nowrap ${
                    subscription?.planName.toLowerCase() === plan.id
                      ? "bg-green-500 text-white border-green-500"
                      : "bg-background hover:bg-foreground hover:text-background"
                  }`}
                >
                  {subscription?.planName.toLowerCase() === plan.id ? "ATUAL" : "ASSINAR"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Payment History */}
      <div className="section-padding py-24">
        <div className="grid grid-cols-12 gap-8 mb-16">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">HISTÓRICO</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">
              Pagamentos
            </h3>
          </div>
        </div>

        {payments.length > 0 ? (
          <div className="border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground/[0.03] border-b border-border">
                  <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                    Data
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold">
                    Valor
                  </th>
                  <th className="p-6 font-mono text-xs uppercase tracking-widest text-foreground font-bold text-right">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-foreground/[0.01] transition-colors">
                    <td className="p-6 font-mono text-base">
                      {formatDate(payment.paidAt || payment.id)}
                    </td>
                    <td className="p-6 font-mono text-base font-bold">
                      R$ {payment.amount.toFixed(2).replace(".", ",")}
                    </td>
                    <td className="p-6 text-right">
                      <span className={`font-mono text-xs font-bold border px-3 py-1 uppercase tracking-widest ${
                        payment.status === "paid"
                          ? "border-green-500 text-green-500"
                          : "border-yellow-500 text-yellow-500"
                      }`}>
                        {payment.status === "paid" ? "PAGO" : payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-border p-12 text-center">
            <p className="font-mono text-base text-muted-foreground uppercase tracking-widest">
              Nenhum pagamento encontrado
            </p>
          </div>
        )}
      </div>

      {/* Checkout Modal */}
      <AnimatePresence>
        {selectedPlan && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="relative w-full max-w-2xl bg-background border border-border shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="absolute top-0 right-0 border-l border-b border-border">
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-4 text-foreground hover:bg-foreground hover:text-background transition-all"
                >
                  FECHAR
                </button>
              </div>

              <div className="p-8 border-b border-border">
                <span className="data-label text-xs opacity-50">CHECKOUT</span>
                <h3 className="font-sans text-xl font-medium uppercase tracking-tight mt-2">
                  {selectedPlan.name} Plan
                </h3>
                <p className="font-mono text-sm text-muted-foreground mt-1 uppercase tracking-widest">
                  R$ {selectedPlan.price} / mês
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <CheckoutBrick
                  amount={parseFloat(selectedPlan.price.replace(",", "."))}
                  description={`STATSEZ API - ${selectedPlan.name.toUpperCase()}`}
                  planName={selectedPlan.id}
                  onSuccess={(id) => {
                    window.location.href = `/dashboard/welcome?payment_id=${id}`;
                  }}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
