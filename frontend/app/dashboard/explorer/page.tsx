"use client";

import { useState } from "react";

const endpoints = [
  { id: "01_LIGAS", path: "/v1/football/leagues", method: "GET", description: "Listar todas as ligas suportadas" },
  { id: "02_PARTIDAS", path: "/v1/football/fixtures", method: "GET", description: "Listar resultados e placares de partidas" },
  { id: "03_CLASSIFICAÇÃO", path: "/v1/football/standings", params: "?league=england-premier-league-2025-2026", method: "GET", description: "Tabela completa da liga" },
  { id: "04_ESTATÍSTICAS", path: "/v1/football/fixtures/lbnqyVFq/stats", method: "GET", description: "Métricas detalhadas de performance" },
  { id: "05_ESCALAÇÕES", path: "/v1/football/fixtures/lbnqyVFq/lineups", method: "GET", description: "Titulares e formações táticas" },
  { id: "06_EVENTOS", path: "/v1/football/fixtures/lbnqyVFq/events", method: "GET", description: "Linha do tempo de gols, cartões e substituições" },
  { id: "07_TIMES", path: "/v1/football/teams", params: "?league=england-premier-league-2025-2026", method: "GET", description: "Listar clubes de uma competição" },
  { id: "08_PARTIDAS_TIME", path: "/v1/football/teams/Liverpool/fixtures", method: "GET", description: "Histórico de partidas de um time específico" },
  { id: "09_ESTATS_LIGA", path: "/v1/football/leagues/england-premier-league-2025-2026/stats", method: "GET", description: "Estatísticas agregadas da temporada" },
];

export default function ExplorerPage() {
  const [selected, setSelected] = useState(endpoints[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const runRequest = async () => {
    if (!apiKey) {
      alert("ERRO: CHAVE_API_OBRIGATÓRIA");
      return;
    }
    setLoading(true);
    setResult({ status: "CONECTANDO_AOS_NÓS_DE_PRODUÇÃO..." });

    try {
      const url = `https://api.statsez.com${selected.path}${selected.params || ""}`;
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey }
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "TIMEOUT_DO_GATEWAY", details: "Verifique sua conexão ou status da chave API." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="border-b border-border pb-8">
        <span className="text-sm font-mono font-bold tracking-widest text-foreground/50 uppercase">
          SISTEMA_DE_DEBUG
        </span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">
          Explorador de API
        </h1>
        <p className="font-mono text-base text-red-500 mt-4 font-bold uppercase tracking-wider">
          AVISO: A execução deduzirá 1 unidade da sua quota quinzenal.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-12">
        {/* Sidebar Selection */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-base font-mono font-bold uppercase tracking-widest text-foreground/50">
              Chave de Produção
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
              Endpoints Disponíveis
            </label>
            <div className="border border-border divide-y divide-border max-h-[400px] overflow-y-auto custom-scrollbar">
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
                  <p className={`font-mono text-xs mt-2 ${selected.id === ep.id ? "opacity-70" : "text-muted-foreground"}`}>
                    {ep.description}
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
              {loading ? "PROCESSANDO_REQUISIÇÃO..." : "EXECUTAR_CONSULTA"}
          </button>
        </div>

        {/* Output Area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col border border-border">
          <div className="p-5 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
            <span className="text-base font-mono font-bold uppercase tracking-widest">
              Saída_JSON
            </span>
            <span className="text-sm font-mono bg-green-500/10 text-green-600 px-2 py-1 font-bold">
              PRONTO
            </span>
          </div>
          <div className="flex-1 p-8 overflow-auto max-h-[700px] custom-scrollbar bg-background">
            {result ? (
              <pre className="font-mono text-base leading-relaxed text-foreground whitespace-pre-wrap">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/50">
                <span className="font-mono text-base text-muted-foreground uppercase tracking-[0.2em]">
                  Aguardando execução...
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
