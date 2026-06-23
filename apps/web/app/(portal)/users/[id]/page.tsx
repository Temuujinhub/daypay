"use client";

import { use, useState } from "react";
import Link from "next/link";
import { api } from "../../../../lib/api";
import { useApi } from "../../../../lib/useApi";
import { aed, date } from "../../../../lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Spinner,
  Table,
  Td,
  Th,
} from "../../../../components/ui";

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data, error, loading, refetch } = useApi(() => api.user(id), [id]);
  const [busy, setBusy] = useState(false);

  async function toggleSuspend() {
    if (!data) return;
    setBusy(true);
    try {
      await api.suspendUser(data.id, data.isActive); // suspend when currently active
      refetch();
    } finally {
      setBusy(false);
    }
  }

  async function reviewKyc(approve: boolean) {
    if (!data) return;
    setBusy(true);
    try {
      await api.reviewKyc(data.id, approve);
      refetch();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Link href="/users" className="text-sm text-brand hover:underline">
        ← Back to users
      </Link>

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}

      {data ? (
        <>
          <div className="mb-6 mt-2 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{data.fullName ?? "Unnamed user"}</h1>
              <p className="mt-1 text-sm text-slate-500">
                {data.phoneNumber}
                {data.email ? ` · ${data.email}` : ""} · {data.role.replace(/_/g, " ")}
              </p>
            </div>
            <div className="flex gap-2">
              {(data.kycStatus === "pending" || data.kycStatus === "in_review") && data.role === "user" ? (
                <>
                  <Button variant="success" disabled={busy} onClick={() => reviewKyc(true)}>
                    Approve KYC
                  </Button>
                  <Button variant="danger" disabled={busy} onClick={() => reviewKyc(false)}>
                    Reject KYC
                  </Button>
                </>
              ) : null}
              <Button variant={data.isActive ? "danger" : "success"} disabled={busy} onClick={toggleSuspend}>
                {data.isActive ? "Suspend" : "Reactivate"}
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat label="KYC status" node={<Badge status={data.kycStatus} />} />
            <Stat label="Account" node={data.isActive ? "Active" : "Suspended"} />
            <Stat label="Credit score" node={data.creditScore ?? "—"} />
            <Stat label="Available credit" node={aed(data.availableCredit)} />
          </div>

          <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-700">Loans</h2>
          {data.loans.length === 0 ? (
            <EmptyState message="No loans." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Loan #</Th>
                  <Th>Product</Th>
                  <Th>Lender</Th>
                  <Th>Principal</Th>
                  <Th>Outstanding</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.loans.map((l) => (
                  <tr key={l.id}>
                    <Td>{l.loanNumber}</Td>
                    <Td>{l.productName}</Td>
                    <Td>{l.lenderName}</Td>
                    <Td>{aed(l.principalAmount)}</Td>
                    <Td>{aed(l.outstandingBalance)}</Td>
                    <Td>
                      <Badge status={l.status} />
                    </Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}

          <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-700">Applications</h2>
          {data.applications.length === 0 ? (
            <EmptyState message="No applications." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Application #</Th>
                  <Th>Product</Th>
                  <Th>Requested</Th>
                  <Th>Status</Th>
                  <Th>Date</Th>
                </tr>
              </thead>
              <tbody>
                {data.applications.map((a) => (
                  <tr key={a.id}>
                    <Td>{a.applicationNumber}</Td>
                    <Td>{a.productName}</Td>
                    <Td>{aed(a.requestedAmount)}</Td>
                    <Td>
                      <Badge status={a.status} />
                    </Td>
                    <Td>{date(a.createdAt)}</Td>
                  </tr>
                ))}
              </tbody>
            </Table>
          )}
        </>
      ) : null}
    </>
  );
}

function Stat({ label, node }: { label: string; node: React.ReactNode }) {
  return (
    <Card className="p-5">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-2 text-lg font-semibold text-slate-900">{node}</p>
    </Card>
  );
}
