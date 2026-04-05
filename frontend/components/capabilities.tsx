"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";

export function Capabilities() {
  const t = useTranslations("capabilities");

  const capabilities = [
    {
      id: "01",
      title: t("realTime.title"),
      subtitle: t("realTime.subtitle"),
      description: t("realTime.description"),
      metrics: [
        { label: t("realTime.coverage"), value: t("realTime.coverageValue"), suffix: t("realTime.coverageSuffix") },
      ]
    },
    {
      id: "02",
      title: t("historical.title"),
      subtitle: t("historical.subtitle"),
      description: t("historical.description"),
      metrics: [
        { label: t("historical.matches"), value: t("historical.matchesValue") },
        { label: t("historical.seasons"), value: t("historical.seasonsValue") },
      ]
    },
    {
      id: "03",
      title: t("statistics.title"),
      subtitle: t("statistics.subtitle"),
      description: t("statistics.description"),
      metrics: [
        { label: t("statistics.stats"), value: t("statistics.statsValue"), suffix: t("statistics.statsSuffix") },
      ]
    },
    {
      id: "04",
      title: t("api.title"),
      subtitle: t("api.subtitle"),
      description: t("api.description"),
      metrics: [
        { label: t("api.endpoints"), value: t("api.endpointsValue") },
        { label: t("api.fields"), value: t("api.fieldsValue") },
      ]
    },
  ];

  return (
    <section className="w-full bg-background">
      <div className="section-padding py-16 md:py-24 border-b border-border">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
          <div className="md:col-span-4">
            <span className="data-label tracking-[0.3em]">CAPABILITIES</span>
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

      <div className="section-padding py-8 md:py-0">
        {capabilities.map((cap, index) => (
          <CapabilityCard key={cap.id} capability={cap} index={index} />
        ))}
      </div>
    </section>
  );
}

function CapabilityCard({
  capability,
  index
}: {
  capability: {
    id: string;
    title: string;
    subtitle: string;
    description: string;
    metrics: { label: string; value: string; suffix?: string }[];
  };
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0 }}
      animate={isInView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.8, delay: index * 0.1 }}
      className="flex flex-col md:grid md:grid-cols-12 gap-4 md:gap-8 py-10 md:py-16 border-b border-border group cursor-default"
    >
      <div className="hidden md:block md:col-span-2">
        <span className="font-mono text-4xl font-light text-muted group-hover:text-foreground transition-colors duration-500">
          {capability.id}
        </span>
      </div>

      <div className="md:col-span-3">
        <div className="flex items-center gap-3 md:block">
          <span className="md:hidden font-mono text-base text-muted">{capability.id}</span>
          <h3 className="font-sans text-xl md:text-2xl font-medium tracking-tight">
            {capability.title}
            <br />
            <span className="text-muted">{capability.subtitle}</span>
          </h3>
        </div>
      </div>

      <div className="md:col-span-4">
        <p className="text-base text-muted-foreground leading-relaxed">
          {capability.description}
        </p>
      </div>

      <div className="md:col-span-3">
        <div className="grid grid-cols-2 gap-4 md:gap-6">
          {capability.metrics.map((metric) => (
            <div key={metric.label} className="space-y-2">
              <span className="data-label">{metric.label}</span>
              <div className="flex items-baseline gap-1">
                <span className="font-mono text-3xl font-medium">
                  {metric.value}
                </span>
                {metric.suffix && (
                  <span className="font-mono text-sm text-muted-foreground">
                    {metric.suffix}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
