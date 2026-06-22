import { z } from "zod";
import { KycStatus, PreferredLanguage } from "./common";
import { ApplicationStatus, LoanStatus } from "./common";

// ─── Account / profile ────────────────────────────────────────────────────
export interface ProfileResponse {
  id: string;
  fullName: string | null;
  firstName: string;
  email: string | null;
  phoneNumber: string;
  kycStatus: KycStatus;
  kycVerified: boolean;
  creditScore: number | null;
  creditLimit: number;
  availableCredit: number;
  totalOutstanding: number;
  preferredLanguage: PreferredLanguage;
  lastTransaction: { label: string; amount: number } | null;
}

// ─── KYC ──────────────────────────────────────────────────────────────────
export const KycSubmitRequest = z.object({
  emiratesIdNumber: z
    .string()
    .regex(/^784-?\d{4}-?\d{7}-?\d$/, "Invalid Emirates ID")
    .optional(),
  fullName: z.string().min(2).optional(),
});
export type KycSubmitRequest = z.infer<typeof KycSubmitRequest>;

export interface KycStatusResponse {
  status: KycStatus;
  creditScore: number | null;
  creditLimit: number;
  biometricMatchScore: number | null;
}

// ─── Loans ──────────────────────────────────────────────────────────────────
export interface LoanSummary {
  id: string;
  loanNumber: string;
  productName: string;
  lenderName: string;
  principalAmount: number;
  apr: number;
  termMonths: number;
  monthlyPayment: number;
  outstandingBalance: number;
  nextPaymentDate: string | null;
  nextPaymentAmount: number | null;
  paymentsMade: number;
  paymentsRemaining: number;
  status: LoanStatus;
}

export interface RepaymentInstallment {
  installmentNumber: number;
  dueDate: string;
  principalComponent: number;
  interestComponent: number;
  totalAmount: number;
  paidAmount: number;
  status: string;
}

export interface LoanDetail extends LoanSummary {
  schedule: RepaymentInstallment[];
}

// ─── Applications ─────────────────────────────────────────────────────────
export const CreateApplicationRequest = z.object({
  productCode: z.string().min(1),
  amount: z.number().positive().min(1000),
  termMonths: z.number().int().positive(),
  lenderId: z.string().uuid().optional(),
  purpose: z.string().max(100).optional(),
});
export type CreateApplicationRequest = z.infer<typeof CreateApplicationRequest>;

export interface EligibilityResult {
  passed: boolean;
  creditScore: number | null;
  reasons: string[];
}

export interface ApplicationResponse {
  id: string;
  applicationNumber: string;
  status: ApplicationStatus;
  productName: string;
  lenderName: string;
  requestedAmount: number;
  requestedTerm: number;
  approvedAmount: number | null;
  approvedApr: number | null;
  eligibility: EligibilityResult | null;
  loanId: string | null;
  createdAt: string;
}

// ─── Transactions ─────────────────────────────────────────────────────────
export interface TransactionDto {
  id: string;
  referenceNumber: string;
  type: string;
  amount: number;
  currency: string;
  direction: "credit" | "debit";
  status: string;
  description: string | null;
  createdAt: string;
}
