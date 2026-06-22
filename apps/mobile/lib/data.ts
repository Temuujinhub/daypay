// Data layer for the DayPay app.
// Reads from the backend when EXPO_PUBLIC_API_URL is set and reachable,
// otherwise falls back to local mock data so the app is fully usable in
// Expo Go without a running server.

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

export interface ActiveLoan {
  id: string;
  productName: string;
  nextPaymentAmount: number;
  paymentNo: number;
  paymentsTotal: number;
  dueDateLabel: string;
  dueInDays: number;
  outstanding: number;
  apr: number;
}

export interface UserProfile {
  fullName: string;
  firstName: string;
  email: string;
  kycVerified: boolean;
  availableCredit: number;
  totalOutstanding: number;
  lastTransactionLabel: string;
  lastTransactionAmount: number;
}

export const user: UserProfile = {
  fullName: "Ganbat Otgon",
  firstName: "Ganbat",
  email: "ganbat1@gmail.com",
  kycVerified: true,
  availableCredit: 31000,
  totalOutstanding: 4527.2,
  lastTransactionLabel: "Payment",
  lastTransactionAmount: -472,
};

export const activeLoans: ActiveLoan[] = [
  {
    id: "LN-20260412-0001",
    productName: "Express Personal Loan",
    nextPaymentAmount: 472.8,
    paymentNo: 2,
    paymentsTotal: 12,
    dueDateLabel: "Fri, 12 Jun 2026",
    dueInDays: 60,
    outstanding: 4527.2,
    apr: 21,
  },
];

export const upcomingPayments = [
  { id: "1", productName: "Express Personal Loan", amount: 472.8, inDays: 60 },
  { id: "2", productName: "Express Personal Loan", amount: 472.8, inDays: 90 },
];

const MOCK_PRODUCTS: Product[] = [
  {
    id: "standard_rental",
    code: "standard_rental",
    name: "Standard Rental Financing",
    tagline: "Spread your annual rent into monthly installments",
    minApr: 18,
    maxAmount: 150000,
    minAmount: 10000,
    terms: [6, 9, 18, 24],
    features: ["No collateral required", "No guarantor needed", "Early settlement allowed"],
  },
  {
    id: "premium_rental",
    code: "premium_rental",
    name: "Premium Rental Financing",
    tagline: "Premium financing for premium properties",
    minApr: 16,
    maxAmount: 200000,
    minAmount: 10000,
    terms: [12, 18, 24, 36],
    features: ["No collateral required", "No guarantor needed", "Early settlement allowed"],
  },
  {
    id: "express_personal",
    code: "express_personal",
    name: "Express Personal Loan",
    tagline: "Fast disbursement for urgent cash needs",
    minApr: 21,
    maxAmount: 50000,
    minAmount: 1000,
    terms: [6, 9, 12, 18, 24],
    features: ["Instant decision", "No guarantor needed", "Early settlement allowed"],
  },
  {
    id: "flexible_personal",
    code: "flexible_personal",
    name: "Flexible Personal Loan",
    tagline: "Flexible terms tailored to you",
    minApr: 19.5,
    maxAmount: 100000,
    minAmount: 1000,
    terms: [6, 9, 12, 18, 24, 36],
    features: ["Choose your own term", "No guarantor needed", "Early settlement allowed"],
  },
];

const API = process.env.EXPO_PUBLIC_API_URL;

export async function getProducts(): Promise<Product[]> {
  if (!API) return MOCK_PRODUCTS;
  try {
    const res = await fetch(`${API}/api/v1/loan-products`);
    if (!res.ok) return MOCK_PRODUCTS;
    const json = await res.json();
    const rows = json?.data ?? [];
    if (!Array.isArray(rows) || rows.length === 0) return MOCK_PRODUCTS;
    return rows.map((p: Record<string, unknown>) => ({
      id: String(p.productCode ?? p.id),
      code: String(p.productCode ?? p.id),
      name: String(p.nameEn ?? ""),
      tagline: String(p.descriptionEn ?? ""),
      minApr: Number(p.baseApr ?? 0),
      maxAmount: Number(p.maxAmount ?? 0),
      minAmount: Number(p.minAmount ?? 1000),
      terms: (p.availableTerms as number[]) ?? [6, 12, 24],
      features: ["No collateral required", "No guarantor needed", "Early settlement allowed"],
    }));
  } catch {
    return MOCK_PRODUCTS;
  }
}

export function getProduct(id: string): Product | undefined {
  return MOCK_PRODUCTS.find((p) => p.id === id);
}
