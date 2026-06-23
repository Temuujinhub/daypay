import type {
  ApplicationResponse,
  CreateApplicationRequest,
  KycStatusResponse,
  KycSubmitRequest,
  LoanDetail,
  LoanSummary,
  ProfileResponse,
  RepaymentInstallment,
  TransactionDto,
} from "@daypay/contracts";

/**
 * Consumer (borrower) API client for the web app — mirrors apps/mobile/lib/api.
 * Talks to the same backend the mobile app uses; tokens are kept separate from
 * the admin console (different localStorage keys).
 */

const BASE =
  (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000").replace(/\/$/, "") + "/api/v1";

const ACCESS = "daypay_user_access";
const REFRESH = "daypay_user_refresh";

export function getUserToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ACCESS);
}
export function setUserTokens(access: string, refresh: string): void {
  window.localStorage.setItem(ACCESS, access);
  window.localStorage.setItem(REFRESH, refresh);
}
export function clearUserTokens(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ACCESS);
  window.localStorage.removeItem(REFRESH);
}
export function isSignedIn(): boolean {
  return !!getUserToken();
}

export class UserApiError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "UserApiError";
  }
}

async function refreshTokens(): Promise<boolean> {
  const rt = typeof window !== "undefined" ? window.localStorage.getItem(REFRESH) : null;
  if (!rt) return false;
  try {
    const res = await fetch(`${BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rt }),
    });
    const json = await res.json().catch(() => null);
    if (res.ok && json?.success) {
      setUserTokens(json.data.accessToken, json.data.refreshToken);
      return true;
    }
  } catch {
    /* fall through */
  }
  clearUserTokens();
  return false;
}

async function req<T>(path: string, init?: RequestInit, retry = true): Promise<T> {
  const token = getUserToken();
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = await res.json().catch(() => null);

  if (!res.ok || !json?.success) {
    if (res.status === 401 && token && retry) {
      if (await refreshTokens()) return req<T>(path, init, false);
      if (typeof window !== "undefined") window.location.href = "/app/login";
    }
    throw new UserApiError(
      json?.error?.code ?? "ERROR",
      json?.error?.message ?? `Request failed (${res.status})`,
      res.status,
    );
  }
  return json.data as T;
}

export const userApi = {
  register: (phoneNumber: string) =>
    req<{ sent: true; devCode?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),
  verifyOtp: (phoneNumber: string, code: string) =>
    req<{ accessToken: string; refreshToken: string; expiresIn: number }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    }),
  profile: () => req<ProfileResponse>("/account/profile"),
  setLanguage: (language: string) =>
    req<{ ok: true }>("/account/language", { method: "PUT", body: JSON.stringify({ language }) }),
  kycStatus: () => req<KycStatusResponse>("/kyc/status"),
  kycSubmit: (body: KycSubmitRequest) =>
    req<KycStatusResponse>("/kyc/submit", { method: "POST", body: JSON.stringify(body) }),
  products: () => req<Record<string, unknown>[]>("/loan-products"),
  loans: () => req<LoanSummary[]>("/loans"),
  loan: (id: string) => req<LoanDetail>(`/loans/${id}`),
  schedule: (id: string) => req<RepaymentInstallment[]>(`/loans/${id}/schedule`),
  pay: (loanId: string) => req<LoanSummary>(`/loans/${loanId}/pay`, { method: "POST" }),
  apply: (body: CreateApplicationRequest) =>
    req<ApplicationResponse>("/applications", { method: "POST", body: JSON.stringify(body) }),
  applications: () => req<ApplicationResponse[]>("/applications"),
  transactions: () => req<TransactionDto[]>("/payments"),
};

// ─── Product view-model (mirrors apps/mobile/lib/data) ───────────────────────
export interface Product {
  code: string;
  name: string;
  tagline: string;
  minApr: number;
  maxAmount: number;
  minAmount: number;
  terms: number[];
  features: string[];
}

const FEATURES = ["No collateral required", "No guarantor needed", "Early settlement allowed"];

export function mapProduct(p: Record<string, unknown>): Product {
  return {
    code: String(p.productCode ?? p.id),
    name: String(p.nameEn ?? ""),
    tagline: String(p.descriptionEn ?? ""),
    minApr: Number(p.baseApr ?? 0),
    maxAmount: Number(p.maxAmount ?? 0),
    minAmount: Number(p.minAmount ?? 1000),
    terms: (p.availableTerms as number[]) ?? [6, 12, 24],
    features: FEATURES,
  };
}

export function aed(n: number): string {
  return "AED " + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
