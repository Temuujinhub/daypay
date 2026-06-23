"use client";

import { useState } from "react";
import { calculateLoan } from "@daypay/contracts";
import { aed } from "../../../lib/format";
import { Card, PageHeader, StatCard } from "../../../components/ui";

export default function CalculatorPage() {
  const [amount, setAmount] = useState(16000);
  const [term, setTerm] = useState(12);
  const [apr, setApr] = useState(18);

  const result = calculateLoan({ amount, termMonths: term, apr });

  return (
    <>
      <PageHeader
        title="Loan Calculator"
        subtitle="Uses the same calculateLoan() shared by the API and the mobile app."
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="space-y-5 p-6">
          <Field label={`Amount: ${aed(amount)}`}>
            <input
              type="range"
              min={1000}
              max={150000}
              step={1000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </Field>

          <Field label="Term (months)">
            <div className="flex flex-wrap gap-2">
              {[6, 9, 12, 18, 24, 36].map((t) => (
                <button
                  key={t}
                  onClick={() => setTerm(t)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                    term === t ? "bg-brand text-white" : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </Field>

          <Field label={`APR: ${apr}%`}>
            <input
              type="range"
              min={10}
              max={35}
              step={0.5}
              value={apr}
              onChange={(e) => setApr(Number(e.target.value))}
              className="w-full accent-brand"
            />
          </Field>
        </Card>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 lg:grid-cols-1">
          <StatCard label="Monthly payment" value={aed(result.monthlyPayment)} />
          <StatCard label="Total interest" value={aed(result.totalInterest)} />
          <StatCard label="Total payable" value={aed(result.totalPayable)} />
        </div>
      </div>
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
