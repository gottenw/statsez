"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { X, MessageCircle, ArrowRight } from "lucide-react";

const plans = [
  {
    key: "free",
    requests: "500",
    biweekly: "250",
    price: "0",
    priceDisplay: "Grátis",
    featured: false,
    cta: "register",
  },
  {
    key: "dev",
    requests: "40.000",
    biweekly: "20.000",
    price: "69,99",
    priceDisplay: "R$ 69,99",
    featured: true,
    cta: "contact",
  },
  {
    key: "enterprise",
    requests: "250.000",
    biweekly: "125.000",
    price: "219,99",
    priceDisplay: "R$ 219,99",
    featured: false,
    cta: "contact",
  },
  {
    key: "gold",
    requests: "600.000",
    biweekly: "300.000",
    price: "499,99",
    priceDisplay: "R$ 499,99",
    featured: false,
    cta: "contact",
  },
];

export function Pricing() {
  const t = useTranslations("pricing");
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-60px" });

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (plan.cta === "register") {
      window.location.href = "/auth/register";
      return;
    }
    setSelectedPlan(plan);
  };

  return (
    <section id="pricing" className="w-full bg-background border-t border-border">
      {/* Modal Telegram */}
      {selectedPlan && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/90 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative w-full max-w-md bg-background border border-border shadow-2xl overflow-hidden"
          >
            <div className="absolute top-0 right-0 border-l border-b border-border">
              <button
                onClick={() => setSelectedPlan(null)}
                className="p-4 text-foreground hover:bg-foreground hover:text-background transition-all"
              >
                <X size={18} />
              </button>
            </div>

            <div className="p-8 border-b border-border bg-foreground/[0.02]">
              <span className="data-label text-[10px] opacity-50">SUBSCRIPTION_REQUEST</span>
              <h3 className="font-sans text-xl font-medium uppercase tracking-tight mt-2">
                {t(`plans.${selectedPlan.key}.name`)}
              </h3>
              <span className="font-mono text-2xl font-medium block mt-1">
                {selectedPlan.priceDisplay}
                <span className="text-sm text-muted-foreground"> /mês</span>
              </span>
            </div>

            <div className="p-8 space-y-6">
              <p className="text-sm text-muted-foreground leading-relaxed">
                Para assinar, entre em contato via Telegram. Resposta rápida e ativação imediata.
              </p>

              <a
                href="https://t.me/joaonaithen"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-3 font-mono text-sm font-bold uppercase tracking-[0.15em] bg-foreground text-background px-6 py-5 hover:bg-data-primary transition-all duration-300"
              >
                <MessageCircle size={18} />
                Falar no Telegram
              </a>

              <p className="font-mono text-[10px] text-muted-foreground text-center uppercase tracking-[0.15em]">
                @joaonaithen
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* Section Header */}
      <div className="section-padding py-16 md:py-24 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">BILLING MODELS</span>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline-text text-foreground">
              <ScrambleText text={t("title")} />
              <br />
              <span className="text-muted">{t("title2")}</span>
            </h2>
            <p className="subhead-text text-muted-foreground mt-6 md:mt-8 max-w-xl">
              {t("subtitle")}
            </p>
          </div>
        </div>
      </div>

      {/* Vertical Plan Cards */}
      <div ref={ref} className="section-padding py-16 md:py-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.key}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className={`relative flex flex-col border border-border p-8 transition-all duration-500 ${
                plan.featured
                  ? "bg-foreground/[0.04] border-foreground/20"
                  : "hover:bg-foreground/[0.02]"
              }`}
            >
              {/* Popular badge */}
              {plan.featured && (
                <div className="absolute -top-px left-0 right-0 h-[2px] bg-data-primary" />
              )}

              {/* Plan name */}
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-sans text-lg font-medium uppercase tracking-tight">
                  {t(`plans.${plan.key}.name`)}
                </h3>
                {plan.featured && (
                  <span className="font-mono text-[9px] bg-data-primary text-background px-2 py-1 uppercase tracking-widest">
                    Popular
                  </span>
                )}
              </div>

              {/* Price */}
              <div className="mb-6">
                <span className="font-mono text-4xl font-medium tracking-tighter">
                  {plan.price === "0" ? "Grátis" : `R$ ${plan.price}`}
                </span>
                {plan.price !== "0" && (
                  <span className="font-mono text-sm text-muted-foreground"> /mês</span>
                )}
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-8">
                {t(`plans.${plan.key}.desc`)}
              </p>

              {/* Features */}
              <div className="flex-1 space-y-3 mb-8">
                {[
                  { label: t("features.requests"), value: `${plan.requests} req` },
                  { label: t("features.biweeklyQuota"), value: plan.biweekly },
                  { label: t("features.allLeagues"), value: "✓" },
                  { label: t("features.apiKeys"), value: "✓" },
                ].map((feat) => (
                  <div key={feat.label} className="flex justify-between items-center py-2 border-b border-border/50">
                    <span className="font-mono text-xs text-muted-foreground">{feat.label}</span>
                    <span className={`font-mono text-sm font-medium ${feat.value === "✓" ? "text-data-primary" : ""}`}>
                      {feat.value}
                    </span>
                  </div>
                ))}
              </div>

              {/* CTA Button — bigger */}
              <button
                onClick={() => handlePlanSelect(plan)}
                className={`w-full font-mono text-sm font-bold uppercase tracking-[0.15em] py-5 flex items-center justify-center gap-2 transition-all duration-300 ${
                  plan.featured
                    ? "bg-foreground text-background hover:bg-data-primary"
                    : "border border-border hover:bg-foreground hover:text-background"
                }`}
              >
                {plan.cta === "register" ? t("freeCta") : t("cta")}
                <ArrowRight size={16} />
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
