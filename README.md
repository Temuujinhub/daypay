# DayPay

НАЭ/Дубайн цагаач ажилчдад зориулсан, зохицуулалттай (DFSA ITL Sandbox) финтек зээлийн платформ — мобайл апп + backend + admin/lender web портал.

## Баримтууд

- **`docs/00-TECH-PROPOSAL.md`** — Технологийн шийдвэр, архитектур, ажлын урсгал, бэлтгэх зүйлсийн санал (ЭХЛЭЭД ҮҮНИЙГ УНШ).
- `01_SYSTEM_SPECIFICATION` — Бизнес/системийн бүрэн спецификаци (тусдаа).

## Стек

Turborepo monorepo · NestJS (backend) · Next.js (web) · Expo/React Native (mobile) · PostgreSQL + Prisma · shared Zod contracts.

## Босгосон зүйл (Foundation — Үе 0 ✅)

- `apps/api` — NestJS modular monolith (auth/kyc/loan/payment/notification/lender/admin/health), Prisma (13 хүснэгт + migration + seed), JWT auth, sandbox guard, Swagger. **End-to-end шалгагдсан.**
- `apps/web` — Next.js 15 admin/lender портал (calculator demo).
- `apps/mobile` — Expo Router апп (calculator дэлгэц).
- `packages/contracts` — shared Zod schema/type + `calculateLoan()`.
- CI (GitHub Actions), CLAUDE.md, docker-compose, dev-setup script.

> Статус: Foundation бэлэн. Дараагийн алхам — Үе 1 (Auth + KYC босоо зүсэлт). Дэлгэрэнгүй: `docs/00-TECH-PROPOSAL.md` §7.

## Хурдан эхлэх

```bash
pnpm install
pnpm db:up                 # Postgres + Redis (Docker)
cd apps/api && pnpm exec prisma migrate dev && pnpm db:seed && cd ../..
pnpm dev                   # бүх апп зэрэг
```
