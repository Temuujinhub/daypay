"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { calculateLoan } from "@daypay/contracts";
import type { ApplicationResponse } from "@daypay/contracts";
import { aed, mapProduct, Product, userApi, UserApiError } from "@/lib/consumer";
import { Card, ErrorNote, Spinner } from "../../ui";

export default function ProductDetailPage() {
  const { code } = useParams<{ code: string }>();
  const router = useRouter();

  const [product, setProduct] = useState<Product | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [amount, setAmount] = useState(50000);
  const [term, setTerm] = useState(12);

  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<ApplicationResponse | null>(null);
  const [applyError, setApplyError] = useState<string | null>(null);

  useEffect(() => {
    userApi
      .products()
      .then((rows) => {
        const p = rows.map(mapProduct).find((x) => x.code === code);
        if (!p) {
          setLoadError("Product not found");
          return;
        }
        setProduct(p);
        setAmount(Math.round((p.minAmount + p.maxAmount) / 2 / 1000) * 1000);
        setTerm(p.terms[1] ?? p.terms[0]);
      })
      .catch((e) => setLoadError(e instanceof UserApiError ? e.message : "Failed to load"));
  }, [code]);

  const calc = useMemo(
    () => (product ? calculateLoan({ amount, termMonths: term, apr: product.minApr }) : null),
    [product, amount, term],
  );

  async function apply() {
    if (!product) return;
    setSubmitting(true);
    setApplyError(null);
    try {
      const res = await userApi.apply({ productCode: product.code, amount, termMonths: term });
      setResult(res);
    } catch (e) {
      setApplyError(e instanceof UserApiError ? e.message : "Application failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loadError) return <ErrorNote>{loadError}</ErrorNote>;
  if (!product || !calc) return <Spinner />;

  if (result) {
    const approved = result.status !== "rejected";
    return (
      <div className="space-y-4 pt-6">
        <div className={`rounded-2xl p-6 text-center ${approved ? "bg-emerald-50" : "bg-red-50"}`}>
          <div className="text-5xl">{approved ? "🎉" : "🙏"}</div>
          <h1 className={`mt-3 text-2xl font-extrabold ${approved ? "text-emerald-700" : "text-red-700"}`}>
            {approved ? "Approved!" : "Not approved"}
          </h1>
          {approved ? (
            <p className="mt-1 text-sm text-emerald-700">
              Your {result.productName} for {aed(result.approvedAmount ?? amount)} was approved and disbursed.
            </p>
          ) : (
            <ul className="mt-2 space-y-1 text-sm text-red-700">
              {(result.eligibility?.reasons ?? ["You are not eligible."]).map((r) => (
                <li key={r}>• {r}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="flex gap-3">
          {approved ? (
            <Link href="/app/loans" className="flex-1 rounded-full bg-brand py-3.5 text-center text-sm font-bold text-white">
              View my loans
            </Link>
          ) : (
            <Link href="/app/kyc" className="flex-1 rounded-full bg-brand py-3.5 text-center text-sm font-bold text-white">
              Check KYC
            </Link>
          )}
          <button
            onClick={() => setResult(null)}
            className="flex-1 rounded-full border border-slate-300 py-3.5 text-center text-sm font-semibold text-slate-600"
          >
            Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Link href="/app/services" className="text-sm text-slate-400">
        ← Products
      </Link>
      <h1 className="text-2xl font-extrabold text-slate-900">{product.name}</h1>

      <Card className="flex items-center gap-2 text-sm text-slate-700">
        <span className="text-brand">🛡️</span>
        All lenders are regulated by the UAE Central Bank
      </Card>

      <Card>
        <div className="mb-4 flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand/10">🧮</span>
          <h2 className="text-lg font-extrabold text-slate-900">Loan Calculator</h2>
        </div>

        <p className="text-sm text-slate-500">Loan Amount</p>
        <p className="text-2xl font-extrabold text-brand">{aed(amount)}</p>
        <input
          type="range"
          min={product.minAmount}
          max={product.maxAmount}
          step={1000}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="mt-2 w-full accent-brand"
        />
        <div className="flex justify-between text-xs text-slate-400">
          <span>{aed(product.minAmount)}</span>
          <span>{aed(product.maxAmount)}</span>
        </div>

        <p className="mt-5 text-sm text-slate-500">Select Term</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.terms.map((t) => (
            <button
              key={t}
              onClick={() => setTerm(t)}
              className={`min-w-[68px] flex-1 rounded-xl border py-3 text-center transition ${
                term === t ? "border-brand bg-brand/5" : "border-slate-200"
              }`}
            >
              <span className={`block text-base font-extrabold ${term === t ? "text-brand-dark" : "text-slate-800"}`}>
                {t}
              </span>
              <span className="text-[11px] text-slate-400">months</span>
            </button>
          ))}
        </div>

        <div className="mt-5 rounded-xl bg-brand/5 p-4 text-center">
          <p className="text-sm text-brand-dark">Estimated Monthly Payment</p>
          <p className="my-1 text-3xl font-extrabold text-brand-dark">{aed(calc.monthlyPayment)}</p>
          <p className="text-xs text-brand-dark/80">
            Total: {aed(calc.totalPayable)} · Interest: {aed(calc.totalInterest)}
          </p>
        </div>
      </Card>

      {applyError && <ErrorNote>{applyError}</ErrorNote>}

      <button
        onClick={apply}
        disabled={submitting}
        className="w-full rounded-full bg-slate-900 py-4 text-base font-bold text-white transition hover:bg-slate-800 disabled:opacity-60"
      >
        {submitting ? "Submitting…" : "Apply Now"}
      </button>
    </div>
  );
}
