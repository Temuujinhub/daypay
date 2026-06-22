import { z } from "zod";

/**
 * Shared enums — kept in sync with the SQL schema in the system specification
 * (§8 Өгөгдлийн Сангийн Схем).
 */
export const PreferredLanguage = z.enum(["en", "hi", "tl", "bn", "ur"]);
export type PreferredLanguage = z.infer<typeof PreferredLanguage>;

export const KycStatus = z.enum(["pending", "in_review", "verified", "rejected"]);
export type KycStatus = z.infer<typeof KycStatus>;

export const ApplicationStatus = z.enum([
  "draft",
  "submitted",
  "eligibility_check",
  "documents_pending",
  "under_review",
  "approved",
  "rejected",
  "cancelled",
  "disbursed",
]);
export type ApplicationStatus = z.infer<typeof ApplicationStatus>;

export const LoanStatus = z.enum(["active", "settled", "defaulted", "written_off"]);
export type LoanStatus = z.infer<typeof LoanStatus>;

export const UserRole = z.enum(["user", "lender_admin", "super_admin", "mlro"]);
export type UserRole = z.infer<typeof UserRole>;

/**
 * Standard API envelopes — §9.1 of the specification.
 */
export const ApiError = z.object({
  code: z.string(),
  message: z.string(),
  details: z.record(z.unknown()).optional(),
});
export type ApiError = z.infer<typeof ApiError>;

export const ApiMeta = z.object({
  page: z.number().int().optional(),
  limit: z.number().int().optional(),
  total: z.number().int().optional(),
});
export type ApiMeta = z.infer<typeof ApiMeta>;

export interface ApiSuccess<T> {
  success: true;
  data: T;
  meta?: z.infer<typeof ApiMeta>;
  requestId: string;
  timestamp: string;
}

export interface ApiFailure {
  success: false;
  error: ApiError;
  requestId: string;
  timestamp: string;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Stable error codes referenced by both server and clients. */
export const ErrorCode = {
  INSUFFICIENT_CREDIT_SCORE: "INSUFFICIENT_CREDIT_SCORE",
  KYC_NOT_VERIFIED: "KYC_NOT_VERIFIED",
  OTP_INVALID: "OTP_INVALID",
  OTP_RATE_LIMITED: "OTP_RATE_LIMITED",
  SANDBOX_USER_LIMIT: "SANDBOX_USER_LIMIT",
  UNAUTHORIZED: "UNAUTHORIZED",
  VALIDATION_FAILED: "VALIDATION_FAILED",
  NOT_FOUND: "NOT_FOUND",
} as const;
export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];
