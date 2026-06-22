"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, saveSession } from "../../lib/api";
import { Button } from "../../components/ui";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [phone, setPhone] = useState("+971500000000");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [devCode, setDevCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(
    params.get("denied")
      ? "That account isn't a staff account. Borrowers use the mobile app."
      : params.get("expired")
        ? "Your session expired. Please sign in again."
        : null,
  );
  const [busy, setBusy] = useState(false);

  async function sendOtp() {
    setBusy(true);
    setError(null);
    try {
      const res = await api.register(phone.trim());
      setDevCode(res.devCode ?? null);
      setStep("otp");
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function verify() {
    setBusy(true);
    setError(null);
    try {
      const tokens = await api.verifyOtp(phone.trim(), code.trim());
      saveSession(tokens.accessToken, tokens.refreshToken, "user");
      const session = await api.session();
      if (session.role === "user") {
        setError("That account isn't a staff account. Borrowers use the mobile app.");
        setBusy(false);
        return;
      }
      saveSession(tokens.accessToken, tokens.refreshToken, session.role);
      router.replace(session.role === "lender_admin" ? "/lender" : "/dashboard");
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-brand/10 via-slate-50 to-slate-100 p-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-lg">
        <div className="mb-6 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-brand">DayPay</h1>
          <p className="mt-1 text-sm text-slate-500">Admin &amp; Lender Operations Portal</p>
        </div>

        {error ? (
          <div className="mb-4 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>
        ) : null}

        {step === "phone" ? (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendOtp();
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">Phone number</span>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+9715xxxxxxxx"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </label>
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Sending…" : "Send OTP"}
            </Button>
            <p className="text-center text-xs text-slate-400">
              Sandbox accounts: admin +971500000000 · lender +971500000002
            </p>
          </form>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              verify();
            }}
            className="space-y-4"
          >
            <label className="block">
              <span className="mb-1 block text-sm font-medium text-slate-700">
                Enter the 6-digit code sent to {phone}
              </span>
              <input
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="000000"
                maxLength={6}
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-center text-lg tracking-[0.4em] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
              />
            </label>
            {devCode ? (
              <p className="rounded-lg bg-brand/5 px-3 py-2 text-center text-sm text-brand">
                Sandbox OTP: <strong>{devCode}</strong>
              </p>
            ) : null}
            <Button type="submit" disabled={busy} className="w-full">
              {busy ? "Verifying…" : "Sign in"}
            </Button>
            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setCode("");
                setDevCode(null);
              }}
              className="w-full text-center text-xs text-slate-400 hover:text-slate-600"
            >
              ← Use a different number
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
