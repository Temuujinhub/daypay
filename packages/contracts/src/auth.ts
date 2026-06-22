import { z } from "zod";
import { PreferredLanguage } from "./common";

/** UAE phone number, E.164: +971 followed by 9 digits. */
export const UaePhoneNumber = z
  .string()
  .regex(/^\+971\d{9}$/, "Must be a valid UAE phone number, e.g. +9715XXXXXXXX");

export const RegisterRequest = z.object({
  phoneNumber: UaePhoneNumber,
  preferredLanguage: PreferredLanguage.default("en"),
});
export type RegisterRequest = z.infer<typeof RegisterRequest>;

export const VerifyOtpRequest = z.object({
  phoneNumber: UaePhoneNumber,
  code: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
});
export type VerifyOtpRequest = z.infer<typeof VerifyOtpRequest>;

export const ResendOtpRequest = z.object({
  phoneNumber: UaePhoneNumber,
});
export type ResendOtpRequest = z.infer<typeof ResendOtpRequest>;

export const RefreshRequest = z.object({
  refreshToken: z.string().min(1),
});
export type RefreshRequest = z.infer<typeof RefreshRequest>;

export const AuthTokens = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number().int(),
});
export type AuthTokens = z.infer<typeof AuthTokens>;
