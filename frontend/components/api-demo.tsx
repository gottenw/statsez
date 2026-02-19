"use client";

import { useState, useRef } from "react";
import { motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { ScrambleText } from "./scramble-text";
import { LineChart, BarChart } from "./charts";

const realMatchData = {
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
      { participantId: "1", participantName: "Alisson", participantSurname: "Becker", participantNumber: "1", participantCountry: "BRA", playerType: "First team", positionId: "1", positionKey: "GK", formation: "4-3-3" },
      { participantId: "66", participantName: "Trent", participantSurname: "Alexander-Arnold", participantNumber: "66", participantCountry: "ENG", playerType: "First team", positionId: "2", positionKey: "DEF", formation: "4-3-3" },
      { participantId: "5", participantName: "Ibrahima", participantSurname: "Konate", participantNumber: "5", participantCountry: "FRA", playerType: "First team", positionId: "3", positionKey: "DEF", formation: "4-3-3" },
      { participantId: "4", participantName: "Virgil", participantSurname: "van Dijk", participantNumber: "4", participantCountry: "NED", playerType: "First team", positionId: "4", positionKey: "DEF", formation: "4-3-3" },
      { participantId: "26", participantName: "Andrew", participantSurname: "Robertson", participantNumber: "26", participantCountry: "SCO", playerType: "First team", positionId: "5", positionKey: "DEF", formation: "4-3-3" },
      { participantId: "3", participantName: "Wataru", participantSurname: "Endo", participantNumber: "3", participantCountry: "JPN", playerType: "First team", positionId: "6", positionKey: "MID", formation: "4-3-3" },
      { participantId: "10", participantName: "Alexis", participantSurname: "Mac Allister", participantNumber: "10", participantCountry: "ARG", playerType: "First team", positionId: "7", positionKey: "MID", formation: "4-3-3" },
      { participantId: "8", participantName: "Dominik", participantSurname: "Szoboszlai", participantNumber: "8", participantCountry: "HUN", playerType: "First team", positionId: "8", positionKey: "MID", formation: "4-3-3" },
      { participantId: "11", participantName: "Mohamed", participantSurname: "Salah", participantNumber: "11", participantCountry: "EGY", playerType: "First team", positionId: "9", positionKey: "FWD", formation: "4-3-3" },
      { participantId: "9", participantName: "Darwin", participantSurname: "Nunez", participantNumber: "9", participantCountry: "URU", playerType: "First team", positionId: "10", positionKey: "FWD", formation: "4-3-3" },
      { participantId: "7", participantName: "Luis", participantSurname: "Diaz", participantNumber: "7", participantCountry: "COL", playerType: "First team", positionId: "11", positionKey: "FWD", formation: "4-3-3" },
    ],
    substitutes: [
      { participantId: "62", participantName: "Caoimhin", participantSurname: "Kelleher", participantNumber: "62", participantCountry: "IRL", playerType: "Substitute", positionKey: "GK" },
      { participantId: "2", participantName: "Joe", participantSurname: "Gomez", participantNumber: "2", participantCountry: "ENG", playerType: "Substitute", positionKey: "DEF" },
      { participantId: "78", participantName: "Jarell", participantSurname: "Quansah", participantNumber: "78", participantCountry: "ENG", playerType: "Substitute", positionKey: "DEF" },
      { participantId: "17", participantName: "Curtis", participantSurname: "Jones", participantNumber: "17", participantCountry: "ENG", playerType: "Substitute", positionKey: "MID" },
      { participantId: "19", participantName: "Harvey", participantSurname: "Elliott", participantNumber: "19", participantCountry: "ENG", playerType: "Substitute", positionKey: "MID" },
      { participantId: "20", participantName: "Diogo", participantSurname: "Jota", participantNumber: "20", participantCountry: "POR", playerType: "Substitute", positionKey: "FWD" },
      { participantId: "18", participantName: "Cody", participantSurname: "Gakpo", participantNumber: "18", participantCountry: "NED", playerType: "Substitute", positionKey: "FWD" },
    ],
    coach: { name: "Jurgen Klopp", country: "GER" }
  },
  away: {
    formation: "4-2-3-1",
    players: [
      { participantId: "31", participantName: "Ederson", participantSurname: "Moraes", participantNumber: "31", participantCountry: "BRA", playerType: "First team", positionId: "1", positionKey: "GK", formation: "4-2-3-1" },
      { participantId: "2", participantName: "Kyle", participantSurname: "Walker", participantNumber: "2", participantCountry: "ENG", playerType: "First team", positionId: "2", positionKey: "DEF", formation: "4-2-3-1" },
      { participantId: "5", participantName: "John", participantSurname: "Stones", participantNumber: "5", participantCountry: "ENG", playerType: "First team", positionId: "3", positionKey: "DEF", formation: "4-2-3-1" },
      { participantId: "3", participantName: "Ruben", participantSurname: "Dias", participantNumber: "3", participantCountry: "POR", playerType: "First team", positionId: "4", positionKey: "DEF", formation: "4-2-3-1" },
      { participantId: "6", participantName: "Manuel", participantSurname: "Akanji", participantNumber: "6", participantCountry: "SUI", playerType: "First team", positionId: "5", positionKey: "DEF", formation: "4-2-3-1" },
      { participantId: "16", participantName: "Rodri", participantSurname: "Hernandez", participantNumber: "16", participantCountry: "ESP", playerType: "First team", positionId: "6", positionKey: "MID", formation: "4-2-3-1" },
      { participantId: "8", participantName: "Mateo", participantSurname: "Kovacic", participantNumber: "8", participantCountry: "CRO", playerType: "First team", positionId: "7", positionKey: "MID", formation: "4-2-3-1" },
      { participantId: "20", participantName: "Bernardo", participantSurname: "Silva", participantNumber: "20", participantCountry: "POR", playerType: "First team", positionId: "8", positionKey: "MID", formation: "4-2-3-1" },
      { participantId: "17", participantName: "Kevin", participantSurname: "De Bruyne", participantNumber: "17", participantCountry: "BEL", playerType: "First team", positionId: "9", positionKey: "MID", formation: "4-2-3-1" },
      { participantId: "47", participantName: "Phil", participantSurname: "Foden", participantNumber: "47", participantCountry: "ENG", playerType: "First team", positionId: "10", positionKey: "MID", formation: "4-2-3-1" },
      { participantId: "9", participantName: "Erling", participantSurname: "Haaland", participantNumber: "9", participantCountry: "NOR", playerType: "First team", positionId: "11", positionKey: "FWD", formation: "4-2-3-1" },
    ],
    substitutes: [
      { participantId: "18", participantName: "Stefan", participantSurname: "Ortega", participantNumber: "18", participantCountry: "GER", playerType: "Substitute", positionKey: "GK" },
      { participantId: "82", participantName: "Rico", participantSurname: "Lewis", participantNumber: "82", participantCountry: "ENG", playerType: "Substitute", positionKey: "DEF" },
      { participantId: "24", participantName: "Josko", participantSurname: "Gvardiol", participantNumber: "24", participantCountry: "CRO", playerType: "Substitute", positionKey: "DEF" },
      { participantId: "19", participantName: "Julian", participantSurname: "Alvarez", participantNumber: "19", participantCountry: "ARG", playerType: "Substitute", positionKey: "FWD" },
      { participantId: "10", participantName: "Jack", participantSurname: "Grealish", participantNumber: "10", participantCountry: "ENG", playerType: "Substitute", positionKey: "MID" },
      { participantId: "27", participantName: "Matheus", participantSurname: "Nunes", participantNumber: "27", participantCountry: "POR", playerType: "Substitute", positionKey: "MID" },
      { participantId: "52", participantName: "Oscar", participantSurname: "Bobb", participantNumber: "52", participantCountry: "NOR", playerType: "Substitute", positionKey: "FWD" },
    ],
    coach: { name: "Pep Guardiola", country: "ESP" }
  }
};

