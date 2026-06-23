"use client";

import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed, humanize } from "../../../lib/format";
import { Badge, Card, ErrorState, PageHeader, Spinner, StatCard } from "../../../components/ui";

export default function DashboardPage() {
  const { data, error, loading } = useApi(() => api.overview(), []);

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle="Portfolio overview across the DFSA ITL sandbox."
      />
      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard label="Total borrowers" value={data.totalUsers} />
            <StatCard
              label="KYC verified"
              value={data.kycVerified}
              hint={`${data.totalUsers ? Math.round((data.kycVerified / data.totalUsers) * 100) : 0}% of borrowers`}
            />
            <StatCard label="Active loans" value={data.activeLoans} />
            <StatCard label="Loans disbursed" value={data.totalLoans} />
            <StatCard label="Total disbursed" value={aed(data.totalDisbursed)} />
            <StatCard label="Outstanding balance" value={aed(data.totalOutstanding)} />
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-sm font-semibold text-slate-700">Applications by status</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              {Object.keys(data.applicationsByStatus).length === 0 ? (
                <p className="text-sm text-slate-400">No applications yet.</p>
              ) : (
                Object.entries(data.applicationsByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3"
                  >
                    <Badge status={status} />
                    <span className="text-lg font-bold text-slate-900">{count}</span>
                    <span className="text-xs text-slate-400">{humanize(status)}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </>
      ) : null}
    </>
  );
}
