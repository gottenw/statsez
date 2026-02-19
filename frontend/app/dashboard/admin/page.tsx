"use client";

import { useEffect, useState } from "react";
import {
  getAdminStats,
  getAdminRequestVolume,
  getAdminTopEndpoints,
  getAdminRevenue,
  getAdminGrowth,
  getAdminCostAnalysis,
} from "../../../lib/api";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface Stats {
  totalUsers: number;
  activeSubscriptions: number;
  subscriptionsByPlan: Record<string, number>;
  totalRevenue: number;
  totalRequests: number;
  cachedRequests: number;
  cacheHitRatio: number;
}

interface CostAnalysis {
  totalRequestsThisMonth: number;
  currentUpstreamPlan: string;
  currentPlanLimit: number;
  currentPlanCost: number;
  percentageUsed: number;
  nextPlanThreshold: number | null;
  alerts: Array<{ level: string; message: string; recommendation: string }>;
  financials: {
    monthlyRevenue: number;
    upstreamCost: number;
    fixedCosts: number;
    estimatedProfit: number;
  };
  upstreamPlans: Array<{ name: string; limit: number; cost: number; costPerReq: number }>;
}

const chartTooltipStyle = {
  contentStyle: {
    background: "#0a0a0a",
    border: "1px solid #262626",
    fontFamily: "JetBrains Mono, monospace",
    fontSize: "11px",
  },
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [requestData, setRequestData] = useState<Array<{ date: string; requests: number }>>([]);
  const [revenueData, setRevenueData] = useState<Array<{ date: string; revenue: number }>>([]);
  const [growthData, setGrowthData] = useState<Array<{ date: string; newUsers: number }>>([]);
  const [topEndpoints, setTopEndpoints] = useState<Array<{ endpoint: string; count: number }>>([]);
  const [costAnalysis, setCostAnalysis] = useState<CostAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [requestPeriod, setRequestPeriod] = useState("7d");

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    getAdminRequestVolume(requestPeriod).then((res) => setRequestData(res.data || [])).catch(() => {});
  }, [requestPeriod]);

  async function loadData() {
    try {
      const [statsRes, reqRes, revRes, growthRes, endpointsRes, costRes] = await Promise.all([
        getAdminStats(),
        getAdminRequestVolume("7d"),
        getAdminRevenue("30d"),
        getAdminGrowth("30d"),
        getAdminTopEndpoints(10),
        getAdminCostAnalysis(),
      ]);
      setStats(statsRes.data);
      setRequestData(reqRes.data || []);
      setRevenueData(revRes.data || []);
      setGrowthData(growthRes.data || []);
      setTopEndpoints(endpointsRes.data || []);
      setCostAnalysis(costRes.data);
    } catch (err) {
      console.error("Failed to load admin data");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="section-padding py-24">
        <div className="font-mono text-sm text-muted-foreground animate-pulse">LOADING_ADMIN_DATA...</div>
      </div>
    );
  }

  const alertColors: Record<string, string> = {
    info: "border-blue-500/30 bg-blue-500/5 text-blue-400",
    warning: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
    critical: "border-red-500/30 bg-red-500/5 text-red-500",
  };

  const barColor =
    (costAnalysis?.percentageUsed ?? 0) > 95
      ? "#ef4444"
      : (costAnalysis?.percentageUsed ?? 0) > 80
        ? "#eab308"
        : "#fafafa";

  return (
    <div>
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <span className="data-label tracking-[0.3em]">ADMIN</span>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              Control
              <br />
              <span className="text-muted">Panel</span>
            </h2>
          </div>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
        <KpiCard label="TOTAL USERS" value={stats?.totalUsers ?? 0} />
        <KpiCard label="ACTIVE SUBS" value={stats?.activeSubscriptions ?? 0} />
        <KpiCard label="TOTAL REVENUE" value={`R$ ${(stats?.totalRevenue ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`} />
        <KpiCard label="CACHE HIT RATE" value={`${stats?.cacheHitRatio ?? 0}%`} />
      </div>

      {/* Subscriptions by Plan */}
      <div className="section-padding py-12 border-b border-border">
        <span className="data-label tracking-[0.3em] mb-6 block">SUBSCRIPTIONS BY PLAN</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
          {["free", "dev", "enterprise", "gold"].map((plan) => (
            <div key={plan} className="border border-border p-6">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{plan}</span>
              <p className="font-mono text-3xl font-medium tracking-tighter mt-2">
                {stats?.subscriptionsByPlan[plan] ?? 0}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-border">
        {/* Request Volume Chart */}
        <div className="section-padding py-12 border-b md:border-b-0 md:border-r border-border">
          <div className="flex items-center justify-between mb-6">
            <span className="data-label tracking-[0.3em]">REQUEST VOLUME</span>
            <div className="flex gap-2">
              {["7d", "30d", "90d"].map((p) => (
                <button
                  key={p}
                  onClick={() => setRequestPeriod(p)}
                  className={`font-mono text-[10px] px-3 py-1.5 border transition-all ${
                    requestPeriod === p
                      ? "border-foreground bg-foreground text-background"
                      : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={requestData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Tooltip {...chartTooltipStyle} />
                <Line type="monotone" dataKey="requests" stroke="#fafafa" strokeWidth={1.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Chart */}
        <div className="section-padding py-12">
          <span className="data-label tracking-[0.3em] mb-6 block">REVENUE (30D)</span>
          <div className="h-[250px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis
                  dataKey="date"
                  stroke="#737373"
                  tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                  tickFormatter={(v) => v.slice(5)}
                />
                <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} />
                <Tooltip {...chartTooltipStyle} />
                <Bar dataKey="revenue" fill="#fafafa" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Top Endpoints */}
      <div className="section-padding py-12 border-b border-border">
        <span className="data-label tracking-[0.3em] mb-6 block">TOP ENDPOINTS</span>
        <div className="space-y-0">
          {topEndpoints.map((ep, i) => (
            <div key={ep.endpoint} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-4">
                <span className="font-mono text-xs text-muted-foreground w-6">{String(i + 1).padStart(2, "0")}</span>
                <span className="font-mono text-sm">{ep.endpoint}</span>
              </div>
              <span className="font-mono text-sm font-medium">{ep.count.toLocaleString()}</span>
            </div>
          ))}
          {topEndpoints.length === 0 && (
            <p className="font-mono text-sm text-muted-foreground">No data available</p>
          )}
        </div>
      </div>

      {/* Cost Analysis */}
      {costAnalysis && (
        <div className="section-padding py-12 border-b border-border">
          <span className="data-label tracking-[0.3em] mb-6 block">UPSTREAM COST ANALYSIS</span>

          {/* Progress bar */}
          <div className="mt-4 mb-6">
            <div className="flex justify-between mb-2">
              <span className="font-mono text-xs text-muted-foreground">
                {costAnalysis.currentUpstreamPlan} — {costAnalysis.totalRequestsThisMonth.toLocaleString()} / {costAnalysis.currentPlanLimit.toLocaleString()} requests
              </span>
              <span className="font-mono text-xs font-bold" style={{ color: barColor }}>
                {costAnalysis.percentageUsed.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-foreground/[0.06] border border-border">
              <div
                className="h-full transition-all duration-500"
                style={{ width: `${Math.min(costAnalysis.percentageUsed, 100)}%`, backgroundColor: barColor }}
              />
            </div>
          </div>

          {/* Alerts */}
          {costAnalysis.alerts.length > 0 && (
            <div className="space-y-2 mb-6">
              {costAnalysis.alerts.map((alert, i) => (
                <div key={i} className={`border p-4 ${alertColors[alert.level] || ""}`}>
                  <span className="font-mono text-[10px] uppercase tracking-[0.2em] font-bold">[{alert.level.toUpperCase()}]</span>
                  <p className="font-mono text-sm mt-1">{alert.message}</p>
                  <p className="font-mono text-xs text-muted-foreground mt-1">{alert.recommendation}</p>
                </div>
              ))}
            </div>
          )}

          {/* Financials */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <FinancialCard label="MONTHLY REVENUE" value={`R$ ${costAnalysis.financials.monthlyRevenue.toFixed(2)}`} />
            <FinancialCard label="UPSTREAM COST" value={`R$ ${costAnalysis.financials.upstreamCost.toFixed(2)}`} negative />
            <FinancialCard label="FIXED COSTS" value={`R$ ${costAnalysis.financials.fixedCosts.toFixed(2)}`} negative />
            <FinancialCard
              label="EST. PROFIT"
              value={`R$ ${costAnalysis.financials.estimatedProfit.toFixed(2)}`}
              positive={costAnalysis.financials.estimatedProfit > 0}
            />
          </div>

          {/* Upstream Plans Table */}
          <div className="mt-6 border border-border">
            <div className="grid grid-cols-4 gap-0 border-b border-border bg-foreground/[0.03]">
              <div className="p-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Plan</div>
              <div className="p-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Limit</div>
              <div className="p-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cost</div>
              <div className="p-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Per Req</div>
            </div>
            {costAnalysis.upstreamPlans.map((plan) => (
              <div
                key={plan.name}
                className={`grid grid-cols-4 gap-0 border-b border-border last:border-0 ${
                  plan.name === costAnalysis.currentUpstreamPlan ? "bg-foreground/[0.05]" : ""
                }`}
              >
                <div className="p-3 font-mono text-sm">
                  {plan.name}
                  {plan.name === costAnalysis.currentUpstreamPlan && (
                    <span className="ml-2 text-[9px] bg-foreground text-background px-1.5 py-0.5 tracking-widest">CURRENT</span>
                  )}
                </div>
                <div className="p-3 font-mono text-sm">{plan.limit.toLocaleString()}</div>
                <div className="p-3 font-mono text-sm">R$ {plan.cost}</div>
                <div className="p-3 font-mono text-sm text-muted-foreground">R$ {plan.costPerReq.toFixed(6)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Growth Chart */}
      <div className="section-padding py-12 border-b border-border">
        <span className="data-label tracking-[0.3em] mb-6 block">USER GROWTH (30D)</span>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={growthData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
              <XAxis
                dataKey="date"
                stroke="#737373"
                tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis stroke="#737373" tick={{ fontSize: 10, fontFamily: "JetBrains Mono" }} allowDecimals={false} />
              <Tooltip {...chartTooltipStyle} />
              <Bar dataKey="newUsers" fill="#3b82f6" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Quick Navigation */}
      <div className="section-padding py-12">
        <span className="data-label tracking-[0.3em] mb-6 block">MANAGEMENT</span>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <NavCard href="/dashboard/admin/users" label="USERS" desc="Manage users, plans and quotas" />
          <NavCard href="/dashboard/admin/payments" label="PAYMENTS" desc="View all payment transactions" />
          <NavCard href="/dashboard/admin/system" label="SYSTEM" desc="Cache, logs and system health" />
        </div>
      </div>
    </div>
  );
}

function KpiCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-8 border-r border-border last:border-r-0">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <p className="font-mono text-3xl font-medium tracking-tighter mt-2">{value}</p>
    </div>
  );
}

function FinancialCard({
  label,
  value,
  negative,
  positive,
}: {
  label: string;
  value: string;
  negative?: boolean;
  positive?: boolean;
}) {
  return (
    <div className="border border-border p-4">
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <p className={`font-mono text-xl font-medium tracking-tighter mt-2 ${negative ? "text-red-400/80" : positive ? "text-green-400" : ""}`}>
        {value}
      </p>
    </div>
  );
}

function NavCard({ href, label, desc }: { href: string; label: string; desc: string }) {
  return (
    <a
      href={href}
      className="border border-border p-6 hover:bg-foreground/[0.03] transition-all duration-300 group"
    >
      <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] group-hover:text-foreground text-muted-foreground">
        {label}
      </span>
      <p className="font-mono text-[11px] text-muted-foreground mt-2">{desc}</p>
    </a>
  );
}
