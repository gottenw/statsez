"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getUserInfo } from "../../lib/api";

interface Subscription {
  planName: string;
  monthlyQuota: number;
  currentUsage: number;
  expiresAt: string;
}

export default function DashboardOverview() {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await getUserInfo();
        if (data.success && data.data.subscriptions?.length > 0) {
          setSubscription(data.data.subscriptions[0]);
        }
      } catch (err) {
        console.error("Erro ao carregar dados:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getDaysRemaining = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - new Date().getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  if (loading) {
    return (
      <div className="p-8 md:p-12 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-8">
          <div className="h-20 bg-foreground/5 border border-border" />
          <div className="grid grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-foreground/5 border border-border" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-16">
      <header>
        <span className="text-base font-bold tracking-[0.2em] text-foreground/50 uppercase">
          Dashboard
        </span>
        <h1 className="text-3xl font-medium uppercase mt-2 tracking-tight">
          Visão Geral
        </h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-border bg-border gap-px">
        <StatItem 
          label="Plano Atual" 
          value={subscription?.planName || "Free"} 
          subValue={subscription ? `${getDaysRemaining(subscription.expiresAt)} dias restantes` : "Ilimitado"} 
        />
        <StatItem 
          label="Quota Mensal" 
          value={subscription?.monthlyQuota.toLocaleString() || "500"} 
          subValue="Requisições disponíveis" 
        />
        <StatItem 
          label="Uso Atual" 
          value={subscription?.currentUsage.toLocaleString() || "0"} 
          subValue="Requisições utilizadas" 
        />
        <StatItem 
          label="Disponível" 
          value={subscription ? (subscription.monthlyQuota - subscription.currentUsage).toLocaleString() : "500"} 
          subValue="Requisições restantes" 
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-8 border border-border bg-foreground/[0.01]">
            <div className="flex justify-between items-center mb-8">
              <span className="text-base font-bold uppercase tracking-[0.2em] text-foreground/50">
                Uso de API
              </span>
              <div className="flex gap-4 font-bold uppercase tracking-widest">
                <span className="bg-foreground text-background px-3 py-1 text-base">
                  Últimos 7 dias
                </span>
              </div>
            </div>
            <div className="h-64 border-b border-border flex items-end gap-2">
              {[10, 25, 15, 40, 30, 55, 20].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-foreground/20 hover:bg-foreground transition-all duration-300" 
                  style={{ height: `${h}%` }} 
                />
              ))}
            </div>
            <p className="font-mono text-base text-muted-foreground uppercase tracking-[0.2em] mt-6 text-center">
              Volume de requisições nos últimos dias
            </p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="p-8 border border-border bg-background space-y-8">
          <span className="text-base font-bold uppercase tracking-[0.2em] text-foreground/50 block">
            Ações Rápidas
          </span>
          <div className="space-y-4">
            <a 
              href="/dashboard/keys" 
              className="block p-4 border border-border hover:bg-foreground/[0.02] transition-colors"
            >
              <span className="text-base uppercase block mb-1">Ver API Keys</span>
              <span className="text-base text-muted-foreground">Gerenciar suas chaves de acesso</span>
            </a>
            <a 
              href="/dashboard/billing" 
              className="block p-4 border border-border hover:bg-foreground/[0.02] transition-colors"
            >
              <span className="text-base uppercase block mb-1">Upgrade de Plano</span>
              <span className="text-base text-muted-foreground">Aumentar quota de requisições</span>
            </a>
            <a 
              href="/docs" 
              target="_blank"
              className="block p-4 border border-border hover:bg-foreground/[0.02] transition-colors"
            >
              <span className="text-base uppercase block mb-1">Documentação</span>
              <span className="text-base text-muted-foreground">Ver exemplos de uso da API</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, subValue }: { label: string; value: string; subValue: string }) {
  return (
    <div className="p-8 bg-background group hover:bg-foreground/[0.02] transition-colors">
      <span className="text-base text-foreground/50 block mb-6 uppercase tracking-widest">
        {label}
      </span>
      <div>
        <span className="text-3xl font-medium tracking-tighter text-foreground block uppercase mb-1">
          {value}
        </span>
        <span className="text-base text-muted-foreground uppercase tracking-widest">
          {subValue}
        </span>
      </div>
    </div>
  );
}
