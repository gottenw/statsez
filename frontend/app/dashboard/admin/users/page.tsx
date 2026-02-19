"use client";

import { useEffect, useState, useCallback } from "react";
import { getAdminUsers, deactivateAdminUser } from "../../../../lib/api";
import { Search } from "lucide-react";

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  activePlan: string | null;
  usage: string | null;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadUsers = useCallback(async (page: number, searchQuery: string) => {
    setLoading(true);
    try {
      const res = await getAdminUsers(page, searchQuery);
      setUsers(res.data || []);
      setPagination(res.pagination);
    } catch {
      console.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUsers(1, "");
  }, [loadUsers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadUsers(1, search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search, loadUsers]);

  async function handleDeactivate(userId: string) {
    if (!confirm("Deactivate this user's subscription?")) return;
    try {
      await deactivateAdminUser(userId);
      loadUsers(pagination.page, search);
    } catch {
      alert("Failed to deactivate");
    }
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
              User
              <br />
              <span className="text-muted">Management</span>
            </h2>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="section-padding py-8 border-b border-border">
        <div className="relative max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by email or name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-transparent border border-border font-mono text-sm focus:outline-none focus:border-foreground transition-colors"
          />
        </div>
      </div>

      {/* Table */}
      <div className="section-padding py-0">
        {loading ? (
          <div className="py-12 font-mono text-sm text-muted-foreground animate-pulse">LOADING_USERS...</div>
        ) : (
          <>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 py-4 border-b border-border bg-foreground/[0.02]">
              <div className="col-span-4 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Email</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Name</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Role</div>
              <div className="col-span-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Plan</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Usage</div>
              <div className="col-span-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground px-2">Actions</div>
            </div>

            {/* Table Rows */}
            {users.map((user) => (
              <div key={user.id} className="grid grid-cols-12 gap-4 py-4 border-b border-border hover:bg-foreground/[0.02] transition-colors">
                <div className="col-span-4 font-mono text-sm truncate px-2">{user.email}</div>
                <div className="col-span-2 font-mono text-sm text-muted-foreground truncate px-2">{user.name || "—"}</div>
                <div className="col-span-1 px-2">
                  <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 ${user.role === "ADMIN" ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "text-muted-foreground"}`}>
                    {user.role}
                  </span>
                </div>
                <div className="col-span-1 px-2">
                  <span className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 border ${
                    user.activePlan === "gold"
                      ? "border-yellow-500/30 text-yellow-400"
                      : user.activePlan === "enterprise"
                        ? "border-purple-500/30 text-purple-400"
                        : user.activePlan === "dev"
                          ? "border-green-500/30 text-green-400"
                          : "border-border text-muted-foreground"
                  }`}>
                    {user.activePlan || "none"}
                  </span>
                </div>
                <div className="col-span-2 font-mono text-sm text-muted-foreground px-2">{user.usage || "—"}</div>
                <div className="col-span-2 flex gap-2 px-2">
                  <a
                    href={`/dashboard/admin/users/${user.id}`}
                    className="font-mono text-[10px] uppercase tracking-[0.15em] border border-border px-3 py-1.5 hover:bg-foreground hover:text-background transition-all"
                  >
                    View
                  </a>
                  {user.activePlan && (
                    <button
                      onClick={() => handleDeactivate(user.id)}
                      className="font-mono text-[10px] uppercase tracking-[0.15em] border border-red-500/30 text-red-400 px-3 py-1.5 hover:bg-red-500 hover:text-background transition-all"
                    >
                      Deactivate
                    </button>
                  )}
                </div>
              </div>
            ))}

            {users.length === 0 && (
              <div className="py-12 text-center font-mono text-sm text-muted-foreground">No users found</div>
            )}

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-between py-6">
                <span className="font-mono text-xs text-muted-foreground">
                  Page {pagination.page} of {pagination.totalPages} ({pagination.total} total)
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => loadUsers(pagination.page - 1, search)}
                    disabled={pagination.page <= 1}
                    className="font-mono text-[10px] uppercase tracking-[0.2em] border border-border px-4 py-2 hover:bg-foreground hover:text-background transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  >
                    Prev
                  </button>
                  <button
                    onClick={() => loadUsers(pagination.page + 1, search)}
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
