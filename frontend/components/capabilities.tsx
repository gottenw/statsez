"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { MiniChart } from "./charts";

export function Capabilities() {
  const t = useTranslations("capabilities");
  
  const capabilities = [
    {
      id: "01",
      title: t("realTime.title"),
      subtitle: t("realTime.subtitle"),
      description: t("realTime.description"),
      metrics: [
        { label: t("realTime.latency"), value: t("realTime.latencyValue"), chart: [20, 25, 22, 28, 24, 26, 23, 25] },
        { label: t("realTime.coverage"), value: t("realTime.coverageValue"), suffix: t("realTime.coverageSuffix"), chart: [80, 85, 82, 88, 84, 86, 83, 85] },
      ]
    },
    {
      id: "02",
      title: t("historical.title"),
      subtitle: t("historical.subtitle"),
      description: t("historical.description"),
      metrics: [
        { label: t("historical.matches"), value: t("historical.matchesValue"), chart: [40, 45, 42, 48, 44, 46, 43, 45] },
        { label: t("historical.seasons"), value: t("historical.seasonsValue"), chart: [60, 65, 62, 68, 64, 66, 63, 65] },
      ]
    },
    {
      id: "03",
      title: t("statistics.title"),
      subtitle: t("statistics.subtitle"),
      description: t("statistics.description"),
      metrics: [
        { label: t("statistics.stats"), value: t("statistics.statsValue"), suffix: t("statistics.statsSuffix"), chart: [90, 92, 91, 94, 93, 94, 92, 94] },
        { label: t("statistics.events"), value: t("statistics.eventsValue"), suffix: t("statistics.eventsSuffix"), chart: [8, 9, 8, 10, 9, 11, 10, 12] },
      ]
    },
    {
      id: "04",
      title: t("api.title"),
      subtitle: t("api.subtitle"),
      description: t("api.description"),
      metrics: [
        { label: t("api.endpoints"), value: t("api.endpointsValue"), chart: [30, 35, 32, 38, 34, 36, 33, 48] },
        { label: t("api.fields"), value: t("api.fieldsValue"), chart: [150, 160, 155, 165, 160, 170, 165, 200] },
      ]
    },
  ];

  return (
    <section className="min-h-screen w-full bg-background">
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label">CAPABILITIES</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text text-foreground">
              <ScrambleText text={t("title")} />
              <br />
              <span className="text-muted">{t("title2")}</span>
            </h2>
          </div>
        </div>
      </div>

      <div className="section-padding">
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
    metrics: { label: string; value: string; suffix?: string; chart: number[] }[];
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
      className="grid grid-cols-12 gap-8 py-16 border-b border-border group cursor-default"
    >
      <div className="col-span-12 md:col-span-2">
        <span className="font-mono text-4xl font-light text-muted group-hover:text-foreground transition-colors duration-500">
          {capability.id}
        </span>
      </div>

      <div className="col-span-12 md:col-span-3">
        <h3 className="font-sans text-2xl font-medium tracking-tight">
          {capability.title}
          <br />
          <span className="text-muted">{capability.subtitle}</span>
        </h3>
      </div>

      <div className="col-span-12 md:col-span-3">
        <p className="text-muted-foreground leading-relaxed">
          {capability.description}
        </p>
      </div>

      <div className="col-span-12 md:col-span-4">
        <div className="grid grid-cols-2 gap-6">
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
              <div className="h-10 opacity-50 group-hover:opacity-100 transition-opacity duration-500">
                <MiniChart data={metric.chart} color={index % 2 === 0 ? "#00ff88" : "#0088ff"} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
