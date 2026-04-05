const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
    credentials: "include",
  });

  if (res.status === 401) {
    localStorage.removeItem("statsez_user");
    window.location.href = "/auth/register";
    throw new Error("Unauthorized");
  }

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
  return data;
}

export async function getUserInfo() {
  return apiRequest("/user/me");
}

export async function getApiKeys() {
  return apiRequest("/user/keys");
}

export async function rotateApiKey(subscriptionId: string) {
  return apiRequest("/user/keys/rotate", {
    method: "POST",
    body: JSON.stringify({ subscriptionId }),
  });
}

// ============================================
// ADMIN API FUNCTIONS
// ============================================

export async function getAdminStats() {
  return apiRequest("/admin/stats/overview");
}

export async function getAdminRequestVolume(period = "7d") {
  return apiRequest(`/admin/stats/requests?period=${period}`);
}

export async function getAdminTopEndpoints(limit = 10) {
  return apiRequest(`/admin/stats/top-endpoints?limit=${limit}`);
}

export async function getAdminGrowth(period = "30d") {
  return apiRequest(`/admin/stats/growth?period=${period}`);
}

export async function getAdminCostAnalysis() {
  return apiRequest("/admin/stats/cost-analysis");
}

export async function getAdminUsers(page = 1, search = "") {
  return apiRequest(`/admin/users?page=${page}&search=${encodeURIComponent(search)}`);
}

export async function getAdminUser(userId: string) {
  return apiRequest(`/admin/users/${userId}`);
}

export async function patchAdminSubscription(userId: string, data: Record<string, unknown>) {
  return apiRequest(`/admin/users/${userId}/subscription`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deactivateAdminUser(userId: string) {
  return apiRequest(`/admin/users/${userId}/deactivate`, { method: "POST" });
}

export async function getAdminKeys(page = 1) {
  return apiRequest(`/admin/keys?page=${page}`);
}

export async function revokeAdminKey(keyId: string) {
  return apiRequest(`/admin/keys/${keyId}/revoke`, { method: "POST" });
}

export async function getAdminCacheStats() {
  return apiRequest("/admin/system/cache");
}

export async function deleteExpiredCache() {
  return apiRequest("/admin/system/cache/expired", { method: "DELETE" });
}

export async function getAdminLogs(page = 1, sport = "") {
  return apiRequest(`/admin/system/logs?page=${page}${sport ? `&sport=${sport}` : ""}`);
}
