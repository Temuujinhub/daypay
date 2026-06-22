import { z } from "zod";

/** Loan calculator (spec §4.4.3). */
export const LoanCalculatorRequest = z.object({
  amount: z.number().positive().min(1000),
  termMonths: z.number().int().positive(),
  apr: z.number().positive().max(100),
});
export type LoanCalculatorRequest = z.infer<typeof LoanCalculatorRequest>;

export const LoanCalculatorResult = z.object({
  amount: z.number(),
  termMonths: z.number().int(),
  apr: z.number(),
  monthlyPayment: z.number(),
  totalInterest: z.number(),
  totalPayable: z.number(),
});
export type LoanCalculatorResult = z.infer<typeof LoanCalculatorResult>;

/**
 * Amortized monthly payment — shared by API, web and mobile so the number a
 * user sees in the calculator always matches the server.
 *   M = P · r(1+r)^n / ((1+r)^n − 1)
 */
export function calculateLoan(input: LoanCalculatorRequest): LoanCalculatorResult {
  const { amount, termMonths, apr } = input;
  const r = apr / 100 / 12;
  const monthlyPayment =
    r === 0
      ? amount / termMonths
      : (amount * (r * Math.pow(1 + r, termMonths))) / (Math.pow(1 + r, termMonths) - 1);
  const totalPayable = monthlyPayment * termMonths;
  const round = (n: number) => Math.round(n * 100) / 100;
  return {
    amount,
    termMonths,
    apr,
    monthlyPayment: round(monthlyPayment),
    totalInterest: round(totalPayable - amount),
    totalPayable: round(totalPayable),
  };
}
