// API client for the DayPay admin/lender portal.
// Talks to the NestJS backend; unwraps the { success, data, error } envelope.
// Override the backend with NEXT_PUBLIC_API_URL at build time.

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "https://daypay-production.up.railway.app";

export type Role = "user" | "lender_admin" | "super_admin" | "mlro";

const TOKEN_KEY = "daypay.token";
const REFRESH_KEY = "daypay.refresh";
const ROLE_KEY = "daypay.role";

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}
export function getRole(): Role | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ROLE_KEY) as Role | null;
}
export function saveSession(accessToken: string, refreshToken: string, role: Role): void {
  window.localStorage.setItem(TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_KEY, refreshToken);
  window.localStorage.setItem(ROLE_KEY, role);
}
export function clearSession(): void {
  window.localStorage.removeItem(TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_KEY);
  window.localStorage.removeItem(ROLE_KEY);
}

export class ApiError extends Error {
  constructor(message: string, readonly status: number, readonly code?: string) {
    super(message);
  }
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = getToken();
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  let json: { success: boolean; data?: T; error?: { message: string; code?: string } };
  try {
    json = await res.json();
  } catch {
    throw new ApiError(`Request failed (${res.status})`, res.status);
  }
  if (!json.success) {
    throw new ApiError(json.error?.message ?? `Request failed (${res.status})`, res.status, json.error?.code);
  }
  return json.data as T;
}

// ─── Response shapes (mirror apps/api admin + lender services) ───────────────

export interface Session {
  userId: string;
  role: Role;
  lenderId: string | null;
}

export interface Overview {
  totalUsers: number;
  kycVerified: number;
  activeLoans: number;
  totalLoans: number;
  totalDisbursed: number;
  totalOutstanding: number;
  applicationsByStatus: Record<string, number>;
}

export interface UserRow {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  email: string | null;
  kycStatus: string;
  creditScore: number | null;
  creditLimit: number;
  availableCredit: number;
  isActive: boolean;
  role: Role;
  createdAt: string;
}

export interface UserDetail extends UserRow {
  kyc: Record<string, unknown> | null;
  loans: {
    id: string;
    loanNumber: string;
    productName: string;
    lenderName: string;
    principalAmount: number;
    outstandingBalance: number;
    status: string;
  }[];
  applications: {
    id: string;
    applicationNumber: string;
    productName: string;
    status: string;
    requestedAmount: number;
    createdAt: string;
  }[];
}

export interface ApplicationRow {
  id: string;
  applicationNumber: string;
  userName: string;
  productName: string;
  lenderName: string;
  requestedAmount: number;
  requestedTerm: number;
  status: string;
  createdAt: string;
}

export interface LoanRow {
  id: string;
  loanNumber: string;
  userName: string;
  productName: string;
  lenderName: string;
  principalAmount: number;
  outstandingBalance: number;
  apr: number;
  paymentsMade: number;
  termMonths: number;
  status: string;
}

export interface KycQueueRow {
  id: string;
  phoneNumber: string;
  fullName: string | null;
  kycStatus: string;
  emiratesId: string | null;
  biometricMatchScore: number | null;
}

export interface SandboxReport {
  newUsersRegistered: number;
  kycApprovalRate: number;
  loanApplicationsCount: number;
  loansApprovedCount: number;
  averageLoanAmount: number;
  totalPortfolio: number;
  nplCount: number;
  maxSandboxUsers: number;
}

export interface LenderQueueRow {
  id: string;
  applicationNumber: string;
  userName: string;
  productName: string;
  requestedAmount: number;
  requestedTerm: number;
  creditScore: number | null;
  status: string;
  createdAt: string;
}

export interface LenderPortfolio {
  totalLoans: number;
  activeLoans: number;
  totalApplications: number;
  totalDisbursed: number;
  totalOutstanding: number;
  loans: {
    id: string;
    loanNumber: string;
    userName: string;
    productName: string;
    principalAmount: number;
    outstandingBalance: number;
    status: string;
  }[];
}

// ─── Endpoints ───────────────────────────────────────────────────────────────

export const api = {
  // auth
  register: (phoneNumber: string) =>
    req<{ sent: true; devCode?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, preferredLanguage: "en" }),
    }),
  verifyOtp: (phoneNumber: string, code: string) =>
    req<{ accessToken: string; refreshToken: string }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    }),
  session: () => req<Session>("/auth/session"),

  // admin
  overview: () => req<Overview>("/admin/overview"),
  users: (q?: string) => req<UserRow[]>(`/admin/users${q ? `?q=${encodeURIComponent(q)}` : ""}`),
  user: (id: string) => req<UserDetail>(`/admin/users/${id}`),
  suspendUser: (id: string, suspend: boolean) =>
    req<{ id: string; isActive: boolean }>(`/admin/users/${id}/suspend`, {
      method: "PUT",
      body: JSON.stringify({ suspend }),
    }),
  applications: (status?: string) =>
    req<ApplicationRow[]>(`/admin/applications${status ? `?status=${status}` : ""}`),
  loans: (status?: string) => req<LoanRow[]>(`/admin/loans${status ? `?status=${status}` : ""}`),
  kycQueue: () => req<KycQueueRow[]>("/admin/kyc-queue"),
  reviewKyc: (id: string, approve: boolean, notes?: string) =>
    req<{ id: string; kycStatus: string }>(`/admin/kyc/${id}/review`, {
      method: "PUT",
      body: JSON.stringify({ approve, notes }),
    }),
  sandboxReport: () => req<SandboxReport>("/admin/reports/sandbox"),

  // lender portal
  lenderQueue: () => req<LenderQueueRow[]>("/lender/queue"),
  lenderPortfolio: () => req<LenderPortfolio>("/lender/portfolio"),
  lenderDecide: (id: string, approve: boolean, reason?: string) =>
    req<{ id: string; status: string }>(`/lender/applications/${id}/decision`, {
      method: "POST",
      body: JSON.stringify({ approve, reason }),
    }),
};
