"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface EndpointParam {
  name: string;
  type: "path" | "query";
  required: boolean;
  placeholder: string;
  defaultValue?: string;
}

interface Endpoint {
  id: string;
  path: string;
  method: string;
  description: string;
  params: EndpointParam[];
}

const endpoints: Endpoint[] = [
  {
    id: "01_LEAGUES",
    path: "/v1/football/leagues",
    method: "GET",
    description: "List all supported leagues",
    params: [
      { name: "country", type: "query", required: false, placeholder: "e.g. Brazil" },
    ],
  },
  {
    id: "02_FIXTURES",
    path: "/v1/football/fixtures",
    method: "GET",
    description: "Match results and scores",
    params: [
      { name: "league", type: "query", required: true, placeholder: "e.g. Yq4hUnzQ" },
      { name: "season", type: "query", required: false, placeholder: "e.g. 2024-2025" },
      { name: "team", type: "query", required: false, placeholder: "e.g. Palmeiras" },
      { name: "round", type: "query", required: false, placeholder: "e.g. Round 1" },
      { name: "dateFrom", type: "query", required: false, placeholder: "YYYY-MM-DD" },
      { name: "dateTo", type: "query", required: false, placeholder: "YYYY-MM-DD" },
    ],
  },
  {
    id: "03_STANDINGS",
    path: "/v1/football/standings",
    method: "GET",
    description: "Full league table",
    params: [
      { name: "league", type: "query", required: true, placeholder: "e.g. Yq4hUnzQ" },
      { name: "season", type: "query", required: false, placeholder: "e.g. 2024-2025" },
    ],
  },
  {
    id: "04_STATS",
    path: "/v1/football/fixtures/{id}/stats",
    method: "GET",
    description: "Detailed match statistics (34+ metrics)",
    params: [
      { name: "id", type: "path", required: true, placeholder: "e.g. lbnqyVFq" },
    ],
  },
  {
    id: "05_LINEUPS",
    path: "/v1/football/fixtures/{id}/lineups",
    method: "GET",
    description: "Formations and starting XI",
    params: [
      { name: "id", type: "path", required: true, placeholder: "e.g. lbnqyVFq" },
    ],
  },
  {
    id: "06_EVENTS",
    path: "/v1/football/fixtures/{id}/events",
    method: "GET",
    description: "Goals, cards, substitutions",
    params: [
      { name: "id", type: "path", required: true, placeholder: "e.g. lbnqyVFq" },
    ],
  },
  {
    id: "07_TEAMS",
    path: "/v1/football/teams",
    method: "GET",
    description: "List teams in a league",
    params: [
      { name: "league", type: "query", required: true, placeholder: "e.g. Yq4hUnzQ" },
      { name: "season", type: "query", required: false, placeholder: "e.g. 2024-2025" },
      { name: "search", type: "query", required: false, placeholder: "e.g. Arsenal" },
    ],
  },
  {
    id: "08_TEAM_FIXTURES",
    path: "/v1/football/teams/{teamName}/fixtures",
    method: "GET",
    description: "Match history for a team",
    params: [
      { name: "teamName", type: "path", required: true, placeholder: "e.g. Liverpool" },
      { name: "league", type: "query", required: true, placeholder: "e.g. Yq4hUnzQ" },
      { name: "season", type: "query", required: false, placeholder: "e.g. 2024-2025" },
    ],
  },
  {
    id: "09_LEAGUE_SEASONS",
    path: "/v1/football/leagues/{leagueId}/seasons",
    method: "GET",
    description: "List available seasons for a league",
    params: [
      { name: "leagueId", type: "path", required: true, placeholder: "e.g. Yq4hUnzQ" },
    ],
  },
  {
    id: "10_LEAGUE_STATS",
    path: "/v1/football/leagues/{leagueId}/stats",
    method: "GET",
    description: "Aggregate season statistics",
    params: [
      { name: "leagueId", type: "path", required: true, placeholder: "e.g. Yq4hUnzQ" },
      { name: "season", type: "query", required: false, placeholder: "e.g. 2024-2025" },
    ],
  },
];

