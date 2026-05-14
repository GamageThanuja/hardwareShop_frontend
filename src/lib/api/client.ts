import { deleteClientCookie, getClientCookie, setClientCookie } from "@/lib/cookie.client";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "";

// ─── Server-side fetch (for Server Components / Route Handlers) ───────────────

export async function serverFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `HTTP ${res.status}`);
  }

  return res.json() as Promise<T>;
}

// ─── Client-side fetch (for Client Components) ────────────────────────────────

let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  if (isRefreshing && refreshPromise) return refreshPromise;

  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const refreshToken = getClientCookie("refresh_token");
      if (!refreshToken) return false;

      const res = await fetch(`${API_BASE}/api/v1/Auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!res.ok) return false;

      const json = await res.json();
      if (json?.data?.accessToken) {
        setClientCookie("access_token", json.data.accessToken, 1);
        setClientCookie("refresh_token", json.data.refreshToken, 7);
        return true;
      }
      return false;
    } catch {
      return false;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getClientCookie("access_token");

  const doFetch = (t: string | undefined) =>
    fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(t ? { Authorization: `Bearer ${t}` } : {}),
        ...options.headers,
      },
    });

  let res = await doFetch(token);

  if (res.status === 401) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      const newToken = getClientCookie("access_token");
      res = await doFetch(newToken);
    } else {
      deleteClientCookie("access_token");
      deleteClientCookie("refresh_token");
      window.location.href = "/auth/v1/login";
      throw new Error("Session expired");
    }
  }

  if (!res.ok) {
    const json = await res.json().catch(() => null);
    const message = json?.message ?? json?.title ?? `HTTP ${res.status}`;
    throw new Error(message);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
