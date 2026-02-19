"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { CheckoutBrick } from "./checkout-brick";
import { X } from "lucide-react";

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
    price: "60,00",
    pricePerReq: "0,0015",
    featured: true,
    isTotal: false,
  },
  {
    id: "03",
    key: "enterprise",
    requests: "250.000",
    biweekly: "125.000",
    price: "249,00",
    pricePerReq: "0,0010",
    featured: false,
    isTotal: false,
  },
  {
    id: "04",
    key: "gold",
    requests: "600.000",
    biweekly: "300.000",
    price: "499,00",
    pricePerReq: "0,0008",
    featured: false,
    isTotal: false,
  },
];

export function Pricing() {
  const t = useTranslations("pricing");
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.key === "free") {
      window.location.href = "/auth/register";
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <section id="pricing" className="min-h-screen w-full bg-background border-t border-border">
      {/* Modal de Checkout */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <div className="relative w-full max-w-2xl bg-white border border-border shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
            <button 
              onClick={() => setSelectedPlan(null)}
              className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-black z-[110] transition-colors"
            >
              <X size={24} />
            </button>
            
            <div className="p-8 border-b border-border bg-zinc-50">
              <span className="data-label text-zinc-500">SECURE CHECKOUT</span>
              <h3 className="font-sans text-2xl font-medium mt-2 uppercase text-black">
                {t(`plans.${selectedPlan.key}.name`)} — R$ {selectedPlan.price}
              </h3>
              <p className="text-sm text-zinc-500 mt-1 uppercase tracking-wider font-mono">
                Statsez Data Access • Monthly Subscription
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-2 md:p-6 bg-white">
              <CheckoutBrick 
                amount={parseFloat(selectedPlan.price.replace(".", "").replace(",", "."))}
                description={`Statsez API - ${selectedPlan.key.toUpperCase()}`}
                onSuccess={(id) => {
                  window.location.href = `/dashboard/welcome?payment_id=${id}`;
                }}
              />
            </div>
          </div>
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
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

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
        <h3 className="font-sans text-2xl font-medium tracking-tight uppercase">
          {t(`plans.${plan.key}.name`)}
          {plan.featured && (
            <span className="ml-3 text-[10px] bg-foreground text-background px-2 py-0.5 align-middle tracking-widest">
              POPULAR
            </span>
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
          className="w-full md:w-auto font-mono text-[10px] font-bold uppercase tracking-[0.2em] border border-border px-10 py-5 hover:bg-foreground hover:text-background transition-all duration-500 whitespace-nowrap bg-background"
        >
          {plan.key === "free" ? t("freeCta") : t("cta")}
        </button>
      </div>
    </motion.div>
  );
}