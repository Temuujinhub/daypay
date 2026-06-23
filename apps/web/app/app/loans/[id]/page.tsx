"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { LoanDetail } from "@daypay/contracts";
import { aed, userApi, UserApiError } from "@/lib/consumer";
import { Card, ErrorNote, fmtDate, Pill, ProgressBar, Spinner, statusTone } from "../../ui";

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<LoanDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paying, setPaying] = useState(false);
  const [flash, setFlash] = useState<string | null>(null);

  const load = useCallback(() => {
    userApi
      .loan(id)
      .then(setLoan)
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load loan"));
  }, [id]);

  useEffect(() => load(), [load]);

  async function pay() {
    setPaying(true);
    setError(null);
    setFlash(null);
    try {
      await userApi.pay(id);
      setFlash("Payment successful.");
      load();
    } catch (e) {
      setError(e instanceof UserApiError ? e.message : "Payment failed");
    } finally {
      setPaying(false);
    }
  }

  if (error && !loan) return <ErrorNote>{error}</ErrorNote>;
  if (!loan) return <Spinner />;

  const total = loan.paymentsMade + loan.paymentsRemaining || loan.termMonths;
  const canPay = loan.status === "active" && loan.paymentsRemaining > 0;

  return (
    <div className="space-y-4">
      <Link href="/app/loans" className="text-sm text-slate-400">
        ← My Loans
      </Link>

      <div className="rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark p-5 text-white">
        <div className="flex items-center justify-between">
          <span className="font-bold">{loan.productName}</span>
          <Pill label={loan.status} tone={statusTone(loan.status)} />
        </div>
        <p className="mt-3 text-sm opacity-90">Outstanding balance</p>
        <p className="text-3xl font-extrabold">{aed(loan.outstandingBalance)}</p>
        <p className="mt-1 text-xs opacity-80">{loan.loanNumber} · {loan.lenderName}</p>
      </div>

      <Card className="space-y-3">
        <Detail label="Principal" value={aed(loan.principalAmount)} />
        <Detail label="Monthly payment" value={aed(loan.monthlyPayment)} />
        <Detail label="APR" value={`${loan.apr}%`} />
        <Detail label="Term" value={`${loan.termMonths} months`} />
        <Detail label="Next payment" value={loan.nextPaymentDate ? `${aed(loan.nextPaymentAmount ?? loan.monthlyPayment)} · ${fmtDate(loan.nextPaymentDate)}` : "—"} />
        <ProgressBar value={total > 0 ? loan.paymentsMade / total : 0} />
        <p className="text-xs text-slate-400">
          {loan.paymentsMade} of {loan.termMonths} paid · {loan.paymentsRemaining} remaining
        </p>
      </Card>

      {flash && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {flash}
        </div>
      )}
      {error && <ErrorNote>{error}</ErrorNote>}

      {canPay && (
        <button
          onClick={pay}
          disabled={paying}
          className="w-full rounded-full bg-brand py-4 text-base font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
        >
          {paying ? "Processing…" : `Pay ${aed(loan.nextPaymentAmount ?? loan.monthlyPayment)}`}
        </button>
      )}

      <div>
        <h2 className="mb-2 mt-2 text-lg font-extrabold text-slate-900">Repayment schedule</h2>
        <Card className="divide-y divide-slate-100 p-0">
          {loan.schedule.map((s) => (
            <div key={s.installmentNumber} className="flex items-center justify-between px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-slate-800">#{s.installmentNumber}</p>
                <p className="text-xs text-slate-400">{fmtDate(s.dueDate)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-slate-900">{aed(s.totalAmount)}</p>
                <Pill label={s.status} tone={statusTone(s.status)} />
              </div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-800">{value}</span>
    </div>
  );
}