export default function ExplorerPage() {
  const [selected, setSelected] = useState(endpoints[0]);
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [paramValues, setParamValues] = useState<Record<string, string>>({});
  const t = useTranslations("dashboard");

  useEffect(() => {
    setParamValues({});
  }, [selected.id]);

  const buildUrl = () => {
    let path = selected.path;

    for (const param of selected.params) {
      if (param.type === "path") {
        const value = paramValues[param.name] || "";
        path = path.replace(`{${param.name}}`, encodeURIComponent(value));
      }
    }

    const queryParams = selected.params
      .filter((p) => p.type === "query" && paramValues[p.name])
      .map((p) => `${p.name}=${encodeURIComponent(paramValues[p.name])}`)
      .join("&");

    return `https://api.statsez.com${path}${queryParams ? `?${queryParams}` : ""}`;
  };

  const runRequest = async () => {
    if (!apiKey) {
      alert("ERROR: API_KEY_REQUIRED");
      return;
    }

    const missingRequired = selected.params.filter(
      (p) => p.required && !paramValues[p.name]
    );
    if (missingRequired.length > 0) {
      alert(`ERROR: MISSING_REQUIRED_PARAMS: ${missingRequired.map((p) => p.name).join(", ")}`);
      return;
    }

    setLoading(true);
    setResult({ status: "CONNECTING..." });

    try {
      const url = buildUrl();
      const res = await fetch(url, {
        headers: { "x-api-key": apiKey },
      });
      const data = await res.json();
      setResult(data);
    } catch (err) {
      setResult({ error: "CONNECTION_ERROR", details: "Check your API key." });
    } finally {
      setLoading(false);
    }
  };

  const displayUrl = buildUrl();

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
              {t("explorerWarning")}
            </p>
          </div>
        </div>
      </div>

      {/* API Key Input */}
      <div className="section-padding py-16 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-3">
            <span className="data-label">{t("explorerAuth")}</span>
          </div>
          <div className="col-span-12 md:col-span-9">
            <span className="data-label text-xs opacity-50 block mb-4">{t("explorerApiKey")}</span>
            <input
              type="password"
              placeholder="PASTE_YOUR_KEY_HERE"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full bg-background border border-border p-5 font-mono text-base focus:border-foreground outline-none transition-all"
            />
          </div>
        </div>
      </div>

      {/* Endpoint Selection + Params + Output */}
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
                  <p
                    className={`font-mono text-xs mt-1 uppercase tracking-widest ${
                      selected.id === ep.id ? "opacity-70" : "text-muted-foreground"
                    }`}
                  >
                    {ep.path}
                  </p>
                </button>
              ))}
            </div>

            {/* Parameters */}
            {selected.params.length > 0 && (
              <div className="border border-border">
                <div className="p-4 border-b border-border bg-foreground/[0.02]">
                  <span className="data-label text-xs tracking-[0.3em]">{t("explorerParams")}</span>
                </div>
                <div className="p-4 space-y-4">
                  {selected.params.map((param) => (
                    <div key={param.name}>
                      <label className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-xs font-bold uppercase tracking-wider text-foreground">
                          {param.name}
                        </span>
                        {param.required ? (
                          <span className="text-[9px] font-mono font-bold text-red-500 uppercase tracking-widest">
                            REQUIRED
                          </span>
                        ) : (
                          <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">
                            OPTIONAL
                          </span>
                        )}
                      </label>
                      <input
                        type="text"
                        placeholder={param.placeholder}
                        value={paramValues[param.name] || ""}
                        onChange={(e) =>
                          setParamValues((prev) => ({
                            ...prev,
                            [param.name]: e.target.value,
                          }))
                        }
                        className="w-full bg-background border border-border p-3 font-mono text-sm focus:border-foreground outline-none transition-all"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* URL Preview */}
            <div className="border border-border p-4 bg-foreground/[0.02]">
              <span className="data-label text-[9px] tracking-[0.3em] block mb-2 opacity-50">
                REQUEST URL
              </span>
              <p className="font-mono text-xs text-foreground break-all leading-relaxed">
                {displayUrl}
              </p>
            </div>

            <button
              onClick={runRequest}
              disabled={loading}
              className="w-full font-mono text-xs font-bold uppercase tracking-[0.2em] border border-foreground bg-foreground text-background py-6 hover:bg-background hover:text-foreground transition-all disabled:opacity-50"
            >
              {loading ? "PROCESSING..." : t("explorerExecute")}
            </button>
          </div>

          {/* Output */}
          <div className="col-span-12 lg:col-span-8 border border-border flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-center bg-foreground/[0.02]">
              <span className="data-label text-xs tracking-[0.3em]">{t("explorerResponse")}</span>
              <span className="font-mono text-xs font-bold border border-green-500/30 text-green-500 px-3 py-1 uppercase tracking-widest">
                {t("explorerReady")}
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
                    {t("explorerWaiting")}
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
