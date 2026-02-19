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

      {}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-[20%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[40%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[60%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute left-[80%] top-0 bottom-0 w-px bg-border" />
        <div className="absolute top-[33%] left-0 right-0 h-px bg-border" />
        <div className="absolute top-[66%] left-0 right-0 h-px bg-border" />
      </div>

      {}
      <div className="relative z-10 min-h-screen flex flex-col justify-between section-padding py-12">
        {}
        <div className="flex justify-between items-start">
          <div className="flex flex-col gap-1">
            <span className="data-label">QUANTSPORTS API</span>
            <span className="data-value text-muted-foreground">{t("version")}</span>
          </div>
          <div className="flex gap-12 text-right">
            <div className="flex flex-col gap-1">
              <span className="data-label">{t("latency")}</span>
              <span className="data-value">&lt;1min</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="data-label">{t("uptime")}</span>
              <span className="data-value">99.9%</span>
            </div>
          </div>
        </div>

        {}
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
              className="mt-8 max-w-md"
            >
              <p className="subhead-text text-muted-foreground leading-relaxed">
                {t("subtitle")}
              </p>
            </motion.div>
          </div>
        </div>

        {}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
          className="grid grid-cols-4 gap-8 border-t border-border pt-8"
        >
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.coverage")}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-medium">500+</span>
              <span className="data-value text-muted-foreground">{t("stats.leagues")}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.matches")}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-medium">2.4M+</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.update")}</span>
            <div className="flex items-baseline gap-1">
              <span className="font-mono text-2xl font-medium">{t("stats.frequency")}</span>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <span className="data-label">{t("stats.format")}</span>
            <span className="font-mono text-2xl font-medium">{t("stats.json")}</span>
          </div>
        </motion.div>
      </div>

      {}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
      >
        <span className="data-label">{t("scroll")}</span>
        <div className="w-px h-12 bg-border overflow-hidden">
          <motion.div
            className="w-full h-1/2 bg-foreground"
            animate={{ y: [0, 24, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </section>
  );
}
