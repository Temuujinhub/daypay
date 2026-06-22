"use client";

import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed } from "../../../lib/format";
import { Card, ErrorState, PageHeader, Spinner, StatCard } from "../../../components/ui";

export default function ReportsPage() {
  const { data, error, loading } = useApi(() => api.sandboxReport(), []);

  return (
    <>
      <PageHeader
        title="DFSA ITL Sandbox Report"
        subtitle="Regulatory test-plan metrics (spec §10.4) for the Innovation Testing Licence."
      />

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              label="Users registered"
              value={`${data.newUsersRegistered} / ${data.maxSandboxUsers}`}
              hint="Sandbox participant cap"
            />
            <StatCard label="KYC approval rate" value={`${data.kycApprovalRate}%`} />
            <StatCard label="Applications" value={data.loanApplicationsCount} />
            <StatCard label="Loans approved" value={data.loansApprovedCount} />
            <StatCard label="Average loan" value={aed(data.averageLoanAmount)} />
            <StatCard label="Total portfolio" value={aed(data.totalPortfolio)} />
            <StatCard
              label="Non-performing"
              value={data.nplCount}
              hint="Overdue installments"
            />
            <StatCard
              label="Participant usage"
              value={`${Math.round((data.newUsersRegistered / data.maxSandboxUsers) * 100)}%`}
            />
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-sm font-semibold text-slate-700">Compliance notes</h2>
            <ul className="mt-3 space-y-2 text-sm text-slate-600">
              <li>
                • Operating under DFSA Innovation Testing Licence (ITL) — capped at{" "}
                {data.maxSandboxUsers} sandbox participants.
              </li>
              <li>• All money movement runs in test mode; no real funds are transferred.</li>
              <li>
                • Conventional financing (interest-based) under the ITL sandbox; Islamic structures
                are out of scope for this phase.
              </li>
            </ul>
          </Card>
        </>
      ) : null}
    </>
  );
}
