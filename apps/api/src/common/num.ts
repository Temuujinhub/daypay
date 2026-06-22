import { Prisma } from "@prisma/client";

/** Convert a Prisma Decimal (or null) to a plain number. */
export function num(d: Prisma.Decimal | number | null | undefined): number {
  if (d == null) return 0;
  return typeof d === "number" ? d : Number(d);
}

export function genRef(prefix: string): string {
  // Keep within VARCHAR(20) for application/loan numbers:
  // e.g. APP-20260622-AB12CD = 19 chars.
  const date = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${date}-${rand}`;
}
