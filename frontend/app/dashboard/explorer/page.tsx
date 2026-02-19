"use client";

import { useState } from "react";

const endpoints = [
  { 
    id: "01_LEAGUES", 
    path: "/v1/football/leagues", 
    method: "GET", 
    description: "Listar todas as ligas suportadas" 
  },
  { 
    id: "02_FIXTURES", 
    path: "/v1/football/fixtures", 
    method: "GET", 
    description: "Listar resultados e placares de partidas" 
  },
  { 
    id: "03_STANDINGS", 
    path: "/v1/football/standings", 
    params: "?league=england-premier-league-2025-2026", 
    method: "GET", 
    description: "Tabela completa da liga" 
  },
  { 
    id: "04_STATS", 
    path: "/v1/football/fixtures/{id}/stats", 
    method: "GET", 
    description: "Estatísticas detalhadas da partida" 
  },
  { 
    id: "05_LINEUPS", 
    path: "/v1/football/fixtures/{id}/lineups", 
    method: "GET", 
    description: "Escalações e formações táticas" 
  },
  { 
    id: "06_EVENTS", 
    path: "/v1/football/fixtures/{id}/events", 
    method: "GET", 
    description: "Eventos da partida: gols, cartões, substituições" 
  },
  { 
    id: "07_TEAMS", 
    path: "/v1/football/teams", 
    params: "?league=england-premier-league-2025-2026", 
    method: "GET", 
    description: "Listar times de uma competição" 
  },
  { 
    id: "08_TEAM_FIXTURES", 
    path: "/v1/football/teams/{teamName}/fixtures", 
    method: "GET", 
    description: "Histórico de partidas de um time" 
  },
  { 
    id: "09_LEAGUE_STATS", 
    path: "/v1/football/leagues/{leagueId}/stats", 
    method: "GET", 
    description: "Estatísticas agregadas da temporada" 
  },
];

export default function ExplorerPage() {
  const [selected, setSelected] = useState(endpoints[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const runRequest = async () => {
    if (!apiKey) {
      alert("ERRO: CHAVE_API_OBRIGATORIA");
      return;
    }
    setLoading(true);
    setResult({ status: "CONECTANDO..." });

    try {
      const url = `https://api.statsez.com${selected.path}${selected.params || ""}`;
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey }
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "ERRO_DE_CONEXAO", details: "Verifique sua chave API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="border-b border-border pb-8">
        <span className="text-base font-mono font-bold tracking-widest text-foreground/50 uppercase">
          DEBUG
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          API Explorer
        </h1>
        <p className="font-mono text-base text-red-500 mt-4 font-bold uppercase tracking-wider">
          AVISO: Cada requisicao consome 1 unidade da quota.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-12">
        {/* Sidebar */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-base font-mono font-bold uppercase tracking-widest text-foreground/50">
              API Key
            </label>
            <input 
              type="password" 
              placeholder="COLE_SUA_CHAVE_AQUI"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-base font-mono font-bold uppercase tracking-widest text-foreground/50">
              Endpoints
            </label>
            <div className="border border-border divide-y divide-border max-h-[400px] overflow-y-auto">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelected(ep)}
                  className={`w-full text-left p-5 transition-colors ${
                    selected.id === ep.id ? "bg-foreground text-background" : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  <p className="font-mono text-sm font-bold">{ep.id}</p>
                  <p className={`font-mono text-sm mt-1 ${selected.id === ep.id ? "opacity-70" : "text-muted-foreground"}`}>
                    {ep.path}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={runRequest}
            disabled={loading}
            className="w-full font-mono text-base font-bold bg-foreground text-background py-6 hover:bg-foreground/90 transition-all uppercase tracking-[0.2em]"
          >
            {loading ? "PROCESSANDO..." : "EXECUTAR"}
          </button>
        </div>

        {/* Output */}
        <div className="col-span-12 lg:col-span-8 flex flex-col border border-border">
          <div className="p-5 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
            <span className="text-base font-mono font-bold uppercase tracking-widest">
              Resposta JSON
            </span>
            <span className="text-sm font-mono bg-green-500/10 text-green-600 px-2 py-1 font-bold">
              PRONTO
            </span>
          </div>
          <div className="flex-1 p-8 overflow-auto max-h-[700px] bg-background">
            {result ? (
              <pre className="font-mono text-base text-foreground whitespace-pre-wrap">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/50">
                <span className="font-mono text-base text-muted-foreground uppercase">
                  Aguardando execucao...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
