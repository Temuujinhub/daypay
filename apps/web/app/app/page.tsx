"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { LoanSummary, ProfileResponse } from "@daypay/contracts";
import { aed, userApi, UserApiError } from "@/lib/consumer";
import { Card, daysUntil, ErrorNote, fmtDate, Pill, Spinner } from "./ui";

export default function HomePage() {
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loans, setLoans] = useState<LoanSummary[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([userApi.profile(), userApi.loans()])
      .then(([p, l]) => {
        setProfile(p);
        setLoans(l);
      })
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error || !profile) return <ErrorNote>{error ?? "No profile"}</ErrorNote>;

  const loan = loans.find((l) => l.status === "active") ?? loans[0];
  const upcoming = loans.filter((l) => l.status === "active" && l.nextPaymentDate);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xl font-extrabold text-brand">DayPay</span>
      </div>

      <div>
        <p className="text-sm text-slate-500">Good morning,</p>
        <h1 className="text-2xl font-extrabold text-slate-900">{profile.firstName}</h1>
      </div>

      {!profile.kycVerified && (
        <Link
          href="/app/kyc"
          className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800"
        >
          <span className="font-semibold">Finish your KYC</span> to unlock loans →
        </Link>
      )}

      {loan ? (
        <div className="rounded-2xl bg-gradient-to-br from-brand-light to-brand-dark p-5 text-white shadow-sm">
          <div className="mb-3 flex items-center gap-2 text-sm font-semibold opacity-90">
            <span>💳</span>
            {loan.productName}
          </div>
          <p className="text-sm opacity-90">Next Payment</p>
          <p className="my-0.5 text-4xl font-extrabold">{aed(loan.nextPaymentAmount ?? loan.monthlyPayment)}</p>
          <p className="mb-3 text-sm opacity-90">
            Payment {loan.paymentsMade + 1} of {loan.termMonths}
          </p>
          <div className="flex items-center justify-between">
            <span className="text-sm opacity-90">Due: {fmtDate(loan.nextPaymentDate)}</span>
            {daysUntil(loan.nextPaymentDate) != null && (
              <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">
                In {daysUntil(loan.nextPaymentDate)} days
              </span>
            )}
          </div>
        </div>
      ) : (
        <Card>
          <p className="py-2 text-center text-sm text-slate-400">
            No active loans yet.{" "}
            <Link href="/app/services" className="font-semibold text-brand">
              Browse products
            </Link>
          </p>
        </Card>
      )}

      <Card className="divide-y divide-slate-100 p-0">
        <StatRow label="Total Outstanding" value={aed(profile.totalOutstanding)} />
        <StatRow label="Available Credit" value={aed(profile.availableCredit)} highlight />
        {profile.lastTransaction && (
          <StatRow
            label="Last Transaction"
            value={`${profile.lastTransaction.label} ${aed(Math.abs(profile.lastTransaction.amount))}`}
          />
        )}
      </Card>

      {upcoming.length > 0 && (
        <div>
          <h2 className="mb-2 mt-2 text-lg font-extrabold text-slate-900">Upcoming Payments</h2>
          <div className="space-y-2">
            {upcoming.map((l) => (
              <Link key={l.id} href={`/app/loans/${l.id}`}>
                <Card className="flex items-center gap-3 p-4">
                  <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand/10 text-lg">📅</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{l.productName}</p>
                    <p className="text-sm text-slate-500">{aed(l.nextPaymentAmount ?? l.monthlyPayment)}</p>
                  </div>
                  <Pill label={`In ${daysUntil(l.nextPaymentDate) ?? 0} days`} tone="brand" />
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      <Link
        href="/app/transactions"
        className="block py-2 text-center text-sm font-semibold text-brand"
      >
        View transaction history →
      </Link>
    </div>
  );
}

function StatRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-base font-bold ${highlight ? "text-brand" : "text-slate-900"}`}>{value}</span>
    </div>
  );
}
