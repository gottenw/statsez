const API_URL = process.env.NEXT_PUBLIC_API_URL || "https://api.statsez.com";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("statsez_token");
}

export function getUser(): { id: string; email: string; name?: string } | null {
  if (typeof window === "undefined") return null;
  const user = localStorage.getItem("statsez_user");
  return user ? JSON.parse(user) : null;
}

export async function apiRequest(
  endpoint: string,
  options: RequestInit = {}
): Promise<any> {
  const token = getToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (res.status === 401) {
    // Token expirado ou inválido
    localStorage.removeItem("statsez_token");
    localStorage.removeItem("statsez_user");
    window.location.href = "/auth/register";
    throw new Error("Unauthorized");
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.error || `HTTP ${res.status}`);
  }

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

export async function getPayments() {
  return apiRequest("/user/payments");
}
