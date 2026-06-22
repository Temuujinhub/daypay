"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from "../../../components/ui";

export default function KycQueuePage() {
  const { data, error, loading, refetch } = useApi(() => api.kycQueue(), []);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function review(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api.reviewKyc(id, approve);
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="KYC Review Queue"
        subtitle="Verify Emirates ID, biometric match and AML screening before approval."
      />

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data && data.length === 0 ? (
        <EmptyState message="🎉 The KYC queue is empty — nothing pending review." />
      ) : null}

      {data && data.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Borrower</Th>
              <Th>Phone</Th>
              <Th>Emirates ID</Th>
              <Th>Biometric match</Th>
              <Th>Status</Th>
              <Th className="text-right">Decision</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <Td>{u.fullName ?? "—"}</Td>
                <Td>{u.phoneNumber}</Td>
                <Td>{u.emiratesId ?? "—"}</Td>
                <Td>
                  {u.biometricMatchScore !== null ? (
                    <span
                      className={
                        u.biometricMatchScore >= 90 ? "text-emerald-600" : "text-amber-600"
                      }
                    >
                      {u.biometricMatchScore}%
                    </span>
                  ) : (
                    "—"
                  )}
                </Td>
                <Td>
                  <Badge status={u.kycStatus} />
                </Td>
                <Td>
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="success"
                      disabled={busyId === u.id}
                      onClick={() => review(u.id, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      variant="danger"
                      disabled={busyId === u.id}
                      onClick={() => review(u.id, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null}
    </>
  );
}
