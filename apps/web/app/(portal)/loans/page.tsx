"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed, humanize } from "../../../lib/format";
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

const STATUSES = ["", "active", "paid_off", "defaulted"];

export default function LoansPage() {
  const [status, setStatus] = useState("");
  const { data, error, loading } = useApi(() => api.loans(status || undefined), [status]);

  return (
    <>
      <PageHeader title="Loans" subtitle="Disbursed loans and their repayment progress." />

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
      {data && data.length === 0 ? <EmptyState message="No loans match this filter." /> : null}

      {data && data.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Loan #</Th>
              <Th>Borrower</Th>
              <Th>Product</Th>
              <Th>Lender</Th>
              <Th>Principal</Th>
              <Th>Outstanding</Th>
              <Th>APR</Th>
              <Th>Progress</Th>
              <Th>Status</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((l) => (
              <tr key={l.id} className="hover:bg-slate-50">
                <Td>{l.loanNumber}</Td>
                <Td>{l.userName}</Td>
                <Td>{l.productName}</Td>
                <Td>{l.lenderName}</Td>
                <Td>{aed(l.principalAmount)}</Td>
                <Td>{aed(l.outstandingBalance)}</Td>
                <Td>{l.apr}%</Td>
                <Td>
                  {l.paymentsMade}/{l.termMonths}
                </Td>
                <Td>
                  <Badge status={l.status} />
                </Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null}
    </>
  );
}
