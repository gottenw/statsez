"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";

export function Coverage() {
  const t = useTranslations("coverage");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const stats = [
    { label: t("continents"), value: "6" },
    { label: t("countries"), value: "170+" },
    { label: t("leagues"), value: "750+" },
    { label: t("seasons"), value: "10+" },
  ];

  return (
    <section className="w-full bg-background border-t border-border">
      {/* Header */}
      <div className="section-padding py-16 md:py-24 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">COVERAGE</span>
          </div>
          <div className="md:col-span-8">
            <h2 className="headline-text text-foreground">
              <ScrambleText text={t("title")} />
              <br />
              <span className="text-muted">{t("title2")}</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div ref={ref} className="section-padding py-16 md:py-24">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 16 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group"
            >
              <span className="data-label">{stat.label}</span>
              <p className="font-mono text-5xl md:text-6xl font-medium mt-3 tracking-tighter group-hover:text-data-primary transition-colors duration-500">
                {stat.value}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Description */}
      </div>
    </section>
  );
}
