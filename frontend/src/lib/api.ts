const DEFAULT_API_URL = "https://alina-semimagical-dissentingly.ngrok-free.dev";
const API_URL = (import.meta.env.VITE_API_URL || DEFAULT_API_URL).replace(/\/+$/, "");
const AUTH_TOKEN_KEY = "nflxchange.token";
const AUTH_USER_ID_KEY = "nflxchange.userId";
const AUTH_USER_EMAIL_KEY = "nflxchange.userEmail";

const buildUrl = (path: string) => `${API_URL}${path.startsWith("/") ? path : `/${path}`}`;

const isBrowser = typeof window !== "undefined";

export const authSession = {
  getToken(): string | null {
    if (!isBrowser) return null;
    return localStorage.getItem(AUTH_TOKEN_KEY);
  },
  setSession({
    token,
    userId,
    email,
  }: {
    token: string;
    userId: number;
    email: string;
  }) {
    if (!isBrowser) return;
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    localStorage.setItem(AUTH_USER_ID_KEY, String(userId));
    localStorage.setItem(AUTH_USER_EMAIL_KEY, email);
  },
  clear() {
    if (!isBrowser) return;
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(AUTH_USER_ID_KEY);
    localStorage.removeItem(AUTH_USER_EMAIL_KEY);
  },
  getUser() {
    if (!isBrowser) return null;
    const token = localStorage.getItem(AUTH_TOKEN_KEY);
    const userId = localStorage.getItem(AUTH_USER_ID_KEY);
    const email = localStorage.getItem(AUTH_USER_EMAIL_KEY);
    if (!token || !userId || !email) return null;
    return { token, userId: Number(userId), email };
  },
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers: HeadersInit = {
    Accept: "application/json",
    "ngrok-skip-browser-warning": "true",
    ...(init?.headers ?? {}),
  };

  const token = authSession.getToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(buildUrl(path), {
    ...init,
    headers,
  });

  const raw = await response.text();
  const parseJson = () => {
    try {
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  };

  if (!response.ok) {
    const data = parseJson();
    const detail = data?.detail ?? raw ?? `Request to ${path} failed`;
    throw new Error(detail);
  }

  return (parseJson() as T) ?? ({} as T);
}

export interface TeamMarketInformation {
  team_name: string;
  price: number;
  value: number;
  volume: number;
  timestamp: string;
}

export function fetchTeams() {
  return request<TeamMarketInformation[]>("/market/all-teams");
}

export function fetchTeamHistory(teamName: string) {
  return request<TeamMarketInformation[]>(`/market/team/${encodeURIComponent(teamName)}`);
}

export type LiveGameResponse = Record<string, unknown>;

export function fetchLiveGames() {
  return request<LiveGameResponse[]>("/live/games");
}

export function fetchLiveGameById(id: string) {
  return request<LiveGameResponse>(`/live/games/${encodeURIComponent(id)}`);
}

export interface AuthResponse {
  success: boolean;
  access_token: string;
  token_type: string;
  user_id: number;
}

interface SignupPayload {
  email: string;
  password: string;
  confirm_password: string;
  initial_deposit: number;
}

interface LoginPayload {
  email: string;
  password: string;
}

export async function signupUser(payload: SignupPayload) {
  const result = await request<AuthResponse>("/auth/signup", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  authSession.setSession({
    token: result.access_token,
    userId: result.user_id,
    email: payload.email,
  });
  return result;
}

export async function loginUser(payload: LoginPayload) {
  const result = await request<AuthResponse>("/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  authSession.setSession({
    token: result.access_token,
    userId: result.user_id,
    email: payload.email,
  });
  return result;
}

export async function fetchFlashPicks() {
  throw new Error("Flash picks endpoint not implemented on the public API");
}

export async function fetchPortfolio() {
  throw new Error("Portfolio endpoint not implemented on the public API");
}

export async function fetchPortfolioStats() {
  throw new Error("Portfolio stats endpoint not implemented on the public API");
}

export async function fetchTransactions() {
  throw new Error("Transactions endpoint not implemented on the public API");
}

export async function executeTrade() {
  throw new Error("Trading endpoint not implemented on the public API");
}

