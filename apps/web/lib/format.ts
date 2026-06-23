export function aed(value: number | null | undefined): string {
  if (value === null || value === undefined) return "—";
  return `AED ${value.toLocaleString(undefined, { maximumFractionDigits: 2 })}`;
}

export function date(value: string | Date | null | undefined): string {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

const STATUS_TONE: Record<string, "green" | "amber" | "red" | "blue" | "slate"> = {
  // applications
  draft: "slate",
  submitted: "blue",
  under_review: "amber",
  documents_pending: "amber",
  approved: "green",
  disbursed: "green",
  rejected: "red",
  cancelled: "slate",
  // loans
  active: "green",
  paid_off: "blue",
  defaulted: "red",
  overdue: "red",
  // kyc
  pending: "slate",
  in_review: "amber",
  verified: "green",
};

export function statusTone(status: string): "green" | "amber" | "red" | "blue" | "slate" {
  return STATUS_TONE[status] ?? "slate";
}

export function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}
