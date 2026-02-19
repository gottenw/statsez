"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { CheckoutBrick } from "./checkout-brick";
import { X, Lock, User } from "lucide-react";
import { useAuth } from "../lib/auth-context";

const plans = [
  {
    id: "01",
    key: "free",
    requests: "500",
    biweekly: "N/A",
    price: "0,00",
    pricePerReq: "Cadastro",
    featured: false,
    isTotal: true,
  },
  {
    id: "02",
    key: "dev",
    requests: "40.000",
    biweekly: "20.000",
    price: "79,00",
    pricePerReq: "0,0019",
    featured: true,
    isTotal: false,
  },
  {
    id: "03",
    key: "enterprise",
    requests: "250.000",
    biweekly: "125.000",
    price: "349,00",
    pricePerReq: "0,0013",
    featured: false,
    isTotal: false,
  },
  {
    id: "04",
    key: "gold",
    requests: "600.000",
    biweekly: "300.000",
    price: "699,00",
    pricePerReq: "0,0011",
    featured: false,
    isTotal: false,
  },
];

export function Pricing() {
  const t = useTranslations("pricing");
  const { isLoggedIn } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [pendingPlan, setPendingPlan] = useState<typeof plans[0] | null>(null);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.key === "free") {
      window.location.href = "/auth/register";
      return;
    }

    // Se não estiver logado, mostra modal de login obrigatório
    if (!isLoggedIn) {
      setPendingPlan(plan);
      setShowLoginModal(true);
      return;
    }

    setSelectedPlan(plan);
  };

  const handleLoginRedirect = () => {
    // Salva o plano selecionado no localStorage para redirecionar de volta
    if (pendingPlan) {
      localStorage.setItem("statsez_pending_plan", pendingPlan.key);
    }
    window.location.href = "/auth/register";
  };

  return (
    <section id="pricing" className="min-h-screen w-full bg-background border-t border-border">
      {/* Modal de Login Obrigatório */}
      {showLoginModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-background border border-border shadow-2xl overflow-hidden"
          >
            {/* Close Button */}
            <div className="absolute top-0 right-0 border-l border-b border-border">
              <button 
                onClick={() => setShowLoginModal(false)}
                className="p-3 text-foreground hover:bg-foreground hover:text-background transition-all duration-300"
              >
                <X size={18} />
              </button>
            </div>
            
            {/* Header */}
            <div className="p-8 border-b border-border bg-foreground/[0.02]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 border border-border flex items-center justify-center">
                  <Lock size={20} className="text-muted-foreground" />
                </div>
                <div>
                  <span className="data-label text-[10px] opacity-50">AUTHENTICATION_REQUIRED</span>
                  <h3 className="font-sans text-lg font-medium uppercase tracking-tight">
                    Acesso Restrito
                  </h3>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-8 space-y-6">
              <p className="font-mono text-sm text-muted-foreground leading-relaxed">
                Você precisa estar logado para assinar um plano. 
                Faça login com sua conta Google para continuar.
              </p>

              {pendingPlan && (
                <div className="p-4 border border-border bg-foreground/[0.02]">
                  <span className="data-label text-[10px] opacity-50">PLANO SELECIONADO</span>
                  <div className="flex justify-between items-center mt-2">
                    <span className="font-sans text-lg font-medium uppercase">
                      {t(`plans.${pendingPlan.key}.name`)}
                    </span>
                    <span className="font-mono text-xl font-medium">
                      R$ {pendingPlan.price}
                    </span>
                  </div>
                </div>
              )}

              <button
                onClick={handleLoginRedirect}
                className="w-full flex items-center justify-center gap-3 font-mono text-xs font-bold uppercase tracking-[0.2em] border border-border px-6 py-5 hover:bg-foreground hover:text-background transition-all duration-500 bg-background"
              >
                <User size={16} />
                Fazer Login
              </button>
            </div>

            {/* Footer */}
            <div className="px-8 py-4 border-t border-border bg-foreground/[0.02] text-center">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                Autenticação segura via Google OAuth 2.0
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Modal de Checkout */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
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
            
            {/* Compact Header */}
            <div className="p-8 border-b border-border bg-foreground/[0.01]">
              <div className="flex items-center gap-4 mb-4">
                <span className="data-label text-[10px] opacity-50">SECURE_GATEWAY</span>
                <div className="h-px flex-1 bg-border/50" />
              </div>
              
              <div className="flex justify-between items-end">
                <div>
                  <h3 className="font-sans text-xl font-medium uppercase tracking-tight text-foreground">
                    {t(`plans.${selectedPlan.key}.name`)} Plan
                  </h3>
                  <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.2em] mt-1">
                    Monthly Data Access License
                  </p>
                </div>
                <div className="text-right">
                  <span className="font-mono text-2xl font-medium tracking-tighter">
                    R$ {selectedPlan.price}
                  </span>
                  <p className="font-mono text-[9px] text-muted-foreground uppercase">Billed Monthly</p>
                </div>
              </div>
            </div>

            {/* Expanded Checkout Area */}
            <div className="flex-1 overflow-y-auto p-6 md:p-10 bg-white">
              <div className="w-full">
                <CheckoutBrick 
                  amount={parseFloat(selectedPlan.price.replace(".", "").replace(",", "."))}
                  description={`STATSEZ API - ${selectedPlan.key.toUpperCase()}`}
                  onSuccess={(id) => {
                    window.location.href = `/dashboard/welcome?payment_id=${id}`;
                  }}
                />
              </div>
            </div>

            {/* Footer Status */}
            <div className="px-8 py-4 border-t border-border bg-foreground/[0.02] flex justify-between items-center">
              <span className="font-mono text-[9px] text-muted-foreground uppercase tracking-[0.2em]">
                Verified Production Environment
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                <span className="font-mono text-[9px] text-foreground uppercase tracking-widest font-bold">Encrypted</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Section Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">BILLING MODELS</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text text-foreground">
              <ScrambleText text={t("title")} />
              <br />
              <span className="text-muted">{t("title2")}</span>
            </h2>
            <p className="subhead-text text-muted-foreground mt-8 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="section-padding">
        {plans.map((plan, index) => (
          <PlanRow 
            key={plan.key} 
            plan={plan} 
            index={index} 
            onSelect={() => handlePlanSelect(plan)}
          />
        ))}
      </div>
    </section>
  );
}

