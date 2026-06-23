"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { KycStatusResponse } from "@daypay/contracts";
import { aed, userApi, UserApiError } from "@/lib/consumer";
import { Card, ErrorNote, PageTitle, Pill, Spinner, statusTone } from "../ui";

export default function KycPage() {
  const [status, setStatus] = useState<KycStatusResponse | null>(null);
  const [emiratesId, setEmiratesId] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    userApi
      .kycStatus()
      .then(setStatus)
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load status"));
  }, []);

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await userApi.kycSubmit({
        emiratesIdNumber: emiratesId || undefined,
        fullName: fullName || undefined,
      });
      setStatus(res);
    } catch (e) {
      setError(e instanceof UserApiError ? e.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (!status && !error) return <Spinner />;

  const verified = status?.status === "verified";

  return (
    <div className="space-y-4">
      <Link href="/app/account" className="text-sm text-slate-400">
        ← Account
      </Link>
      <PageTitle>Identity verification</PageTitle>

      {error && <ErrorNote>{error}</ErrorNote>}

      {status && (
        <Card className="flex items-center justify-between">
          <div>
            <p className="text-sm text-slate-500">Current status</p>
            {status.creditLimit > 0 && (
              <p className="mt-1 text-sm text-slate-700">
                Credit limit <span className="font-bold">{aed(status.creditLimit)}</span>
                {status.creditScore ? ` · score ${status.creditScore}` : ""}
              </p>
            )}
          </div>
          <Pill label={status.status} tone={statusTone(status.status)} />
        </Card>
      )}

      {verified ? (
        <Card className="text-center">
          <div className="text-5xl">✅</div>
          <p className="mt-2 font-semibold text-emerald-700">You're verified</p>
          <p className="mt-1 text-sm text-slate-500">You can apply for loans up to your credit limit.</p>
          <Link
            href="/app/services"
            className="mt-4 inline-block rounded-full bg-brand px-6 py-3 text-sm font-bold text-white"
          >
            Browse products
          </Link>
        </Card>
      ) : (
        <Card className="space-y-4">
          <p className="text-sm text-slate-500">
            Submit your Emirates ID to complete KYC. In the sandbox this is verified instantly.
          </p>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Full name</span>
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="As on your Emirates ID"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm font-medium text-slate-600">Emirates ID number</span>
            <input
              value={emiratesId}
              onChange={(e) => setEmiratesId(e.target.value)}
              placeholder="784-XXXX-XXXXXXX-X"
              className="w-full rounded-xl border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand"
            />
          </label>
          <button
            onClick={submit}
            disabled={submitting}
            className="w-full rounded-full bg-brand py-3.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
          >
            {submitting ? "Verifying…" : "Submit for verification"}
          </button>
        </Card>
      )}
    </div>
  );
}
