# DayPay API — production image (pnpm monorepo). Build context = repo root.
FROM node:22-slim AS build
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*
RUN corepack enable && corepack prepare pnpm@10.33.0 --activate
WORKDIR /app

# Workspace manifests first for better layer caching.
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml .npmrc turbo.json tsconfig.base.json ./
COPY packages/contracts/package.json ./packages/contracts/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/

# Install only the API and its workspace deps (contracts) — not web/mobile.
RUN pnpm install --frozen-lockfile --filter "@daypay/api..."

# Sources needed to build the API.
COPY packages/contracts ./packages/contracts
COPY apps/api ./apps/api

RUN pnpm --filter @daypay/contracts build \
  && pnpm --filter @daypay/api exec prisma generate \
  && pnpm --filter @daypay/api build

ENV NODE_ENV=production
WORKDIR /app/apps/api
EXPOSE 3000

# Apply migrations, seed (best-effort), then start.
CMD ["pnpm", "run", "start:prod"]
