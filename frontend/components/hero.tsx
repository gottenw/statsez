"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { DataVisualizer } from "./data-visualizer";
import { ScrambleText } from "./scramble-text";

export function Hero() {
  const [mounted, setMounted] = useState(false);
  const t = useTranslations("hero");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <section className="relative min-h-screen w-full overflow-hidden grid-system">
      <DataVisualizer />

      {/* Grid lines — desktop only */}
      <div className="absolute inset-0 pointer-events-none hidden md:block">
        <div className="absolute left-[20%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[60%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[80%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute top-[33%] left-0 right-0 h-px bg-border" />
        <div className="absolute top-[66%] left-0 right-0 h-px bg-border" />
      </div>

      {/* Content — pt-24 clears the fixed nav */}
      <div className="relative z-10 min-h-screen flex flex-col justify-between section-padding pt-24 pb-12">
        {/* Top bar — only version, no fake metrics */}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="data-label">STATSEZ API</span>
            <span className="font-mono text-sm text-muted-foreground">{t("version")}</span>
          </div>
        </div>

        {/* Headline */}
        <div className="flex-1 flex items-center">
          <div className="w-full">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            >
              <h1 className="display-text text-foreground mix-blend-difference">
                <ScrambleText text={t("title1")} delay={0.5} />
                <br />
                <span className="text-muted">{t("title2")}</span>
                <br />
                <ScrambleText text={t("title3")} delay={0.8} />
              </h1>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="mt-8 max-w-lg"
            >
              <p className="subhead-text text-muted-foreground leading-relaxed">
                {t("subtitle")}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-wrap gap-4 mt-10"
            >
              <a
                href="/auth/register"
                className="font-mono text-sm font-bold uppercase tracking-[0.15em] bg-foreground text-background px-10 py-5 hover:bg-data-primary hover:text-background transition-all duration-300"
              >
                Começar Grátis
              </a>
              <a
                href="/docs"
                className="font-mono text-sm font-bold uppercase tracking-[0.15em] border border-border px-10 py-5 hover:bg-foreground/10 transition-all duration-300"
              >
                Documentação →
              </a>
            </motion.div>
          </div>
        </div>

        {/* Bottom stats — only real data */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8 border-t border-border pt-8"
        >
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.coverage")}</span>
            <div className="flex items-baseline gap-2">
              <span className="font-mono text-2xl font-medium">750+</span>
              <span className="font-mono text-sm text-muted-foreground">{t("stats.leagues")}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.matches")}</span>
            <span className="font-mono text-2xl font-medium">2.4M+</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.format")}</span>
            <span className="font-mono text-2xl font-medium">REST / JSON</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
