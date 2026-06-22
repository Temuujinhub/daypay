import type {
  ApplicationResponse,
  CreateApplicationRequest,
  LoanSummary,
  ProfileResponse,
  RepaymentInstallment,
  TransactionDto,
} from "@daypay/contracts";
import { api } from "./api";
import { DEMO_MODE } from "./config";

export interface Product {
  id: string;
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

export const MOCK_PRODUCTS: Product[] = [
  { id: "standard_rental", code: "standard_rental", name: "Standard Rental Financing", tagline: "Spread your annual rent into monthly installments", minApr: 18, maxAmount: 150000, minAmount: 10000, terms: [6, 9, 18, 24], features: FEATURES },
  { id: "premium_rental", code: "premium_rental", name: "Premium Rental Financing", tagline: "Premium financing for premium properties", minApr: 16, maxAmount: 200000, minAmount: 10000, terms: [12, 18, 24, 36], features: FEATURES },
  { id: "express_personal", code: "express_personal", name: "Express Personal Loan", tagline: "Fast disbursement for urgent cash needs", minApr: 21, maxAmount: 50000, minAmount: 1000, terms: [6, 9, 12, 18, 24], features: ["Instant decision", "No guarantor needed", "Early settlement allowed"] },
  { id: "flexible_personal", code: "flexible_personal", name: "Flexible Personal Loan", tagline: "Flexible terms tailored to you", minApr: 19.5, maxAmount: 100000, minAmount: 1000, terms: [6, 9, 12, 18, 24, 36], features: ["Choose your own term", "No guarantor needed", "Early settlement allowed"] },
];

const MOCK_PROFILE: ProfileResponse = {
  id: "demo",
  fullName: "Ganbat Otgon",
  firstName: "Ganbat",
  email: "ganbat1@gmail.com",
  phoneNumber: "+971500000001",
  kycStatus: "verified",
  kycVerified: true,
  creditScore: 720,
  creditLimit: 35000,
  availableCredit: 31000,
  totalOutstanding: 4527.2,
  preferredLanguage: "en",
  lastTransaction: { label: "Payment", amount: -472 },
};

const MOCK_LOANS: LoanSummary[] = [
  {
    id: "demo-loan",
    loanNumber: "LN-DEMO-0001",
    productName: "Express Personal Loan",
    lenderName: "Al Nahda Finance (Sandbox)",
    principalAmount: 5000,
    apr: 21,
    termMonths: 12,
    monthlyPayment: 472.8,
    outstandingBalance: 4527.2,
    nextPaymentDate: "2026-06-12",
    nextPaymentAmount: 472.8,
    paymentsMade: 1,
    paymentsRemaining: 11,
    status: "active",
  },
];

function mapProduct(p: Record<string, unknown>): Product {
  return {
    id: String(p.productCode ?? p.id),
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

export async function fetchProfile(): Promise<ProfileResponse> {
  if (DEMO_MODE) return MOCK_PROFILE;
  try {
    return await api.profile();
  } catch {
    return MOCK_PROFILE;
  }
}

export async function fetchLoans(): Promise<LoanSummary[]> {
  if (DEMO_MODE) return MOCK_LOANS;
  try {
    return await api.loans();
  } catch {
    return MOCK_LOANS;
  }
}

export async function fetchProducts(): Promise<Product[]> {
  if (DEMO_MODE) return MOCK_PRODUCTS;
  try {
    const rows = await api.products();
    return rows.length ? rows.map(mapProduct) : MOCK_PRODUCTS;
  } catch {
    return MOCK_PRODUCTS;
  }
}

export async function fetchTransactions(): Promise<TransactionDto[]> {
  if (DEMO_MODE) return [];
  try {
    return await api.transactions();
  } catch {
    return [];
  }
}

export async function fetchSchedule(loanId: string): Promise<RepaymentInstallment[]> {
  if (DEMO_MODE) return [];
  try {
    return await api.schedule(loanId);
  } catch {
    return [];
  }
}

export async function applyForLoan(body: CreateApplicationRequest): Promise<ApplicationResponse | null> {
  if (DEMO_MODE) return null;
  return api.apply(body);
}

export function getProduct(code: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === code);
}
