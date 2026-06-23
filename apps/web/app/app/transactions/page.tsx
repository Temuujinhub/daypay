"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { TransactionDto } from "@daypay/contracts";
import { aed, userApi, UserApiError } from "@/lib/consumer";
import { Card, EmptyNote, ErrorNote, fmtDate, PageTitle, Pill, Spinner, statusTone } from "../ui";

export default function TransactionsPage() {
  const [txns, setTxns] = useState<TransactionDto[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .transactions()
      .then(setTxns)
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load"));
  }, []);

  return (
    <div>
      <Link href="/app" className="text-sm text-slate-400">
        ← Home
      </Link>
      <PageTitle>Transactions</PageTitle>
      {error && <ErrorNote>{error}</ErrorNote>}
      {!txns ? (
        <Spinner />
      ) : txns.length === 0 ? (
        <EmptyNote>No transactions yet.</EmptyNote>
      ) : (
        <Card className="divide-y divide-slate-100 p-0">
          {txns.map((t) => {
            const credit = t.direction === "credit";
            return (
              <div key={t.id} className="flex items-center justify-between px-4 py-3.5">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold capitalize text-slate-800">
                    {t.type.replace(/_/g, " ")}
                  </p>
                  <p className="text-xs text-slate-400">
                    {fmtDate(t.createdAt)} · {t.referenceNumber}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${credit ? "text-emerald-600" : "text-slate-900"}`}>
                    {credit ? "+" : "−"}
                    {aed(t.amount)}
                  </p>
                  <Pill label={t.status} tone={statusTone(t.status)} />
                </div>
              </div>
            );
          })}
        </Card>
      )}
    </div>
  );
}
