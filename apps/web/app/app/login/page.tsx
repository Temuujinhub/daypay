"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { setUserTokens, userApi, UserApiError } from "@/lib/consumer";

export default function ConsumerLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("+9715");
  const [code, setCode] = useState("");
  const [hint, setHint] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setError("");
    setLoading(true);
    try {
      const res = await userApi.register(phone);
      if (res.devCode) setHint(`Dev OTP: ${res.devCode}`);
      setStep("otp");
    } catch (e) {
      setError(e instanceof UserApiError ? e.message : "Failed to send code");
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError("");
    setLoading(true);
    try {
      const tokens = await userApi.verifyOtp(phone, code);
      setUserTokens(tokens.accessToken, tokens.refreshToken);
      router.replace("/app");
    } catch (e) {
      setError(e instanceof UserApiError ? e.message : "Invalid code");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-3 bg-white px-6">
      <div className="mb-2">
        <span className="text-3xl font-extrabold text-brand">DayPay</span>
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900">
        {step === "phone" ? "Sign in to DayPay" : "Enter the code"}
      </h1>
      <p className="text-sm text-slate-500">
        {step === "phone"
          ? "We'll send a one-time code to your UAE number."
          : `Sent to ${phone}`}
      </p>

      {step === "phone" ? (
        <input
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          inputMode="tel"
          placeholder="+9715XXXXXXXX"
          className="mt-2 rounded-xl border border-slate-300 px-4 py-3 text-lg outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          autoFocus
        />
      ) : (
        <input
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
          inputMode="numeric"
          placeholder="6-digit code"
          className="mt-2 rounded-xl border border-slate-300 px-4 py-3 text-center text-2xl tracking-[0.4em] outline-none focus:border-brand focus:ring-1 focus:ring-brand"
          autoFocus
        />
      )}

      {hint && <p className="text-sm font-medium text-brand-dark">{hint}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <button
        onClick={step === "phone" ? sendOtp : verify}
        disabled={loading}
        className="mt-2 rounded-full bg-brand py-4 text-base font-bold text-white transition hover:bg-brand-dark disabled:opacity-60"
      >
        {loading ? "Please wait…" : step === "phone" ? "Send code" : "Verify"}
      </button>

      {step === "otp" && (
        <button onClick={() => setStep("phone")} className="text-sm text-slate-400">
          Change number
        </button>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        Sandbox demo user: <code>+971500000001</code>
      </p>
    </main>
  );
}
