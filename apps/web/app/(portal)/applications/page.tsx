"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed, date, humanize } from "../../../lib/format";
import {
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from "../../../components/ui";

const STATUSES = ["", "under_review", "disbursed", "rejected", "submitted", "documents_pending"];

export default function ApplicationsPage() {
  const [status, setStatus] = useState("");
  const { data, error, loading } = useApi(() => api.applications(status || undefined), [status]);

  return (
    <>
      <PageHeader title="Applications" subtitle="Loan applications across all lenders." />

      <div className="mb-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || "all"}
            onClick={() => setStatus(s)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              status === s ? "bg-brand text-white" : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {s ? humanize(s) : "All"}
          </button>
        ))}
      </div>

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data && data.length === 0 ? <EmptyState message="No applications match this filter." /> : null}

      {data && data.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Application #</Th>
              <Th>Borrower</Th>
              <Th>Product</Th>
              <Th>Lender</Th>
              <Th>Requested</Th>
              <Th>Term</Th>
              <Th>Status</Th>
              <Th>Date</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((a) => (
              <tr key={a.id} className="hover:bg-slate-50">
                <Td>{a.applicationNumber}</Td>
                <Td>{a.userName}</Td>
                <Td>{a.productName}</Td>
                <Td>{a.lenderName}</Td>
                <Td>{aed(a.requestedAmount)}</Td>
                <Td>{a.requestedTerm} mo</Td>
                <Td>
                  <Badge status={a.status} />
                </Td>
                <Td>{date(a.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null}
    </>
  );
}
