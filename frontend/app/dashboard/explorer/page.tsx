"use client";

import { useState } from "react";

const endpoints = [
  { id: "01_LEAGUES", path: "/v1/football/leagues", method: "GET", description: "List all supported leagues" },
  { id: "02_FIXTURES", path: "/v1/football/fixtures", method: "GET", description: "List match results and scores" },
  { id: "03_STANDINGS", path: "/v1/football/standings", params: "?league=england-premier-league-2025-2026", method: "GET", description: "Full league table" },
  { id: "04_STATISTICS", path: "/v1/football/fixtures/lbnqyVFq/stats", method: "GET", description: "Detailed performance metrics" },
  { id: "05_LINEUPS", path: "/v1/football/fixtures/lbnqyVFq/lineups", method: "GET", description: "Starting XI and tactical formations" },
  { id: "06_EVENTS", path: "/v1/football/fixtures/lbnqyVFq/events", method: "GET", description: "Timeline of goals, cards and subs" },
  { id: "07_TEAMS", path: "/v1/football/teams", params: "?league=england-premier-league-2025-2026", method: "GET", description: "List clubs in a competition" },
  { id: "08_TEAM_FIXTURES", path: "/v1/football/teams/Liverpool/fixtures", method: "GET", description: "Match history for a specific team" },
  { id: "09_LEAGUE_STATS", path: "/v1/football/leagues/england-premier-league-2025-2026/stats", method: "GET", description: "Aggregate season statistics" },
];

export default function ExplorerPage() {
  const [selected, setSelected] = useState(endpoints[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");

  const runRequest = async () => {
    if (!apiKey) {
      alert("ERROR: API_KEY_REQUIRED");
      return;
    }
    setLoading(true);
    setResult({ status: "CONNECTING_TO_PRODUCTION_NODES..." });

    try {
      const url = `https://api.statsez.com${selected.path}${selected.params || ""}`;
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey }
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "GATEWAY_TIMEOUT", details: "Check your connection or API key status." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      <header className="border-b border-border pb-8">
        <span className="text-sm font-mono font-bold tracking-widest text-foreground/50 uppercase">API_DEBUGGER_SYSTEM</span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">API_Explorer_v1.0</h1>
        <p className="font-mono text-sm text-red-500 mt-4 font-bold uppercase tracking-wider">
          NOTICE: Execution will deduct 1 unit from your bi-weekly quota.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-12">
        {/* Sidebar Selection */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <div className="space-y-4">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-foreground/50">Production_Key</label>
            <input 
              type="password" 
              placeholder="PASTE_YOUR_KEY_HERE"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background border border-border p-5 font-mono text-sm focus:border-foreground outline-none transition-all"
            />
          </div>

          <div className="space-y-4">
            <label className="text-xs font-mono font-bold uppercase tracking-widest text-foreground/50">Available_Endpoints</label>
            <div className="border border-border divide-y divide-border max-h-[400px] overflow-y-auto custom-scrollbar">
              {endpoints.map((ep) => (
                <button
                  key={ep.id}
                  onClick={() => setSelected(ep)}
                  className={`w-full text-left p-5 transition-colors ${
                    selected.id === ep.id ? "bg-foreground text-background" : "hover:bg-foreground/[0.03]"
                  }`}
                >
                  <p className="font-mono text-xs font-bold">{ep.id}</p>
                  <p className={`font-mono text-[11px] mt-1 ${selected.id === ep.id ? "opacity-70" : "text-muted-foreground"}`}>
                    {ep.path}
                  </p>
                </button>
              ))}
            </div>
          </div>

          <button 
            onClick={runRequest}
            disabled={loading}
            className="w-full font-mono text-sm font-bold bg-foreground text-background py-6 hover:bg-foreground/90 transition-all uppercase tracking-[0.2em]"
          >
            {loading ? "PROCESING_REQUEST..." : "RUN_REMOTE_QUERY"}
          </button>
        </div>

        {/* Output Area */}
        <div className="col-span-12 lg:col-span-8 flex flex-col border border-border">
          <div className="p-5 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
            <span className="text-xs font-mono font-bold uppercase tracking-widest">JSON_Output_Stream</span>
            <span className="text-[10px] font-mono bg-green-500/10 text-green-600 px-2 py-0.5 font-bold">READY_TO_STREAM</span>
          </div>
          <div className="flex-1 p-8 overflow-auto max-h-[700px] custom-scrollbar bg-background">
            {result ? (
              <pre className="font-mono text-sm leading-relaxed text-foreground whitespace-pre-wrap">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            ) : (
              <div className="h-64 flex items-center justify-center border-2 border-dashed border-border/50">
                <span className="font-mono text-xs text-muted-foreground uppercase tracking-[0.2em]">Awaiting user execution...</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}