export function ApiDemo() {
  const t = useTranslations("apiDemo");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const endpoints = [
    {
      id: "fixtures",
      name: "FIXTURES",
      description: t("fixtures.description"),
      method: "GET",
      path: "/v1/football/fixtures?league=england-premier-league",
      response: {
        success: true,
        data: {
          league: "Premier League",
          season: "2025-2026",
          matches: [
            { 
              id: "lbnqyVFq", 
              homeTeam: "Liverpool", 
              awayTeam: "Man City", 
              homeScore: 1,
              awayScore: 2,
              date: "2026-02-08T16:30:00.000Z",
              round: "Round 25",
              status: "FINISHED" 
            },
            { 
              id: "pQrStUvW", 
              homeTeam: "Arsenal", 
              awayTeam: "Chelsea", 
              homeScore: 3,
              awayScore: 1,
              date: "2026-02-08T14:00:00.000Z",
              round: "Round 25",
              status: "FINISHED" 
            },
          ]
        },
        meta: { cached: false, remainingQuota: 4989 }
      }
    },
    {
      id: "standings",
      name: "STANDINGS",
      description: t("standings.description"),
      method: "GET",
      path: "/v1/football/standings?league=england-premier-league",
      response: {
        success: true,
        data: {
          league: "Premier League",
          season: "2025-2026",
          standings: [
            { position: 1, team: "Arsenal", played: 25, won: 17, drawn: 5, lost: 3, goalsFor: 49, goalsAgainst: 17, goalDifference: 32, points: 56 },
            { position: 2, team: "Man City", played: 25, won: 15, drawn: 5, lost: 5, goalsFor: 51, goalsAgainst: 24, goalDifference: 27, points: 50 },
            { position: 3, team: "Man United", played: 26, won: 13, drawn: 8, lost: 5, goalsFor: 50, goalsAgainst: 37, goalDifference: 13, points: 47 },
          ]
        },
        meta: { cached: true, remainingQuota: 4988 }
      }
    },
    {
      id: "stats",
      name: "STATISTICS",
      description: t("stats.description"),
      method: "GET",
      path: "/v1/football/fixtures/lbnqyVFq/stats",
      response: {
        success: true,
        data: {
          matchId: "lbnqyVFq",
          match: `${realMatchData.homeTeam} ${realMatchData.homeScore}-${realMatchData.awayScore} ${realMatchData.awayTeam}`,
          date: realMatchData.date,
          stats: realMatchData.stats
        },
        meta: { cached: false, remainingQuota: 4987 }
      }
    },
    {
      id: "lineups",
      name: "LINEUPS",
      description: t("lineups.description"),
      method: "GET",
      path: "/v1/football/fixtures/lbnqyVFq/lineups",
      response: {
        success: true,
        data: {
          matchId: "lbnqyVFq",
          home: {
            team: "Liverpool",
            formation: lineupsData.home.formation,
            coach: lineupsData.home.coach,
            players: lineupsData.home.players,
            substitutes: lineupsData.home.substitutes
          },
          away: {
            team: "Man City",
            formation: lineupsData.away.formation,
            coach: lineupsData.away.coach,
            players: lineupsData.away.players,
            substitutes: lineupsData.away.substitutes
          }
        },
        meta: { cached: true, remainingQuota: 4986 }
      }
    }
  ];

  const [activeEndpoint, setActiveEndpoint] = useState(endpoints[0]);

  const getVisualization = () => {
    if (activeEndpoint.id === "fixtures") return <LineChart />;
    if (activeEndpoint.id === "standings") return <BarChart />;
    if (activeEndpoint.id === "stats") return <StatsComparison />;
    if (activeEndpoint.id === "lineups") return <FormationDisplay />;
    return <StatsRadial />;
  };

  return (
    <section id="api" className="min-h-screen w-full bg-background grid-system-fine">
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label">API REFERENCE</span>
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

      <div className="section-padding py-12">
        <div className="grid grid-cols-12 gap-px bg-border">
          {}
          <div className="col-span-12 md:col-span-3 bg-background">
            <div className="p-6 border-b border-border">
              <span className="data-label">ENDPOINTS</span>
            </div>
            {endpoints.map((endpoint) => (
              <button
                key={endpoint.id}
                onClick={() => setActiveEndpoint(endpoint)}
                className={`w-full text-left p-6 border-b border-border transition-all duration-300 group ${
                  activeEndpoint.id === endpoint.id 
                    ? "bg-foreground text-background" 
                    : "hover:bg-border/50"
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={`text-xs font-mono ${
                    activeEndpoint.id === endpoint.id ? "text-background/60" : "text-muted-foreground"
                  }`}>
                    {endpoint.method}
                  </span>
                </div>
                <h3 className="font-sans text-lg font-medium tracking-tight">
                  {endpoint.name}
                </h3>
                <p className={`text-sm mt-1 ${
                  activeEndpoint.id === endpoint.id ? "text-background/60" : "text-muted-foreground"
                }`}>
                  {endpoint.description}
                </p>
              </button>
            ))}
          </div>

          {}
          <div className="col-span-12 md:col-span-5 bg-background flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center">
              <span className="data-label">{t("requestResponse")}</span>
              <span className="font-mono text-xs text-muted-foreground">JSON</span>
            </div>
            
            {}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-auto max-h-[400px]"
              style={{ 
                scrollbarWidth: "thin", 
                msOverflowStyle: "auto",
                scrollbarColor: "#333 #0a0a0a"
              }}
            >
              <div className="min-w-[500px] p-6">
                <div className="text-muted-foreground mb-4 font-mono text-sm">
                <pre className="font-mono text-sm text-foreground">
                  <code>{JSON.stringify(activeEndpoint.response, null, 2)}</code>
                </pre>
              </div>
            </div>

            {}
            <div className="px-6 py-3 border-t border-border flex items-center gap-2 text-muted-foreground bg-background">
              <div className="w-4 h-px bg-border" />
              <span className="font-mono text-xs uppercase tracking-widest">{t("scrollHint")}</span>
            </div>
          </div>

          {}
          <div className="col-span-12 md:col-span-4 bg-background">
            <div className="p-6 border-b border-border">
              <span className="data-label">{t("visualization")}</span>
            </div>
            <div className="p-6 h-[400px] flex items-center justify-center">
              {getVisualization()}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 pointer-events-none section-padding">
        <div className="h-full border-x border-border" />
      </div>
    </section>
  );
}

function StatsRadial() {
  return (
    <div className="relative w-48 h-48">
      <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
        <circle cx="50" cy="50" r="45" fill="none" stroke="#262626" strokeWidth="1" />
        <circle cx="50" cy="50" r="35" fill="none" stroke="#262626" strokeWidth="1" />
        <circle cx="50" cy="50" r="25" fill="none" stroke="#262626" strokeWidth="1" />
        
        <motion.circle 
          cx="50" cy="50" r="45" fill="none" stroke="#00ff88" strokeWidth="2"
          strokeDasharray="283"
          initial={{ strokeDashoffset: 283 }}
          animate={{ strokeDashoffset: 70 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
        <motion.circle 
          cx="50" cy="50" r="35" fill="none" stroke="#0088ff" strokeWidth="2"
          strokeDasharray="220"
          initial={{ strokeDashoffset: 220 }}
          animate={{ strokeDashoffset: 80 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
        />
        <motion.circle 
          cx="50" cy="50" r="25" fill="none" stroke="#ff0055" strokeWidth="2"
          strokeDasharray="157"
          initial={{ strokeDashoffset: 157 }}
          animate={{ strokeDashoffset: 60 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.4 }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="font-mono text-2xl font-medium">JSON</span>
      </div>
    </div>
  );
}

function StatsComparison() {
  return (
    <div className="w-full max-w-[300px] space-y-4">
      <h4 className="data-label text-center mb-4">LIVERPOOL vs MAN CITY</h4>
      {Object.entries(realMatchData.stats).slice(0, 6).map(([key, values]) => (
        <div key={key} className="grid grid-cols-3 gap-2 items-center">
          <div className="text-right font-mono text-sm">{values[0]}</div>
          <div className="text-center text-xs text-muted-foreground uppercase truncate px-1">
            {key.replace(/\([^)]*\)/, '').trim()}
          </div>
          <div className="text-left font-mono text-sm">{values[1]}</div>
        </div>
      ))}
    </div>
  );
}

function FormationDisplay() {
  return (
    <div className="w-full space-y-6">
      <div className="text-center">
        <span className="data-label">LIVERPOOL</span>
        <p className="font-mono text-2xl font-medium mt-1">{lineupsData.home.formation}</p>
      </div>
      <div className="flex justify-center items-center gap-8">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full border-2 border-data-primary flex items-center justify-center">
            <span className="font-mono text-lg">11</span>
          </div>
        </div>
      </div>
      <div className="text-center">
        <span className="data-label">MAN CITY</span>
        <p className="font-mono text-2xl font-medium mt-1">{lineupsData.away.formation}</p>
      </div>
    </div>
  );
}
