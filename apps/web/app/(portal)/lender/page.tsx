"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed, date } from "../../../lib/format";
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
} from "../../../components/ui";

export default function LenderQueuePage() {
  const { data, error, loading, refetch } = useApi(() => api.lenderQueue(), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [declining, setDeclining] = useState<string | null>(null);
  const [reason, setReason] = useState("");

  async function decide(id: string, approve: boolean) {
    setBusyId(id);
    try {
      await api.lenderDecide(id, approve, approve ? undefined : reason || "Declined by lender");
      setDeclining(null);
      setReason("");
      refetch();
    } finally {
      setBusyId(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Decision Queue"
        subtitle="Applications routed to your institution. Approving disburses the loan instantly (sandbox)."
      />

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data && data.length === 0 ? (
        <EmptyState message="🎉 No applications waiting — your queue is clear." />
      ) : null}

      {data && data.length > 0 ? (
        <div className="space-y-4">
          {data.map((a) => (
            <Card key={a.id} className="p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-slate-900">{a.userName}</h3>
                    <Badge status={a.status} />
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {a.applicationNumber} · {date(a.createdAt)}
                  </p>
                  <div className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-sm sm:grid-cols-4">
                    <Field label="Product" value={a.productName} />
                    <Field label="Requested" value={aed(a.requestedAmount)} />
                    <Field label="Term" value={`${a.requestedTerm} months`} />
                    <Field label="Credit score" value={a.creditScore ?? "—"} />
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2">
                  {declining === a.id ? (
                    <div className="flex flex-col items-end gap-2">
                      <input
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Reason for declining…"
                        className="w-56 rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
                      />
                      <div className="flex gap-2">
                        <Button variant="ghost" onClick={() => setDeclining(null)}>
                          Cancel
                        </Button>
                        <Button variant="danger" disabled={busyId === a.id} onClick={() => decide(a.id, false)}>
                          Confirm decline
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button variant="danger" disabled={busyId === a.id} onClick={() => setDeclining(a.id)}>
                        Decline
                      </Button>
                      <Button variant="success" disabled={busyId === a.id} onClick={() => decide(a.id, true)}>
                        Approve &amp; disburse
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : null}
    </>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
      <p className="font-medium text-slate-800">{value}</p>
    </div>
  );
}
