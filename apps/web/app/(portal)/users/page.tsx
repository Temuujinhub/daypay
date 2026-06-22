"use client";

import { useState } from "react";
import { api } from "../../../lib/api";
import { useApi } from "../../../lib/useApi";
import { aed, date } from "../../../lib/format";
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  LinkCell,
  PageHeader,
  Spinner,
  Table,
  Td,
  Th,
} from "../../../components/ui";

export default function UsersPage() {
  const [query, setQuery] = useState("");
  const [committed, setCommitted] = useState("");
  const { data, error, loading } = useApi(() => api.users(committed || undefined), [committed]);

  return (
    <>
      <PageHeader title="Users" subtitle="All borrowers and staff accounts." />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          setCommitted(query);
        }}
        className="mb-4 flex gap-2"
      >
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name, phone or email…"
          className="w-full max-w-sm rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-brand focus:ring-1 focus:ring-brand"
        />
        <Button type="submit">Search</Button>
        {committed ? (
          <Button
            variant="ghost"
            onClick={() => {
              setQuery("");
              setCommitted("");
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

      {loading ? <Spinner /> : null}
      {error ? <ErrorState message={error} /> : null}
      {data && data.length === 0 ? <EmptyState message="No users found." /> : null}

      {data && data.length > 0 ? (
        <Table>
          <thead>
            <tr>
              <Th>Name</Th>
              <Th>Phone</Th>
              <Th>Role</Th>
              <Th>KYC</Th>
              <Th>Credit score</Th>
              <Th>Available credit</Th>
              <Th>Status</Th>
              <Th>Joined</Th>
            </tr>
          </thead>
          <tbody>
            {data.map((u) => (
              <tr key={u.id} className="hover:bg-slate-50">
                <Td>
                  <LinkCell href={`/users/${u.id}`}>{u.fullName ?? "—"}</LinkCell>
                  {u.email ? <div className="text-xs text-slate-400">{u.email}</div> : null}
                </Td>
                <Td>{u.phoneNumber}</Td>
                <Td>
                  <span className="text-xs font-medium text-slate-500">
                    {u.role.replace(/_/g, " ")}
                  </span>
                </Td>
                <Td>
                  <Badge status={u.kycStatus} />
                </Td>
                <Td>{u.creditScore ?? "—"}</Td>
                <Td>{aed(u.availableCredit)}</Td>
                <Td>
                  {u.isActive ? (
                    <span className="text-emerald-600">Active</span>
                  ) : (
                    <span className="text-rose-600">Suspended</span>
                  )}
                </Td>
                <Td>{date(u.createdAt)}</Td>
              </tr>
            ))}
          </tbody>
        </Table>
      ) : null}
    </>
  );
}
