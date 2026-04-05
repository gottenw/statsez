"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUserInfo } from "../../../lib/api";
import { MessageCircle } from "lucide-react";

const PLANS = [
  { id: "dev", name: "Dev", requests: "40.000", price: "69,99", featured: true },
  { id: "enterprise", name: "Enterprise", requests: "250.000", price: "219,99", featured: false },
  { id: "gold", name: "Gold", requests: "600.000", price: "499,99", featured: false },
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

export default function BillingPage() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserInfo()
      .then((res) => {
        if (res.success && res.data.subscriptions?.length > 0) {
          setSubscription(res.data.subscriptions[0]);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const formatDate = (d: string) => new Date(d).toLocaleDateString("pt-BR");
  const getDaysRemaining = (d: string) => Math.ceil((new Date(d).getTime() - Date.now()) / 86400000);

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="section-padding py-24">
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
      <div className="section-padding py-16 md:py-24 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">BILLING</span>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline-text">
              Gerencie sua<br />
              <span className="text-muted">Assinatura</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Current Plan */}
      {subscription && (
        <div className="section-padding py-12 md:py-16 border-b border-border">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <div>
              <span className="data-label">PLANO ATUAL</span>
              <h3 className="font-sans text-2xl md:text-4xl font-medium uppercase mt-3 tracking-tight">
                {subscription.planName}
              </h3>
            </div>
            <div>
              <span className="data-label">QUOTA MENSAL</span>
              <p className="font-mono text-2xl md:text-3xl font-medium mt-3 tracking-tighter">
                {subscription.monthlyQuota.toLocaleString()}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-widest">requisições</p>
            </div>
            <div>
              <span className="data-label">DIAS RESTANTES</span>
              <p className={`font-mono text-2xl md:text-3xl font-medium mt-3 tracking-tighter ${getDaysRemaining(subscription.expiresAt) < 7 ? "text-red-500" : ""}`}>
                {getDaysRemaining(subscription.expiresAt)}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-widest">até {formatDate(subscription.expiresAt)}</p>
            </div>
            <div>
              <span className="data-label">USO QUINZENAL</span>
              <p className="font-mono text-2xl md:text-3xl font-medium mt-3 tracking-tighter">
                {subscription.currentUsage.toLocaleString()}
              </p>
              <p className="font-mono text-xs text-muted-foreground mt-1 uppercase tracking-widest">de {subscription.biWeeklyQuota.toLocaleString()}</p>
            </div>
          </div>

          <div className="mt-10">
            <div className="flex justify-between items-center mb-2">
              <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Progresso do Ciclo</span>
              <span className="font-mono text-xs uppercase tracking-widest">{Math.round((subscription.currentUsage / subscription.biWeeklyQuota) * 100)}%</span>
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

      {/* Plans */}
      <div className="section-padding py-16 md:py-24 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">UPGRADE</span>
          </div>
          <div className="md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight">Planos Disponíveis</h3>
          </div>
        </div>

        {PLANS.map((plan, i) => (
          <div key={plan.id} className={`flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 py-8 md:py-12 border-b border-border ${plan.featured ? "bg-foreground/[0.03]" : ""}`}>
            <div className="md:col-span-1 hidden md:block">
              <span className="font-mono text-xl text-muted">0{i + 1}</span>
            </div>
            <div className="md:col-span-3">
              <h4 className="font-sans text-xl md:text-2xl font-medium tracking-tight uppercase">
                {plan.name}
                {plan.featured && <span className="ml-3 text-xs bg-foreground text-background px-2 py-0.5 tracking-widest">POPULAR</span>}
              </h4>
              <p className="font-mono text-sm text-muted-foreground mt-1">{plan.requests} req/mês</p>
            </div>
            <div className="md:col-span-4">
              <span className="font-mono text-2xl md:text-3xl font-medium tracking-tighter">R$ {plan.price}</span>
              <span className="font-mono text-xs text-muted-foreground ml-1">/mês</span>
            </div>
            <div className="md:col-span-4 flex items-center md:justify-end">
              {subscription?.planName.toLowerCase() === plan.id ? (
                <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] bg-data-primary text-background px-8 py-4">ATUAL</span>
              ) : (
                <a
                  href="https://t.me/joaonaithen"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full md:w-auto font-mono text-xs font-bold uppercase tracking-[0.2em] border border-border px-8 py-4 hover:bg-foreground hover:text-background transition-all flex items-center justify-center gap-2"
                >
                  <MessageCircle size={14} />
                  ASSINAR
                </a>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Contact */}
      <div className="section-padding py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">CONTATO</span>
          </div>
          <div className="md:col-span-8">
            <h3 className="font-sans text-2xl font-medium uppercase tracking-tight mb-4">Assinar ou Renovar</h3>
            <p className="font-mono text-sm text-muted-foreground leading-relaxed max-w-xl mb-8">
              Para assinar, fazer upgrade ou renovar, entre em contato via Telegram. Ativação imediata.
            </p>
            <a
              href="https://t.me/joaonaithen"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em] border border-border px-10 py-5 hover:bg-foreground hover:text-background transition-all"
            >
              <MessageCircle size={16} />
              @joaonaithen no Telegram
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
