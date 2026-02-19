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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">EXPLORER</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              API<br />
              <span className="text-muted">Explorer</span>
            </h2>
            <p className="font-mono text-sm text-red-500 mt-6 font-bold uppercase tracking-widest">
              AVISO: Cada requisição consome 1 unidade da quota.
            </p>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="section-padding py-16 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <span className="data-label">AUTENTICAÇÃO</span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <span className="data-label text-xs opacity-50 block mb-4">CHAVE DE API</span>
            <input
              type="password"
              placeholder="COLE_SUA_CHAVE_AQUI"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Endpoint Selection + Output */}
      <div className="section-padding py-24">
        <div className="grid grid-cols-12 gap-8">
          {/* Sidebar - Endpoints */}
          <div className="col-span-12 lg:col-span-4 space-y-8">
            <div className="grid grid-cols-12 gap-8 mb-8">
              <div className="col-span-12">
                <span className="data-label tracking-[0.3em]">ENDPOINTS</span>
              </div>
            </div>

            <div className="border border-border divide-y divide-border max-h-[500px] overflow-y-auto">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelected(ep)}
                  className={`w-full text-left p-6 transition-all duration-500 ${
                    selected.id === ep.id
                      ? "bg-foreground text-background"
                      : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  <p className="font-mono text-sm font-bold">{ep.id}</p>
                  <p className={`font-mono text-xs mt-1 uppercase tracking-widest ${
                    selected.id === ep.id ? "opacity-70" : "text-muted-foreground"
                  }`}>
                    {ep.path}
                  </p>
                </button>
              ))}
            </div>

            <button
              onClick={runRequest}
              disabled={loading}
              className="w-full font-mono text-xs font-bold uppercase tracking-[0.2em] border border-foreground bg-foreground text-background py-6 hover:bg-background hover:text-foreground transition-all disabled:opacity-50"
            >
              {loading ? "PROCESSANDO..." : "EXECUTAR"}
            </button>
          </div>

          {/* Output */}
          <div className="col-span-12 lg:col-span-8 border border-border flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
              <span className="data-label text-xs tracking-[0.3em]">RESPOSTA</span>
              <span className="font-mono text-xs font-bold border border-green-500/30 text-green-500 px-3 py-1 uppercase tracking-widest">
                PRONTO
              </span>
            </div>
            <div className="flex-1 p-8 overflow-auto max-h-[700px] bg-background">
              {result ? (
                <pre className="font-mono text-sm text-foreground whitespace-pre-wrap">
                  <code>{JSON.stringify(result, null, 2)}</code>
                </pre>
              ) : (
                <div className="h-64 flex items-center justify-center border border-dashed border-border">
                  <span className="font-mono text-sm text-muted-foreground uppercase tracking-widest">
                    Aguardando execução...
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
