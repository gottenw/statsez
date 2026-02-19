"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getAdminUser, patchAdminSubscription, revokeAdminKey } from "../../../../../lib/api";

interface Subscription {
  id: string;
  planName: string;
  sport: string;
  monthlyQuota: number;
  biWeeklyQuota: number;
  currentUsage: number;
  isActive: boolean;
  startsAt: string;
  expiresAt: string | null;
  cycleStartDate: string;
  cycleEndDate: string | null;
  apiKey: { id: string; key: string; isActive: boolean; lastUsedAt: string | null; createdAt: string } | null;
}

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  providerId: string | null;
  paidAt: string | null;
  createdAt: string;
}

interface UserDetail {
  id: string;
  email: string;
  name: string | null;
  role: string;
  googleId: string | null;
  createdAt: string;
  updatedAt: string;
  subscriptions: Subscription[];
  payments: Payment[];
}

const PLAN_OPTIONS = ["free", "dev", "enterprise", "gold"];
const PLAN_QUOTAS: Record<string, { monthly: number; biweekly: number }> = {
  free: { monthly: 500, biweekly: 500 },
  dev: { monthly: 40000, biweekly: 20000 },
  enterprise: { monthly: 250000, biweekly: 125000 },
  gold: { monthly: 600000, biweekly: 300000 },
};

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.userId as string;

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit state for active subscription
  const [editPlan, setEditPlan] = useState("");
  const [editMonthly, setEditMonthly] = useState(0);
  const [editBiweekly, setEditBiweekly] = useState(0);
  const [editUsage, setEditUsage] = useState(0);

  useEffect(() => {
    loadUser();
  }, [userId]);

  async function loadUser() {
    try {
      const res = await getAdminUser(userId);
      setUser(res.data);
      const activeSub = res.data.subscriptions?.find((s: Subscription) => s.isActive);
      if (activeSub) {
        setEditPlan(activeSub.planName);
        setEditMonthly(activeSub.monthlyQuota);
        setEditBiweekly(activeSub.biWeeklyQuota);
        setEditUsage(activeSub.currentUsage);
      }
    } catch {
      console.error("Failed to load user");
    } finally {
      setLoading(false);
    }
  }

  function handlePlanChange(plan: string) {
    setEditPlan(plan);
    const quotas = PLAN_QUOTAS[plan];
    if (quotas) {
      setEditMonthly(quotas.monthly);
      setEditBiweekly(quotas.biweekly);
    }
  }

  async function handleSave() {
    setSaving(true);
    try {
      await patchAdminSubscription(userId, {
        planName: editPlan,
        monthlyQuota: editMonthly,
        biWeeklyQuota: editBiweekly,
        currentUsage: editUsage,
      });
      await loadUser();
      alert("Subscription updated successfully");
    } catch {
      alert("Failed to update subscription");
    } finally {
      setSaving(false);
    }
  }

  async function handleRevokeKey(keyId: string) {
    if (!confirm("Revoke this API key?")) return;
    try {
      await revokeAdminKey(keyId);
      await loadUser();
    } catch {
      alert("Failed to revoke key");
    }
  }

  if (loading) {
    return (
      <div className="section-padding py-24">
        <div className="font-mono text-sm text-muted-foreground animate-pulse">LOADING_USER_DATA...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="section-padding py-24">
        <div className="font-mono text-sm text-red-400">USER_NOT_FOUND</div>
      </div>
    );
  }

  const activeSub = user.subscriptions?.find((s) => s.isActive);

  return (
    <div>
      {/* Header */}
      <div className="section-padding py-24 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-4">
            <button
              onClick={() => router.push("/dashboard/admin/users")}
              className="data-label tracking-[0.3em] hover:text-foreground transition-colors"
            >
              &larr; USERS
            </button>
          </div>
          <div className="col-span-12 md:col-span-8">
            <h2 className="headline-text">
              User
              <br />
              <span className="text-muted">Detail</span>
            </h2>
          </div>
        </div>
      </div>

      {/* User Info */}
      <div className="section-padding py-12 border-b border-border">
        <div className="grid grid-cols-12 gap-8">
          <div className="col-span-12 md:col-span-6 space-y-4">
            <InfoRow label="EMAIL" value={user.email} />
            <InfoRow label="NAME" value={user.name || "—"} />
            <InfoRow label="ROLE" value={user.role} />
            <InfoRow label="AUTH" value={user.googleId ? "Google OAuth" : "Email/Password"} />
          </div>
          <div className="col-span-12 md:col-span-6 space-y-4">
            <InfoRow label="USER ID" value={user.id} mono />
            <InfoRow label="CREATED" value={new Date(user.createdAt).toLocaleDateString("pt-BR")} />
            <InfoRow label="UPDATED" value={new Date(user.updatedAt).toLocaleDateString("pt-BR")} />
            <InfoRow label="SUBSCRIPTIONS" value={String(user.subscriptions?.length || 0)} />
          </div>
        </div>
      </div>

      {/* Active Subscription Edit */}
      {activeSub && (
        <div className="section-padding py-12 border-b border-border">
          <span className="data-label tracking-[0.3em] mb-6 block">ACTIVE SUBSCRIPTION</span>

          <div className="grid grid-cols-12 gap-6 mt-4">
            <div className="col-span-12 md:col-span-3">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">Plan</label>
              <select
                value={editPlan}
                onChange={(e) => handlePlanChange(e.target.value)}
                className="w-full bg-transparent border border-border font-mono text-sm p-3 focus:outline-none focus:border-foreground"
              >
                {PLAN_OPTIONS.map((p) => (
                  <option key={p} value={p} className="bg-background">{p.toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">Monthly Quota</label>
              <input
                type="number"
                value={editMonthly}
                onChange={(e) => setEditMonthly(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border border-border font-mono text-sm p-3 focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">Bi-Weekly Quota</label>
              <input
                type="number"
                value={editBiweekly}
                onChange={(e) => setEditBiweekly(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border border-border font-mono text-sm p-3 focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="col-span-6 md:col-span-2">
              <label className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground block mb-2">Current Usage</label>
              <input
                type="number"
                value={editUsage}
                onChange={(e) => setEditUsage(parseInt(e.target.value) || 0)}
                className="w-full bg-transparent border border-border font-mono text-sm p-3 focus:outline-none focus:border-foreground"
              />
            </div>

            <div className="col-span-6 md:col-span-3 flex items-end">
              <button
                onClick={handleSave}
                disabled={saving}
                className="w-full font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-6 py-3.5 hover:bg-foreground hover:text-background transition-all disabled:opacity-50"
              >
                {saving ? "SAVING..." : "SAVE CHANGES"}
              </button>
            </div>
          </div>

          {/* Subscription metadata */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            <div className="border border-border p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Sport</span>
              <p className="font-mono text-sm mt-1">{activeSub.sport}</p>
            </div>
            <div className="border border-border p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cycle Start</span>
              <p className="font-mono text-sm mt-1">{new Date(activeSub.cycleStartDate).toLocaleDateString("pt-BR")}</p>
            </div>
            <div className="border border-border p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Cycle End</span>
              <p className="font-mono text-sm mt-1">{activeSub.cycleEndDate ? new Date(activeSub.cycleEndDate).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
            <div className="border border-border p-4">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Expires</span>
              <p className="font-mono text-sm mt-1">{activeSub.expiresAt ? new Date(activeSub.expiresAt).toLocaleDateString("pt-BR") : "—"}</p>
            </div>
          </div>
        </div>
      )}

      {/* API Keys */}
      <div className="section-padding py-12 border-b border-border">
        <span className="data-label tracking-[0.3em] mb-6 block">API KEYS</span>
        {user.subscriptions?.flatMap((sub) =>
          sub.apiKey ? [{ ...sub.apiKey, plan: sub.planName, subActive: sub.isActive }] : []
        ).map((key) => (
          <div key={key.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
            <div className="flex items-center gap-4">
              <span className="font-mono text-sm">{key.key.substring(0, 20)}...</span>
              <span className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${key.isActive ? "border-green-500/30 text-green-400" : "border-red-500/30 text-red-400"}`}>
                {key.isActive ? "ACTIVE" : "REVOKED"}
              </span>
              <span className="font-mono text-[10px] uppercase text-muted-foreground">{key.plan}</span>
            </div>
            {key.isActive && (
              <button
                onClick={() => handleRevokeKey(key.id)}
                className="font-mono text-[10px] uppercase tracking-[0.15em] border border-red-500/30 text-red-400 px-3 py-1.5 hover:bg-red-500 hover:text-background transition-all"
              >
                Revoke
              </button>
            )}
          </div>
        )) || (
          <p className="font-mono text-sm text-muted-foreground">No API keys</p>
        )}
      </div>

      {/* Payment History */}
      <div className="section-padding py-12">
        <span className="data-label tracking-[0.3em] mb-6 block">PAYMENT HISTORY</span>
        {user.payments?.length > 0 ? (
          <div className="space-y-0">
            <div className="grid grid-cols-6 gap-4 py-3 border-b border-border bg-foreground/[0.02]">
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Date</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Amount</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Status</div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Provider</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Provider ID</div>
            </div>
            {user.payments.map((p) => (
              <div key={p.id} className="grid grid-cols-6 gap-4 py-3 border-b border-border">
                <div className="font-mono text-sm">{new Date(p.createdAt).toLocaleDateString("pt-BR")}</div>
                <div className="font-mono text-sm">R$ {Number(p.amount).toFixed(2)}</div>
                <div>
                  <span className={`font-mono text-[10px] uppercase px-2 py-0.5 border ${
                    p.status === "paid" ? "border-green-500/30 text-green-400" :
                    p.status === "pending" ? "border-yellow-500/30 text-yellow-400" :
                    "border-red-500/30 text-red-400"
                  }`}>
                    {p.status}
                  </span>
                </div>
                <div className="font-mono text-sm text-muted-foreground">{p.provider}</div>
                <div className="col-span-2 font-mono text-sm text-muted-foreground truncate">{p.providerId || "—"}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="font-mono text-sm text-muted-foreground">No payments</p>
        )}
      </div>
    </div>
  );
}

function InfoRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <p className={`${mono ? "font-mono text-xs" : "font-mono text-sm"} mt-1 ${mono ? "text-muted-foreground" : ""}`}>{value}</p>
    </div>
  );
}
