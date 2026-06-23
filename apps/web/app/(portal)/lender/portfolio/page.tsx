"use client";

import { api } from "../../../../lib/api";
import { useApi } from "../../../../lib/useApi";
import { aed } from "../../../../lib/format";
import {
  Badge,
  EmptyState,
  ErrorState,
  PageHeader,
  Spinner,
  StatCard,
  Table,
  Td,
  Th,
} from "../../../../components/ui";

export default function LenderPortfolioPage() {
  const { data, error, loading } = useApi(() => api.lenderPortfolio(), []);

  return (
    <>
      <PageHeader title="Portfolio" subtitle="Your institution's disbursed loans and exposure." />

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}

      {data ? (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard label="Applications" value={data.totalApplications} />
            <StatCard label="Loans" value={data.totalLoans} />
            <StatCard label="Active" value={data.activeLoans} />
            <StatCard label="Disbursed" value={aed(data.totalDisbursed)} />
            <StatCard label="Outstanding" value={aed(data.totalOutstanding)} />
          </div>

          <h2 className="mb-3 mt-8 text-sm font-semibold text-slate-700">Loans</h2>
          {data.loans.length === 0 ? (
            <EmptyState message="No loans disbursed yet." />
          ) : (
            <Table>
              <thead>
                <tr>
                  <Th>Loan #</Th>
                  <Th>Borrower</Th>
                  <Th>Product</Th>
                  <Th>Principal</Th>
                  <Th>Outstanding</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody>
                {data.loans.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50">
                    <Td>{l.loanNumber}</Td>
                    <Td>{l.userName}</Td>
                    <Td>{l.productName}</Td>
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
        </>
      ) : null}
    </>
  );
}
