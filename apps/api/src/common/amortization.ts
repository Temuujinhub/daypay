import { calculateLoan } from "@daypay/contracts";

export interface Installment {
  installmentNumber: number;
  dueDate: Date;
  principalComponent: number;
  interestComponent: number;
  totalAmount: number;
}

const round = (n: number): number => Math.round(n * 100) / 100;

export function addMonths(date: Date, months: number): Date {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

/** Build an amortized repayment schedule (spec §7.4 / §4.4.3). */
export function buildSchedule(
  principal: number,
  apr: number,
  termMonths: number,
  startDate: Date,
): { monthlyPayment: number; installments: Installment[] } {
  const r = apr / 100 / 12;
  const monthlyPayment = calculateLoan({ amount: principal, termMonths, apr }).monthlyPayment;

  let balance = principal;
  const installments: Installment[] = [];
  for (let i = 1; i <= termMonths; i++) {
    const interest = round(balance * r);
    let principalComponent = round(monthlyPayment - interest);
    if (i === termMonths) principalComponent = round(balance); // clear remainder
    const totalAmount = round(principalComponent + interest);
    balance = round(balance - principalComponent);
    installments.push({
      installmentNumber: i,
      dueDate: addMonths(startDate, i),
      principalComponent,
      interestComponent: interest,
      totalAmount,
    });
  }
  return { monthlyPayment, installments };
}