function PlanRow({ plan, index, onSelect }: { plan: typeof plans[0], index: number, onSelect: () => void }) {
  const t = useTranslations("pricing");
  const { isLoggedIn } = useAuth();
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  const isLocked = plan.key !== "free" && !isLoggedIn;

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className={`grid grid-cols-12 gap-8 py-12 border-b border-border group cursor-default transition-all duration-500 ${
        plan.featured ? "bg-foreground/[0.03]" : "hover:bg-foreground/[0.01]"
      }`}
    >
      <div className="col-span-12 md:col-span-1">
        <span className="font-mono text-xl text-muted group-hover:text-foreground transition-colors duration-500">
          {plan.id}
        </span>
      </div>

      <div className="col-span-12 md:col-span-3">
        <h3 className="font-sans text-2xl font-medium tracking-tight uppercase flex items-center gap-3">
          {t(`plans.${plan.key}.name`)}
          {plan.featured && (
            <span className="text-[10px] bg-foreground text-background px-2 py-0.5 align-middle tracking-widest">
              POPULAR
            </span>
          )}
          {isLocked && (
            <Lock size={16} className="text-muted-foreground" />
          )}
        </h3>
        <p className="text-sm text-muted-foreground mt-2 max-w-[240px]">
          {t(`plans.${plan.key}.desc`)}
        </p>
      </div>

      <div className="col-span-12 md:col-span-4">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-2">
            <span className="data-label text-[10px] opacity-50">
              {plan.isTotal ? t("features.totalRequests") : t("features.requests")}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-medium tracking-tighter">
                {plan.requests}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <span className="data-label text-[10px] opacity-50">{t("features.biweeklyQuota")}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-3xl font-medium tracking-tighter text-muted">
                {plan.biweekly}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="col-span-12 md:col-span-2">
        <div className="space-y-2">
          <span className="data-label text-[10px] opacity-50">INVESTMENT</span>
          <div className="flex items-baseline gap-1">
            <span className="font-mono text-3xl font-medium tracking-tighter">
              R$ {plan.price}
            </span>
          </div>
          <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">
            {plan.key === "free" ? "Basta logar" : `R$ ${plan.pricePerReq} /req`}
          </p>
        </div>
      </div>

      <div className="col-span-12 md:col-span-2 flex items-center justify-end">
        <button 
          onClick={onSelect}
          className={`w-full md:w-auto font-mono text-[10px] font-bold uppercase tracking-[0.2em] border border-border px-10 py-5 transition-all duration-500 whitespace-nowrap flex items-center justify-center gap-2 ${
            isLocked 
              ? "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground" 
              : "bg-background hover:bg-foreground hover:text-background"
          }`}
        >
          {isLocked && <Lock size={14} />}
          {plan.key === "free" ? t("freeCta") : t("cta")}
        </button>
      </div>
    </motion.div>
  );
}
