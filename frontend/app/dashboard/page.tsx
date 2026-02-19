"use client";

import { motion } from "framer-motion";
import { Activity, Zap, Database, BarChart3 } from "lucide-react";

export default function DashboardOverview() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <header>
        <span className="data-label">OPERATIONAL_OVERVIEW</span>
        <h1 className="display-text text-4xl uppercase mt-2">Welcome Back</h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-px bg-border border border-border">
        <StatItem label="Active Subscription" value="Dev Plan" icon={Zap} />
        <StatItem label="Request Quota" value="40,000" subValue="/ month" icon={Database} />
        <StatItem label="Current Usage" value="128" subValue=" (0.3%)" icon={Activity} />
        <StatItem label="Cache Efficiency" value="94.2%" icon={BarChart3} color="text-blue-500" />
      </div>

      {/* Usage Chart Placeholder */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 p-8 border border-border bg-foreground/[0.01]">
          <div className="flex justify-between items-center mb-12">
            <span className="data-label">REQUEST_TIMELINE</span>
            <div className="flex gap-4">
              <span className="font-mono text-[9px] uppercase tracking-widest bg-foreground text-background px-2 py-0.5">Last 24h</span>
              <span className="font-mono text-[9px] uppercase tracking-widest border border-border px-2 py-0.5">Last 7d</span>
            </div>
          </div>
          <div className="h-64 w-full bg-border/20 animate-pulse flex items-center justify-center">
            <span className="font-mono text-[10px] text-muted-foreground uppercase tracking-widest">Generating Metrics Visualizer...</span>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="p-8 border border-border">
          <span className="data-label mb-8 block">SYSTEM_LOGS</span>
          <div className="space-y-6">
            <LogEntry time="10:24:01" msg="API_KEY_AUTH_SUCCESS" meta="IP: 189.xx.xx.45" />
            <LogEntry time="10:23:58" msg="FIXTURES_QUERY_CACHE_HIT" meta="league: PL_2025" />
            <LogEntry time="09:12:44" msg="LOGIN_DETECTED" meta="Safari / Mac" />
            <LogEntry time="Yesterday" msg="SUBSCRIPTION_RENEWED" meta="Plan: Dev" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, subValue, icon: Icon, color }: any) {
  return (
    <div className="bg-background p-8 flex flex-col justify-between group hover:bg-foreground/[0.02] transition-colors">
      <div className="flex justify-between items-start mb-8">
        <span className="data-label text-[10px] opacity-50">{label}</span>
        <Icon size={16} className="text-muted-foreground" />
      </div>
      <div>
        <span className={`font-mono text-3xl font-medium tracking-tighter ${color || "text-foreground"}`}>
          {value}
        </span>
        {subValue && <span className="font-mono text-sm text-muted-foreground ml-1">{subValue}</span>}
      </div>
    </div>
  );
}

function LogEntry({ time, msg, meta }: any) {
  return (
    <div className="border-l-2 border-border pl-4 py-1">
      <p className="font-mono text-[10px] text-muted-foreground">{time}</p>
      <p className="font-mono text-[11px] font-bold uppercase tracking-tight text-foreground">{msg}</p>
      <p className="font-mono text-[9px] text-muted-foreground opacity-60">{meta}</p>
    </div>
  );
}
