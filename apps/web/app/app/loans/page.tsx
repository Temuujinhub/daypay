"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LoanSummary } from "@daypay/contracts";
import { aed, userApi, UserApiError } from "@/lib/consumer";
import { Card, EmptyNote, ErrorNote, fmtDate, PageTitle, Pill, ProgressBar, Spinner, statusTone } from "../ui";

export default function LoansPage() {
  const [loans, setLoans] = useState<LoanSummary[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .loans()
      .then(setLoans)
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load loans"));
  }, []);

  return (
    <div>
      <PageTitle>My Loans</PageTitle>
      {error && <ErrorNote>{error}</ErrorNote>}
      {!loans ? (
        <Spinner />
      ) : loans.length === 0 ? (
        <EmptyNote>No loans yet. Apply from the Services tab.</EmptyNote>
      ) : (
        <div className="space-y-4">
          {loans.map((loan) => {
            const total = loan.paymentsMade + loan.paymentsRemaining || loan.termMonths;
            const progress = total > 0 ? loan.paymentsMade / total : 0;
            return (
              <Link key={loan.id} href={`/app/loans/${loan.id}`}>
                <Card className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-extrabold text-slate-900">{loan.productName}</span>
                    <Pill label={loan.status} tone={statusTone(loan.status)} />
                  </div>
                  <p className="-mt-2 text-xs text-slate-400">{loan.loanNumber}</p>

                  <div className="flex justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Outstanding</p>
                      <p className="text-lg font-bold text-slate-900">{aed(loan.outstandingBalance)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Monthly</p>
                      <p className="text-lg font-bold text-slate-900">{aed(loan.monthlyPayment)}</p>
                    </div>
                  </div>

                  <ProgressBar value={progress} />
                  <div className="flex justify-between text-xs text-slate-400">
                    <span>
                      Payment {loan.paymentsMade} of {loan.termMonths}
                    </span>
                    <span>{loan.apr}% APR</span>
                  </div>

                  {loan.nextPaymentDate && (
                    <p className="text-xs text-slate-400">📅 Next due {fmtDate(loan.nextPaymentDate)}</p>
                  )}
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
