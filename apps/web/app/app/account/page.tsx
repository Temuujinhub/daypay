"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { ProfileResponse } from "@daypay/contracts";
import { aed, clearUserTokens, userApi, UserApiError } from "@/lib/consumer";
import { Card, ErrorNote, PageTitle, Pill, Spinner, statusTone } from "../ui";

const LANGS: { code: string; label: string }[] = [
  { code: "en", label: "English" },
  { code: "hi", label: "हिन्दी" },
  { code: "tl", label: "Tagalog" },
  { code: "bn", label: "বাংলা" },
  { code: "ur", label: "اردو" },
];

export default function AccountPage() {
  const router = useRouter();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState("en");
  const [savedLang, setSavedLang] = useState(false);

  useEffect(() => {
    userApi
      .profile()
      .then((p) => {
        setProfile(p);
        setLang(p.preferredLanguage);
      })
      .catch((e) => setError(e instanceof UserApiError ? e.message : "Failed to load"));
  }, []);

  async function changeLang(code: string) {
    setLang(code);
    setSavedLang(false);
    try {
      await userApi.setLanguage(code);
      setSavedLang(true);
    } catch {
      /* ignore in sandbox */
    }
  }

  function logout() {
    clearUserTokens();
    router.replace("/app/login");
  }

  if (error && !profile) return <ErrorNote>{error}</ErrorNote>;
  if (!profile) return <Spinner />;

  return (
    <div className="space-y-4">
      <PageTitle>Account</PageTitle>

      <Card className="flex flex-col items-center gap-1 py-7 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-brand/10 text-2xl font-extrabold text-brand">
          {(profile.firstName?.[0] ?? "U").toUpperCase()}
        </div>
        <p className="mt-2 text-xl font-extrabold text-slate-900">{profile.fullName ?? "—"}</p>
        <p className="text-sm text-slate-500">{profile.email ?? profile.phoneNumber}</p>
        {profile.kycVerified ? (
          <span className="mt-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            ✓ KYC Verified
          </span>
        ) : (
          <Link href="/app/kyc" className="mt-1 inline-flex items-center gap-1 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">
            Complete KYC →
          </Link>
        )}
      </Card>

      <Card className="grid grid-cols-3 gap-2 text-center">
        <Metric label="Score" value={profile.creditScore?.toString() ?? "—"} />
        <Metric label="Limit" value={aed(profile.creditLimit)} />
        <Metric label="Available" value={aed(profile.availableCredit)} />
      </Card>

      <div>
        <p className="mb-2 ml-1 text-xs font-bold uppercase tracking-wide text-slate-400">Language</p>
        <Card className="p-3">
          <div className="flex flex-wrap gap-2">
            {LANGS.map((l) => (
              <button
                key={l.code}
                onClick={() => changeLang(l.code)}
                className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
                  lang === l.code ? "bg-brand text-white" : "bg-slate-100 text-slate-600"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
          {savedLang && <p className="mt-2 text-xs text-emerald-600">Saved.</p>}
        </Card>
      </div>

      <div>
        <p className="mb-2 ml-1 text-xs font-bold uppercase tracking-wide text-slate-400">Account</p>
        <Card className="divide-y divide-slate-100 p-0">
          <Row href="/app/kyc" icon="🪪" label="Identity & KYC" />
          <Row href="/app/transactions" icon="🧾" label="Transactions" />
          <Row href="/app/loans" icon="📄" label="My loans" />
        </Card>
      </div>

      <button
        onClick={logout}
        className="w-full rounded-full border border-red-200 py-3.5 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        Log out
      </button>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-bold text-slate-900">{value}</p>
    </div>
  );
}

function Row({ href, icon, label }: { href: string; icon: string; label: string }) {
  return (
    <Link href={href} className="flex items-center gap-3 px-4 py-3.5">
      <span className="text-lg">{icon}</span>
      <span className="flex-1 text-sm font-medium text-slate-700">{label}</span>
      <span className="text-slate-300">›</span>
    </Link>
  );
}
