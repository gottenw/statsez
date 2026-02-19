"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";

const leagues = [
  { country: "ENG", name: "Premier League", matches: 380, season: "2025-26" },
  { country: "ESP", name: "La Liga", matches: 380, season: "2025-26" },
  { country: "DEU", name: "Bundesliga", matches: 306, season: "2025-26" },
  { country: "ITA", name: "Serie A", matches: 380, season: "2025-26" },
  { country: "FRA", name: "Ligue 1", matches: 306, season: "2025-26" },
  { country: "POR", name: "Primeira Liga", matches: 306, season: "2025-26" },
  { country: "NLD", name: "Eredivisie", matches: 306, season: "2025-26" },
  { country: "BRA", name: "Série A", matches: 380, season: "2025-26" },
];

export function Coverage() {
  const t = useTranslations("coverage");
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="min-h-screen w-full bg-background grid-system-fine">
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label">COVERAGE</span>
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

      <div ref={ref} className="section-padding py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border">
          {leagues.map((league, index) => (
            <motion.div
              key={league.country + league.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="bg-background p-8 group hover:bg-foreground hover:text-background transition-all duration-500 cursor-default"
            >
              <div className="flex flex-col h-full justify-between min-h-[200px]">
                <div>
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-background/60 transition-colors">
                    {league.country}
                  </span>
                  <h3 className="font-sans text-xl font-medium mt-2 tracking-tight">
                    {league.name}
                  </h3>
                </div>
                <div className="flex justify-between items-end mt-8">
                  <div>
                    <span className="data-label group-hover:text-background/60 transition-colors">
                      MATCHES
                    </span>
                    <p className="font-mono text-2xl font-medium mt-1">
                      {league.matches}
                    </p>
                  </div>
                  <span className="font-mono text-xs text-muted-foreground group-hover:text-background/60 transition-colors">
                    {league.season}
                  </span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="grid grid-cols-4 gap-8 py-16 border-t border-border mt-12"
        >
          <div>
            <span className="data-label">{t("continents")}</span>
            <p className="font-mono text-4xl font-medium mt-2">6</p>
          </div>
          <div>
            <span className="data-label">{t("countries")}</span>
            <p className="font-mono text-4xl font-medium mt-2">170+</p>
          </div>
          <div>
            <span className="data-label">{t("leagues")}</span>
            <p className="font-mono text-4xl font-medium mt-2">750+</p>
          </div>
          <div>
            <span className="data-label">{t("seasons")}</span>
            <p className="font-mono text-4xl font-medium mt-2">10+</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
