import * as SecureStore from "expo-secure-store";
import type {
  ApplicationResponse,
  CreateApplicationRequest,
  LoanDetail,
  LoanSummary,
  ProfileResponse,
  RepaymentInstallment,
  TransactionDto,
} from "@daypay/contracts";
import { API_URL } from "./config";

const ACCESS_KEY = "daypay.access";
const REFRESH_KEY = "daypay.refresh";

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(ACCESS_KEY);
}
export async function setTokens(access: string, refresh: string): Promise<void> {
  await SecureStore.setItemAsync(ACCESS_KEY, access);
  await SecureStore.setItemAsync(REFRESH_KEY, refresh);
}
export async function clearTokens(): Promise<void> {
  await SecureStore.deleteItemAsync(ACCESS_KEY);
  await SecureStore.deleteItemAsync(REFRESH_KEY);
}

async function req<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getToken();
  const res = await fetch(`${API_URL}/api/v1${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers ?? {}),
    },
  });
  const json = (await res.json()) as { success: boolean; data?: T; error?: { message: string } };
  if (!json.success) throw new Error(json.error?.message ?? `Request failed (${res.status})`);
  return json.data as T;
}

export const api = {
  register: (phoneNumber: string) =>
    req<{ sent: true; devCode?: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ phoneNumber }),
    }),
  verifyOtp: (phoneNumber: string, code: string) =>
    req<{ accessToken: string; refreshToken: string }>("/auth/otp/verify", {
      method: "POST",
      body: JSON.stringify({ phoneNumber, code }),
    }),
  profile: () => req<ProfileResponse>("/account/profile"),
  loans: () => req<LoanSummary[]>("/loans"),
  loan: (id: string) => req<LoanDetail>(`/loans/${id}`),
  schedule: (id: string) => req<RepaymentInstallment[]>(`/loans/${id}/schedule`),
  products: () => req<Record<string, unknown>[]>("/loan-products"),
  apply: (body: CreateApplicationRequest) =>
    req<ApplicationResponse>("/applications", { method: "POST", body: JSON.stringify(body) }),
  transactions: () => req<TransactionDto[]>("/payments"),
  pay: (loanId: string) => req<LoanSummary>(`/loans/${loanId}/pay`, { method: "POST" }),
};
