"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminPayments } from "../../../../lib/api";

interface PaymentRow {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerId: string | null;
  paidAt: string | null;
  createdAt: string;
  plan: string | null;
  userEmail: string | null;
  userName: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const STATUS_TABS = ["", "paid", "pending", "failed", "refunded"];

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<PaymentRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async (page: number, status: string) => {
    setLoading(true);
    try {
      const res = await getAdminPayments(page, status);
      setPayments(res.data || []);
      setPagination(res.pagination);
    } catch {
      console.error("Failed to load payments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPayments(1, statusFilter);
  }, [statusFilter, loadPayments]);

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
              Payment
              <br />
              <span className="text-muted">History</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Status Filter Tabs */}
      <div className="section-padding py-6 border-b border-border flex gap-2">
        {STATUS_TABS.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatusFilter(s)}
            className={`font-mono text-[10px] uppercase tracking-[0.2em] border px-4 py-2 transition-all ${
              statusFilter === s
                ? "border-foreground bg-foreground text-background"
                : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            {s || "ALL"}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="section-padding py-0">
        {loading ? (
          <div className="py-12 font-mono text-sm text-muted-foreground animate-pulse">LOADING_PAYMENTS...</div>
        ) : (
          <>
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-border bg-foreground/[0.02]">
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Date</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">User</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Plan</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Amount</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Status</div>
              <div className="col-span-3 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Provider ID</div>
            </div>

            {payments.map((p) => (
              <div key={p.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-foreground/[0.02] transition-colors">
                <div className="col-span-2 font-mono text-sm px-2">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</div>
                <div className="col-span-3 font-mono text-sm truncate px-2">{p.userEmail || "—"}</div>
                <div className="col-span-1 font-mono text-[10px] uppercase text-muted-foreground px-2">{p.plan || "—"}</div>
                <div className="col-span-2 font-mono text-sm font-medium px-2">R$ {p.amount.toFixed(2)}</div>
                <div className="col-span-1 px-2">
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                    p.status === "paid" ? "border-green-500/30 text-green-400" :
                    p.status === "pending" ? "border-yellow-500/30 text-yellow-400" :
                    p.status === "refunded" ? "border-blue-500/30 text-blue-400" :
                    "border-red-500/30 text-red-400"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="col-span-3 font-mono text-sm text-muted-foreground truncate px-2">{p.providerId || "—"}</div>
              </div>
            ))}

            {payments.length === 0 && (
              <div className="py-12 text-center font-mono text-sm text-muted-foreground">No payments found</div>
            )}

            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between py-6">
                <span className="font-mono text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadPayments(pagination.page - 1, statusFilter)}
                    disabled={pagination.page <= 1}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadPayments(pagination.page + 1, statusFilter)}
                    disabled={pagination.page >= pagination.totalPages}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
