import type { Trade, TradeCreate, TradeStats, Strategy, Tag, AuthToken } from "./types";

const BASE = import.meta.env.VITE_API_URL || "/api";
let token: string | null = localStorage.getItem("tradeos_token");

export function setToken(t: string | null) {
  token = t;
  if (t) localStorage.setItem("tradeos_token", t);
  else localStorage.removeItem("tradeos_token");
}

export function getToken() {
  return token;
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

/* Auth */
export const login = (username: string, password: string) =>
  request<AuthToken>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

export const register = (username: string, email: string, password: string) =>
  request("/auth/register", {
    method: "POST",
    body: JSON.stringify({ username, email, password }),
  });

/* Trades */
export const getTrades = (params?: Record<string, string>) => {
  const qs = params ? "?" + new URLSearchParams(params).toString() : "";
  return request<Trade[]>(`/trades${qs}`);
};

export const getTrade = (id: number) => request<Trade>(`/trades/${id}`);

export const createTrade = (data: TradeCreate) =>
  request<Trade>("/trades", { method: "POST", body: JSON.stringify(data) });

export const updateTrade = (id: number, data: Partial<TradeCreate>) =>
  request<Trade>(`/trades/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteTrade = (id: number) =>
  request<void>(`/trades/${id}`, { method: "DELETE" });

export const getTradeStats = () => request<TradeStats>("/trades/stats");

/* Strategies */
export const getStrategies = () => request<Strategy[]>("/strategies");

export const createStrategy = (name: string, description?: string) =>
  request<Strategy>("/strategies", {
    method: "POST",
    body: JSON.stringify({ name, description }),
  });

export const deleteStrategy = (id: number) =>
  request<void>(`/strategies/${id}`, { method: "DELETE" });

/* Tags */
export const getTags = () => request<Tag[]>("/tags");

export const createTag = (name: string) =>
  request<Tag>("/tags", { method: "POST", body: JSON.stringify({ name }) });

export const deleteTag = (id: number) =>
  request<void>(`/tags/${id}`, { method: "DELETE" });

/* AI Analysis */
export const analyzeTrade = (tradeId: number) =>
  request<{ trade_id: number; analysis: string }>(`/analysis/trades/${tradeId}`, {
    method: "POST",
  });

export const analyzePortfolio = () =>
  request<{ analysis: string }>("/analysis/portfolio", {
    method: "POST",
  });
