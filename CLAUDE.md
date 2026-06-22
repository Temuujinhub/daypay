# DayPay — Claude guide

Regulated fintech lending platform (UAE / DFSA ITL sandbox): mobile app + backend + admin/lender web portal.
Read `docs/00-TECH-PROPOSAL.md` for the full technology decision and roadmap.

## Monorepo layout (Turborepo + pnpm)

```
apps/api      NestJS modular monolith (Prisma + Postgres)  — modules: auth, kyc, loan, payment, notification, lender, admin, health
apps/web      Next.js 15 admin/lender portal (Tailwind)
apps/mobile   Expo (React Native, Expo Router) consumer app
packages/contracts  Shared Zod schemas + types + calculateLoan() (used by all three)
```

## Commands (run from repo root)

| Command | What |
|---|---|
| `pnpm install` | Install all workspaces |
| `pnpm build` | Build contracts + api + web (turbo) |
| `pnpm typecheck` | Typecheck every package |
| `pnpm dev` | Run all apps in dev (turbo) |
| `pnpm --filter @daypay/api dev` | API only (http://localhost:3000, Swagger /docs) |
| `pnpm --filter @daypay/web dev` | Web only (http://localhost:3001) |
| `pnpm --filter @daypay/mobile start` | Expo dev server (scan QR with Expo Go) |

## Database

Local dev expects Postgres at `DATABASE_URL` (see `.env.example`). With Docker: `pnpm db:up`.

Prisma lives in `apps/api/prisma`. After changing `schema.prisma`:
```
cd apps/api
pnpm exec prisma migrate dev --name <change>
pnpm db:seed
```
`@prisma/client` must be generated before api typecheck/build: `pnpm --filter @daypay/api exec prisma generate` (needs `DATABASE_URL` set).

### No Docker daemon? (e.g. this cloud sandbox)
Postgres 16 binaries are at `/usr/lib/postgresql/16/bin`. Run a throwaway cluster:
```
mkdir -p /tmp/pgdata && chown -R postgres /tmp/pgdata
su postgres -c "/usr/lib/postgresql/16/bin/initdb -D /tmp/pgdata -U daypay --auth=trust"
su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D /tmp/pgdata -o '-p 5432 -k /tmp' -l /tmp/pg.log start"
su postgres -c "/usr/lib/postgresql/16/bin/createdb -h 127.0.0.1 -p 5432 -U daypay daypay"
export DATABASE_URL="postgresql://daypay:daypay@127.0.0.1:5432/daypay?schema=public"
```

## Conventions

- **Shared types first:** put DTOs / API contracts / shared logic in `packages/contracts` so api, web and mobile stay in sync. Rebuild it (`pnpm --filter @daypay/contracts build`) after edits.
- **Modular monolith:** add backend features as NestJS modules under `apps/api/src/modules`, not new services.
- **External integrations are mocked** (`INTEGRATIONS_MODE=mock`) until real vendor keys exist; keep them behind adapters.
- React is pinned to one version across the workspace via `pnpm.overrides` (RN + Next must share a single React copy).
