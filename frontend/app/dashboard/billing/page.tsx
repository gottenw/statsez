"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { getUserInfo, getPayments } from "../../../lib/api";
import { CheckoutBrick } from "../../../components/checkout-brick";
import { X, Check, Zap, AlertCircle, Calendar, CreditCard } from "lucide-react";

const PLANS = [
  {
    id: "dev",
    name: "Dev",
    description: "Para desenvolvedores e projetos em teste",
    requests: 40000,
    biweekly: 20000,
    price: 79.00,
    pricePerReq: "0,0019",
    featured: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    description: "Para startups e aplicações em produção",
    requests: 250000,
    biweekly: 125000,
    price: 349.00,
    pricePerReq: "0,0013",
    featured: false,
  },
  {
    id: "gold",
    name: "Gold",
    description: "Para alto volume e aplicações críticas",
    requests: 600000,
    biweekly: 300000,
    price: 699.00,
    pricePerReq: "0,0011",
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
  startsAt: string;
  expiresAt: string;
  cycleStartDate: string;
  cycleEndDate: string;
  isActive: boolean;
  apiKey?: {
    key: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  provider: string;
  paidAt: string;
  subscription: {
    planName: string;
    sport: string;
  };
}

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<typeof PLANS[0] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
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
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR");
  };

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-6xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-32 bg-foreground/5 border border-border" />
          <div className="grid grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-96 bg-foreground/5 border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-6xl mx-auto space-y-16">
      {/* Header */}
      <header className="border-b border-border pb-8">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Billing & Plans
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          Gerenciar Assinatura
        </h1>
      </header>

      {/* Current Subscription */}
      {subscription ? (
        <section className="border border-border bg-background">
          <div className="p-8 border-b border-border bg-foreground/[0.02]">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-mono text-xs uppercase text-muted-foreground tracking-widest">
                  Plano Atual
                </span>
                <h2 className="font-sans text-2xl uppercase tracking-tight mt-1">
                  {subscription.planName}
                </h2>
              </div>
              <div className="text-right">
                <span className={`font-mono text-sm ${getDaysRemaining(subscription.expiresAt) < 7 ? "text-red-500" : "text-green-500"}`}>
                  {getDaysRemaining(subscription.expiresAt)} dias restantes
                </span>
                <p className="font-mono text-xs text-muted-foreground">
                  Expira em {formatDate(subscription.expiresAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <span className="font-mono text-xs uppercase text-muted-foreground">Quota Mensal</span>
              <p className="font-sans text-2xl mt-2">{subscription.monthlyQuota.toLocaleString()}</p>
              <p className="font-mono text-xs text-muted-foreground">requisições</p>
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-muted-foreground">Uso Quinzenal</span>
              <p className="font-sans text-2xl mt-2">
                {subscription.currentUsage.toLocaleString()} / {subscription.biWeeklyQuota.toLocaleString()}
              </p>
              <div className="mt-2 h-2 bg-foreground/10 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(subscription.currentUsage / subscription.biWeeklyQuota) * 100}%` }}
                  className="h-full bg-foreground"
                />
              </div>
            </div>
            <div>
              <span className="font-mono text-xs uppercase text-muted-foreground">Próximo Ciclo</span>
              <p className="font-sans text-2xl mt-2">{formatDate(subscription.cycleEndDate)}</p>
              <p className="font-mono text-xs text-muted-foreground">reset da quota</p>
            </div>
          </div>
        </section>
      ) : (
        <section className="border border-border p-8 text-center">
          <Zap className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-sans text-xl uppercase">Nenhuma Assinatura Ativa</h3>
          <p className="font-mono text-xs text-muted-foreground mt-2">
            Escolha um plano abaixo para começar
          </p>
        </section>
      )}

      {/* Available Plans */}
      <section className="space-y-8">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Planos Disponíveis
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`border border-border bg-background relative flex flex-col ${
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

              <div className="p-8 flex-1">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-sans text-2xl uppercase tracking-tight">{plan.name}</h3>
                    <p className="font-mono text-xs text-muted-foreground mt-2">{plan.description}</p>
                  </div>

                  <div className="border-t border-border pt-6">
                    <div className="flex items-baseline gap-1">
                      <span className="font-mono text-4xl font-medium tracking-tighter">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">/mês</span>
                    </div>
                    <p className="font-mono text-xs text-muted-foreground mt-1">
                      R$ {plan.pricePerReq} por requisição
                    </p>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border">
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="font-mono text-sm">{plan.requests.toLocaleString()} requisições/mês</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="font-mono text-sm">{plan.biweekly.toLocaleString()} quota quinzenal</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="font-mono text-sm">Acesso a todos os esportes</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check size={16} className="text-green-500" />
                      <span className="font-mono text-sm">Suporte técnico</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border">
                <button
                  onClick={() => setSelectedPlan(plan)}
                  disabled={subscription?.planName.toLowerCase() === plan.id}
                  className={`w-full font-mono text-xs font-bold uppercase tracking-[0.2em] border py-4 transition-all duration-300 ${
                    subscription?.planName.toLowerCase() === plan.id
                      ? "border-green-500 text-green-500 cursor-default"
                      : "border-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  {subscription?.planName.toLowerCase() === plan.id ? "Plano Atual" : "Assinar"}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Payment History */}
      <section className="space-y-6">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Histórico de Pagamentos
        </h2>

        {payments.length > 0 ? (
          <div className="border border-border overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-foreground/[0.03] border-b border-border">
                  <th className="p-4 font-mono text-xs uppercase tracking-widest">Plano</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-widest">Data</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-widest">Valor</th>
                  <th className="p-4 font-mono text-xs uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-foreground/[0.01]">
                    <td className="p-4">
                      <span className="font-mono text-sm">
                        {payment.subscription?.planName} ({payment.subscription?.sport})
                      </span>
                    </td>
                    <td className="p-4 font-mono text-sm text-muted-foreground">
                      {formatDate(payment.paidAt || payment.id)}
                    </td>
                    <td className="p-4 font-mono text-sm">
                      {formatCurrency(payment.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <span className={`font-mono text-[10px] uppercase px-3 py-1 border ${
                        payment.status === "paid" 
                          ? "border-green-500 text-green-500" 
                          : "border-yellow-500 text-yellow-500"
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="border border-border p-8 text-center">
            <CreditCard className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="font-mono text-sm text-muted-foreground">Nenhum pagamento encontrado</p>
          </div>
        )}
      </section>

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
              <div className="p-6 border-b border-border flex justify-between items-center">
                <div>
                  <h3 className="font-sans text-xl uppercase">Assinar {selectedPlan.name}</h3>
                  <p className="font-mono text-xs text-muted-foreground">
                    {formatCurrency(selectedPlan.price)}/mês
                  </p>
                </div>
                <button
                  onClick={() => setSelectedPlan(null)}
                  className="p-2 hover:bg-foreground/5"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 bg-white">
                <CheckoutBrick
                  amount={selectedPlan.price}
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
