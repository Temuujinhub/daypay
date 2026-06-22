"use client";

import { useState } from "react";
import { calculateLoan } from "@daypay/contracts";

export default function DashboardPage() {
  const [amount, setAmount] = useState(16000);
  const [term, setTerm] = useState(12);
  const [apr, setApr] = useState(18);

  const result = calculateLoan({ amount, termMonths: term, apr });

  return (
    <main className="mx-auto max-w-xl p-8">
      <h1 className="text-2xl font-bold text-brand">Loan calculator</h1>
      <p className="mt-1 text-sm text-slate-500">
        Computed with the same <code>calculateLoan()</code> the mobile app and API use.
      </p>

      <div className="mt-6 space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <Field label={`Amount: AED ${amount.toLocaleString()}`}>
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
                className={`rounded-lg px-3 py-1 text-sm ${
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
      </div>

      <dl className="mt-6 grid grid-cols-3 gap-4">
        <Stat label="Monthly" value={result.monthlyPayment} />
        <Stat label="Total interest" value={result.totalInterest} />
        <Stat label="Total payable" value={result.totalPayable} />
      </dl>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center shadow-sm">
      <dt className="text-xs uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="mt-1 text-lg font-semibold text-slate-900">
        AED {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </dd>
    </div>
  );
}
