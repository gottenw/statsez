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
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">DASHBOARD</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              Visão Geral<br />
              <span className="text-muted">da Conta</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="section-padding py-16 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-px bg-border">
          <StatItem 
            label="Plano Atual" 
            value={subscription?.planName || "Free"} 
            subValue={subscription ? `${getDaysRemaining(subscription.expiresAt)} dias restantes` : "-"} 
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
      </div>

      {/* Main Content */}
      <div className="section-padding py-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
          <div className="lg:col-span-2 space-y-8">
            <h3 className="font-sans text-xl font-medium uppercase tracking-tight">
              Uso de API
            </h3>
            <div className="p-10 border border-border bg-foreground/[0.01]">
              <div className="h-64 border-b border-border flex items-end gap-2">
                {[10, 25, 15, 40, 30, 55, 20].map((h, i) => (
                  <div 
                    key={i} 
                    className="flex-1 bg-foreground/20 hover:bg-foreground transition-all duration-300" 
                    style={{ height: `${h}%` }} 
                  />
                ))}
              </div>
              <p className="font-mono text-sm text-muted-foreground uppercase tracking-[0.2em] mt-6 text-center">
                Volume de requisições nos últimos 7 dias
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-8">
            <h3 className="font-sans text-xl font-medium uppercase tracking-tight">
              Ações Rápidas
            </h3>
            <div className="border border-border divide-y divide-border">
              <a 
                href="/dashboard/keys" 
                className="block p-6 hover:bg-foreground/[0.02] transition-colors group"
              >
                <span className="font-sans text-lg uppercase block mb-1 group-hover:text-foreground">
                  Ver Chaves API
                </span>
                <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                  Gerenciar suas chaves de acesso
                </span>
              </a>
              <a 
                href="/dashboard/billing" 
                className="block p-6 hover:bg-foreground/[0.02] transition-colors group"
              >
                <span className="font-sans text-lg uppercase block mb-1 group-hover:text-foreground">
                  Upgrade de Plano
                </span>
                <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                  Aumentar quota de requisições
                </span>
              </a>
              <a 
                href="/docs" 
                target="_blank"
                className="block p-6 hover:bg-foreground/[0.02] transition-colors group"
              >
                <span className="font-sans text-lg uppercase block mb-1 group-hover:text-foreground">
                  Documentação
                </span>
                <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                  Ver exemplos de uso da API
                </span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, subValue }: { label: string; value: string; subValue: string }) {
  return (
    <div className="p-8 bg-background group hover:bg-foreground/[0.02] transition-colors">
      <span className="data-label text-xs opacity-50 block mb-6">
        {label}
      </span>
      <div>
        <span className="font-mono text-3xl font-medium tracking-tighter text-foreground block uppercase mb-1">
          {value}
        </span>
        <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
          {subValue}
        </span>
      </div>
    </div>
  );
}
