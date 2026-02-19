"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminCacheStats, deleteExpiredCache, getAdminLogs } from "../../../../lib/api";

interface CacheStats {
  totalEntries: number;
  expiredEntries: number;
  activeEntries: number;
  bySport: Array<{ sport: string; count: number }>;
  byEndpoint: Array<{ endpoint: string; count: number }>;
}

interface LogEntry {
  id: string;
  apiKeyId: string;
  subscriptionId: string;
  sport: string;
  endpoint: string;
  statusCode: number;
  cached: boolean;
  responseTimeMs: number;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminSystemPage() {
  const [cache, setCache] = useState<CacheStats | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [logPagination, setLogPagination] = useState<Pagination>({ page: 1, limit: 50, total: 0, totalPages: 0 });
  const [sportFilter, setSportFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [clearing, setClearing] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cacheRes, logsRes] = await Promise.all([
        getAdminCacheStats(),
        getAdminLogs(1, ""),
      ]);
      setCache(cacheRes.data);
      setLogs(logsRes.data || []);
      setLogPagination(logsRes.pagination);
    } catch {
      console.error("Failed to load system data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  async function loadLogs(page: number, sport: string) {
    try {
      const res = await getAdminLogs(page, sport);
      setLogs(res.data || []);
      setLogPagination(res.pagination);
    } catch {
      console.error("Failed to load logs");
    }
  }

  useEffect(() => {
    loadLogs(1, sportFilter);
  }, [sportFilter]);

  async function handleClearCache() {
    if (!confirm("Delete all expired cache entries?")) return;
    setClearing(true);
    try {
      const res = await deleteExpiredCache();
      alert(`Deleted ${res.data.deleted} expired entries`);
      loadData();
    } catch {
      alert("Failed to clear cache");
    } finally {
      setClearing(false);
    }
  }

  if (loading) {
    return (
      <div className="section-padding py-24">
        <div className="font-mono text-sm text-muted-foreground animate-pulse">LOADING_SYSTEM_DATA...</div>
      </div>
    );
  }

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
              System
              <br />
              <span className="text-muted">Health</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Cache Stats */}
      <div className="section-padding py-12 border-b border-border">
        <div className="flex items-center justify-between mb-6">
          <span className="data-label tracking-[0.3em]">CACHE STATUS</span>
          <button
            onClick={handleClearCache}
            disabled={clearing || (cache?.expiredEntries ?? 0) === 0}
            className="font-mono text-[10px] uppercase tracking-[0.2em] border border-red-500/30 text-red-400 px-4 py-2 hover:bg-red-500 hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            {clearing ? "CLEARING..." : `CLEAR EXPIRED (${cache?.expiredEntries ?? 0})`}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-border p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Total Entries</span>
            <p className="font-mono text-3xl font-medium tracking-tighter mt-2">{cache?.totalEntries ?? 0}</p>
          </div>
          <div className="border border-border p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Active</span>
            <p className="font-mono text-3xl font-medium tracking-tighter mt-2 text-green-400">{cache?.activeEntries ?? 0}</p>
          </div>
          <div className="border border-border p-6">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Expired</span>
            <p className="font-mono text-3xl font-medium tracking-tighter mt-2 text-red-400">{cache?.expiredEntries ?? 0}</p>
          </div>
        </div>

        {/* Cache by Sport */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block">BY SPORT</span>
            {cache?.bySport.map((s) => (
              <div key={s.sport} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-mono text-sm">{s.sport}</span>
                <span className="font-mono text-sm font-medium">{s.count}</span>
              </div>
            ))}
            {(!cache?.bySport || cache.bySport.length === 0) && (
              <p className="font-mono text-sm text-muted-foreground">No cache data</p>
            )}
          </div>
          <div>
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground mb-3 block">BY ENDPOINT</span>
            {cache?.byEndpoint.map((e) => (
              <div key={e.endpoint} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="font-mono text-sm">{e.endpoint}</span>
                <span className="font-mono text-sm font-medium">{e.count}</span>
              </div>
            ))}
            {(!cache?.byEndpoint || cache.byEndpoint.length === 0) && (
              <p className="font-mono text-sm text-muted-foreground">No cache data</p>
            )}
          </div>
        </div>
      </div>

      {/* Request Logs */}
      <div className="section-padding py-12">
        <div className="flex items-center justify-between mb-6">
          <span className="data-label tracking-[0.3em]">REQUEST LOGS</span>
          <div className="flex gap-2">
            {["", "football", "basketball", "tennis", "hockey"].map((s) => (
              <button
                key={s || "all"}
                onClick={() => setSportFilter(s)}
                className={`font-mono text-[10px] uppercase tracking-[0.2em] border px-3 py-1.5 transition-all ${
                  sportFilter === s
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {s || "ALL"}
              </button>
            ))}
          </div>
        </div>

        {/* Log Table Header */}
        <div className="grid grid-cols-12 gap-2 py-3 border-b border-border bg-foreground/[0.02]">
          <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Time</div>
          <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Sport</div>
          <div className="col-span-3 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Endpoint</div>
          <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Status</div>
          <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Cached</div>
          <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Time(ms)</div>
          <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.15em] text-muted-foreground px-2">Sub ID</div>
        </div>

        {logs.map((log) => (
          <div key={log.id} className="grid grid-cols-12 gap-2 py-2.5 border-b border-border hover:bg-foreground/[0.02] transition-colors">
            <div className="col-span-2 font-mono text-xs px-2">{new Date(log.createdAt).toLocaleString("pt-BR", { hour: "2-digit", minute: "2-digit", second: "2-digit", day: "2-digit", month: "2-digit" })}</div>
            <div className="col-span-2 font-mono text-xs px-2">{log.sport}</div>
            <div className="col-span-3 font-mono text-xs truncate px-2">{log.endpoint}</div>
            <div className="col-span-1 px-2">
              <span className={`font-mono text-xs ${log.statusCode >= 400 ? "text-red-400" : "text-green-400"}`}>{log.statusCode}</span>
            </div>
            <div className="col-span-1 px-2">
              <span className={`font-mono text-xs ${log.cached ? "text-blue-400" : "text-muted-foreground"}`}>{log.cached ? "HIT" : "MISS"}</span>
            </div>
            <div className="col-span-1 font-mono text-xs text-muted-foreground px-2">{log.responseTimeMs}</div>
            <div className="col-span-2 font-mono text-[10px] text-muted-foreground truncate px-2">{log.subscriptionId.substring(0, 8)}...</div>
          </div>
        ))}

        {logs.length === 0 && (
          <div className="py-12 text-center font-mono text-sm text-muted-foreground">No logs found</div>
        )}

        {logPagination.totalPages > 1 && (
          <div className="flex items-center justify-between py-6">
            <span className="font-mono text-xs text-muted-foreground">
              Page {logPagination.page} of {logPagination.totalPages} ({logPagination.total} total)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => loadLogs(logPagination.page - 1, sportFilter)}
                disabled={logPagination.page <= 1}
                className="font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Prev
              </button>
              <button
                onClick={() => loadLogs(logPagination.page + 1, sportFilter)}
                disabled={logPagination.page >= logPagination.totalPages}
                className="font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
