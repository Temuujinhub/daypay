#!/usr/bin/env bash
# Idempotent setup so a fresh checkout (incl. Claude Code web sessions) can
# build/typecheck immediately. Safe to run repeatedly.
set -uo pipefail
cd "$(dirname "$0")/.."

echo "[dev-setup] installing workspace deps…"
pnpm install --frozen-lockfile || pnpm install

echo "[dev-setup] building shared contracts…"
pnpm --filter @daypay/contracts build >/dev/null 2>&1 || true

echo "[dev-setup] generating Prisma client…"
export DATABASE_URL="${DATABASE_URL:-postgresql://daypay:daypay@localhost:5432/daypay?schema=public}"
pnpm --filter @daypay/api exec prisma generate >/dev/null 2>&1 || true

echo "[dev-setup] done."
