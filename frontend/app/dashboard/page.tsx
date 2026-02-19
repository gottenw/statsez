"use client";

import { motion } from "framer-motion";

export default function DashboardOverview() {
  return (
    <div className="p-8 md:p-12 max-w-7xl mx-auto space-y-16">
      <header>
        <span className="text-sm font-mono font-bold tracking-[0.2em] text-foreground/50 uppercase">REAL_TIME_OPERATIONS</span>
        <h1 className="font-sans text-3xl font-medium uppercase mt-2 tracking-tight">Operational_Metrics</h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 border border-border bg-border gap-px">
        <StatItem label="License_Model" value="Dev Plan" subValue="Standard_Access" />
        <StatItem label="Monthly_Quota" value="40,000" subValue="Units_Available" />
        <StatItem label="Active_Usage" value="0" subValue="Requests_Served" />
        <StatItem label="Cache_Speed" value="< 50ms" subValue="Global_Latency" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
        <div className="lg:col-span-2 space-y-8">
          <div className="p-10 border border-border bg-foreground/[0.01]">
            <div className="flex justify-between items-center mb-16">
              <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/50">TRAFFIC_DENSITY</span>
              <div className="flex gap-6 font-mono text-[10px] font-bold uppercase tracking-widest">
                <span className="bg-foreground text-background px-3 py-1">24H_CYCLE</span>
                <span className="border border-border px-3 py-1 text-muted-foreground hover:text-foreground transition-colors cursor-pointer">7D_CYCLE</span>
              </div>
            </div>
            <div className="h-72 border-b border-border flex items-end gap-2">
              {[30, 60, 40, 85, 55, 75, 25, 45, 80, 55, 90, 65, 40, 70].map((h, i) => (
                <div key={i} className="flex-1 bg-foreground/10 hover:bg-foreground transition-all duration-300" style={{ height: `${h}%` }} />
              ))}
            </div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-[0.3em] mt-6 text-center">
              Active node traffic monitor / processing_packets_stream
            </p>
          </div>
        </div>

        <div className="p-10 border border-border bg-background">
          <span className="text-xs font-mono font-bold uppercase tracking-[0.2em] text-foreground/50 mb-10 block">SYSTEM_EVENTS</span>
          <div className="space-y-10">
            <LogEntry time="10:24:01" code="AUTH_OK" details="Source: Production_Key" />
            <LogEntry time="10:23:58" code="CACHE_HIT" details="Req: /v1/fixtures" />
            <LogEntry time="09:12:44" code="SES_INIT" details="Agent: Desktop_Terminal" />
            <LogEntry time="Yesterday" code="SUB_VALID" details="Status: Verified" />
          </div>
        </div>
      </div>
    </div>
  );
}

function StatItem({ label, value, subValue }: any) {
  return (
    <div className="p-10 bg-background group hover:bg-foreground/[0.02] transition-colors">
      <span className="text-xs font-mono font-bold text-foreground/40 block mb-10 uppercase tracking-widest">{label}</span>
      <div>
        <span className="font-mono text-3xl font-medium tracking-tighter text-foreground block uppercase mb-1">
          {value}
        </span>
        <span className="font-mono text-[11px] text-muted-foreground uppercase tracking-widest font-bold">
          {subValue}
        </span>
      </div>
    </div>
  );
}

function LogEntry({ time, code, details }: any) {
  return (
    <div className="flex flex-col gap-2 border-l-2 border-border pl-6">
      <div className="flex justify-between items-baseline">
        <span className="font-mono text-[11px] text-muted-foreground font-bold">{time}</span>
        <span className="font-mono text-[10px] bg-foreground/[0.05] border border-border px-2 py-0.5 text-foreground font-bold">{code}</span>
      </div>
      <p className="font-mono text-xs text-foreground uppercase tracking-tight font-medium">{details}</p>
    </div>
  );
}
