import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-8 p-8">
      <header>
        <h1 className="text-4xl font-bold text-brand">DayPay</h1>
        <p className="mt-2 text-slate-600">
          Admin &amp; Lender operations portal — KYC review queue, lender decisions,
          and DFSA sandbox reporting.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:border-brand"
        >
          <h2 className="text-lg font-semibold">Loan calculator</h2>
          <p className="mt-1 text-sm text-slate-500">
            Demo of the shared @daypay/contracts calculation used by web, mobile and API.
          </p>
        </Link>
        <div className="rounded-xl border border-dashed border-slate-300 p-6 text-slate-400">
          <h2 className="text-lg font-semibold">KYC queue · Lenders · Reports</h2>
          <p className="mt-1 text-sm">Scaffolded — roadmap Phase 4.</p>
        </div>
      </section>
    </main>
  );
}
