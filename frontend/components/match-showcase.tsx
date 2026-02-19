"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";

const matchData = {
  id: "lbnqyVFq",
  date: "2026-02-08T16:30:00.000Z",
  round: "Round 25",
  homeTeam: "Liverpool",
  awayTeam: "Man City",
  homeScore: 1,
  awayScore: 2,
  htHome: 0,
  htAway: 0,
  status: "FINISHED",
  stats: {
    "Expected goals (xG)": ["1.21", "2.75"],
    "Ball possession": ["47%", "53%"],
    "Total shots": ["15", "17"],
    "Shots on target": ["4", "7"],
    "Big chances": ["1", "3"],
    "Corner kicks": ["5", "4"],
    "Fouls": ["12", "9"],
    "Yellow cards": ["2", "4"],
    "Red cards": ["1", "0"],
    "Passes": ["78% (306/390)", "85% (393/465)"],
    "Tackles": ["18", "14"],
    "Offsides": ["2", "1"]
  }
};

const lineupsData = {
  home: {
    formation: "4-3-3",
    players: [
      { name: "Alisson", number: "1", position: "GK" },
      { name: "Alexander-Arnold", number: "66", position: "DEF" },
      { name: "Konate", number: "5", position: "DEF" },
      { name: "Van Dijk", number: "4", position: "DEF" },
      { name: "Robertson", number: "26", position: "DEF" },
      { name: "Endo", number: "3", position: "MID" },
      { name: "Mac Allister", number: "10", position: "MID" },
      { name: "Szoboszlai", number: "8", position: "MID" },
      { name: "Salah", number: "11", position: "FWD" },
      { name: "Nunez", number: "9", position: "FWD" },
      { name: "Diaz", number: "7", position: "FWD" },
    ]
  },
  away: {
    formation: "4-2-3-1",
    players: [
      { name: "Ederson", number: "31", position: "GK" },
      { name: "Walker", number: "2", position: "DEF" },
      { name: "Stones", number: "5", position: "DEF" },
      { name: "Dias", number: "3", position: "DEF" },
      { name: "Akanji", number: "6", position: "DEF" },
      { name: "Rodri", number: "16", position: "MID" },
      { name: "Kovacic", number: "8", position: "MID" },
      { name: "Bernardo", number: "20", position: "MID" },
      { name: "De Bruyne", number: "17", position: "MID" },
      { name: "Foden", number: "47", position: "MID" },
      { name: "Haaland", number: "9", position: "FWD" },
    ]
  }
};

export function MatchShowcase() {
  const t = useTranslations("matchShowcase");
  const ref = useRef(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "stats" | "lineups">("overview");
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <section className="min-h-screen w-full bg-background border-t border-border" ref={ref}>
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label">{t("label")}</span>
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

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="section-padding py-12"
      >
        {}
        <div className="bg-border/30 border border-border p-8 md:p-12 mb-8">
          <div className="flex justify-between items-center mb-8">
            <span className="data-label">{matchData.round}</span>
            <span className="data-value">{formatDate(matchData.date)}</span>
          </div>

          <div className="grid grid-cols-3 gap-8 items-center">
            <div className="text-center md:text-left">
              <h3 className="font-sans text-2xl md:text-4xl font-medium tracking-tight">
                {matchData.homeTeam}
              </h3>
            </div>
            
            <div className="flex justify-center items-center gap-4">
              <span className="font-mono text-5xl md:text-7xl font-medium">
                {matchData.homeScore}
              </span>
              <span className="font-mono text-3xl md:text-5xl text-muted">:</span>
              <span className="font-mono text-5xl md:text-7xl font-medium">
                {matchData.awayScore}
              </span>
            </div>
            
            <div className="text-center md:text-right">
              <h3 className="font-sans text-2xl md:text-4xl font-medium tracking-tight">
                {matchData.awayTeam}
              </h3>
            </div>
          </div>

          <div className="flex justify-center mt-8">
            <span className="data-label px-4 py-2 bg-foreground/10 rounded">
              {matchData.status}
            </span>
          </div>
        </div>

        {}
        <div className="flex gap-px bg-border mb-8">
          {[
            { id: "overview", label: t("tabs.overview") },
            { id: "stats", label: t("tabs.stats") },
            { id: "lineups", label: t("tabs.lineups") }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-4 font-mono text-sm uppercase tracking-widest transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-foreground text-background"
                  : "bg-background text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {}
        <div 
          ref={scrollRef}
          className="overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
        >
          <div className="min-w-max">
            {activeTab === "overview" && (
              <div className="bg-border/20 border border-border p-8 min-w-[600px]">
                <h4 className="data-label mb-6">{t("jsonOutput")}</h4>
                <pre className="font-mono text-sm text-foreground overflow-x-auto">
                  <code>{JSON.stringify(matchData, null, 2)}</code>
                </pre>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="bg-border/20 border border-border p-8 min-w-[800px]">
                <h4 className="data-label mb-6">{t("matchStats")}</h4>
                <div className="grid gap-4">
                  {Object.entries(matchData.stats).map(([key, values]) => (
                    <div key={key} className="grid grid-cols-3 gap-8 py-4 border-b border-border/50">
                      <div className="text-right font-mono text-lg">{values[0]}</div>
                      <div className="text-center text-muted-foreground text-sm uppercase tracking-wider">
                        {key}
                      </div>
                      <div className="text-left font-mono text-lg">{values[1]}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "lineups" && (
              <div className="flex gap-8 min-w-[900px]">
                <div className="flex-1 bg-border/20 border border-border p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-sans text-xl font-medium">{matchData.homeTeam}</h4>
                    <span className="data-label">{lineupsData.home.formation}</span>
                  </div>
                  <div className="space-y-3">
                    {lineupsData.home.players.map((player, i) => (
                      <div key={i} className="flex items-center gap-4 py-2 border-b border-border/30">
                        <span className="font-mono text-lg text-muted-foreground w-8">{player.number}</span>
                        <span className="font-mono text-sm uppercase text-muted-foreground w-16">{player.position}</span>
                        <span className="font-sans text-lg">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 bg-border/20 border border-border p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h4 className="font-sans text-xl font-medium">{matchData.awayTeam}</h4>
                    <span className="data-label">{lineupsData.away.formation}</span>
                  </div>
                  <div className="space-y-3">
                    {lineupsData.away.players.map((player, i) => (
                      <div key={i} className="flex items-center gap-4 py-2 border-b border-border/30">
                        <span className="font-mono text-lg text-muted-foreground w-8">{player.number}</span>
                        <span className="font-mono text-sm uppercase text-muted-foreground w-16">{player.position}</span>
                        <span className="font-sans text-lg">{player.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {}
        <div className="flex items-center gap-4 mt-4 text-muted-foreground">
          <div className="w-8 h-px bg-border" />
          <span className="font-mono text-xs uppercase tracking-widest">{t("scrollHint")}</span>
          <div className="flex-1 h-px bg-border" />
        </div>
      </motion.div>
    </section>
  );
}
