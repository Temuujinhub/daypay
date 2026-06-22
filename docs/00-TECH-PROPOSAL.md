# DayPay — Технологийн Шийдвэр ба Хэрэгжүүлэлтийн Санал

**Хувилбар:** 1.0 · **Огноо:** 2026-06 · **Статус:** Санал (баталгаажуулахыг хүлээж байна)

> Энэ баримт нь `01_SYSTEM_SPECIFICATION` спецификацид үндэслэн, **ганц хөгжүүлэгч + Claude Code** гэсэн нөхцөлд DayPay-г хэрхэн **бодитоор** босгох технологи, архитектур, ажлын урсгал, бэлтгэх зүйлсийг тодорхойлно. Технологийн сонголтыг ижил төстөй нээлттэй эхийн repo-нуудын судалгаанд тулгуурлав.

---

## 1. Гол асуулт: Claude Code дангаараа бүгдийг босгож чадах уу?

**Богино хариу: Тийм — кодын ~100%-ийг Claude Code бичиж, ажиллуулж, build хийж чадна.** Backend болон Web нь бүрэн, Mobile нь Expo + EAS тусламжтайгаар кодын болон binary build хүртэл хийгдэнэ.

| Хэсэг | Claude Code хийж чадах эсэх | Тайлбар |
|---|---|---|
| **Backend (NestJS + Postgres)** | ✅ 100% | Код бичих, migration, тест, локал ажиллуулах, deploy script бүгд боломжтой |
| **Web (Next.js admin/lender портал)** | ✅ 100% | Код, dev server, build бүгд боломжтой |
| **Mobile (Expo / React Native)** | ✅ ~100% | Бүх TS/JS код, UI, навигаци, API холболт. **EAS Build** нь iOS/Android binary-г **үүлэн дээр** хийнэ (Mac шаардлагагүй) |

**Claude хийж ЧАДАХГҮЙ цөөн зүйл (хүн биечлэн хийх):**

1. **Утсаа гар дээрээ барьж дарж** үзэх — гэхдээ Expo-той бол QR код уншуулаад л шууд утсан дээр амьд харагдана (маш хялбар).
2. **Төлбөртэй данс үүсгэх / батлах** — Apple Developer ($99/жил), Google Play ($25 нэг удаа), хостинг данс, App Store/Play Store-д илгээх эцсийн баталгаажуулалт.
3. **Гадаад үйлчилгээний гэрээ/түлхүүр авах** — UAEID, AECB, KYC vendor, SMS gateway гэх мэт (эдгээр нь лицензтэй компани шаарддаг). *Үүнийг авах хүртэл Claude **mock/туршилтын адаптер** дээр бүрэн ажиллана.*
4. **Бизнес/зохицуулалтын ажил** — DIFC компани, DFSA лиценз, MLRO, хуульч (специйн Хавсралт А/Б).

> **Дүгнэлт:** Software-ийн хувьд Claude Code 100% хүрэлцэнэ. Таны үүрэг гол төлөв: **данс/түлхүүр/төлбөр**, **утсан дээр тестлэх**, **зохицуулалт/бизнес** талд.

---

## 2. Хамгийн чухал залруулга: Специйн архитектур "хэт хүнд"

Спец нь **маш сайн** боловч **эцсийн төлөв** (100,000 хэрэглэгч, бүрэн CBUAE лиценз)-д зориулсан enterprise архитектур (8 microservice, Kubernetes/EKS, Kong gateway) санал болгосон. **Sandbox үе шат (≤100 хэрэглэгч) болон ганц хөгжүүлэгчид энэ нь хэт хүнд** — хурдыг сааруулж, алдааг нэмэгдүүлнэ.

Салбарын зөвлөмж (судалгаагаар батлагдсан): финтек MVP / ганц хөгжүүлэгчид **Modular Monolith** хамгийн тохиромжтой. Нэг deployable апп дотор домэйн бүрийг тусдаа **module** болгож, хэрэгцээ гарвал хожим microservice болгон салгана.

| Спец дэх (эцсийн төлөв) | Бид одоо хийх (MVP/Sandbox) | Шалтгаан |
|---|---|---|
| 8 microservice | **1 NestJS modular monolith** (module бүрээр салгасан) | Хурд, энгийн, нэг хүн арчилахад тохиромжтой |
| Kubernetes (EKS) + Kong | **1 контейнер + managed Postgres** (Railway/Render/Fly) | 100 хэрэглэгчид K8s илүүц; хожим scale болгоно |
| TypeORM | **Prisma** | AI-assisted хөгжүүлэлтэд DX/type-safety илүү (доор үзнэ үү) |
| Олон tool | **Monorepo + Turborepo** | Backend/web/mobile нэг repo-д type хуваалцана |

> Специйн **өгөгдлийн загвар, API гэрээ, аюулгүй байдал, нийцлийн шаардлага** — эдгээрийг бүрэн хадгална. Зөвхөн **deployment/scale** давхаргыг үе шаттай болгож байна.

---

## 3. Сонгосон технологийн стек (repo судалгаанд тулгуурласан)

### 3.1 Гол олдвор
Судалгаагаар: **TypeScript-ээр бичигдсэн, шууд fork хийх боломжтой нээлттэй эх neobank/lending backend байхгүй.** Тиймээс найдвартай арга бол: **boilerplate + monorepo starter** дээр зээлийн домэйнийг өөрсдөө бичих.

### 3.2 Стек

| Давхарга | Сонголт | Лавлагаа repo / Шалтгаан |
|---|---|---|
| **Monorepo** | Turborepo + pnpm workspaces | `t3-oss/create-t3-turbo` (~6.1k★) — web+mobile+shared types-ийн стандарт |
| **Backend** | NestJS 10 (modular monolith) | `brocoders/nestjs-boilerplate` (~4.3k★) — JWT, RBAC, **i18n**, Docker бэлэн. Спецтэй нийцнэ |
| **ORM/DB** | Prisma + PostgreSQL 15 | Prisma нь NestJS-д 2025 оны зөвлөмж — type-safety, migration, DX |
| **API гэрээ** | Shared Zod schema (`packages/contracts`) + Swagger/OpenAPI | 3 апп нэг л DTO/type хуваалцана; гадны lender-д REST+Swagger өгнө |
| **Web** | Next.js 15 (App Router) + Tailwind + shadcn/ui + TanStack Query | Admin + Lender портал. Хурдан, Claude-д ээлтэй |
| **Mobile** | Expo SDK 54 (React Native, TS) + Expo Router | EAS cloud build (Mac хэрэггүй); hot-reload; `Galaxies-dev/fintech-clone-react-native` (UI лавлагаа) |
| **Mobile state/data** | Zustand + TanStack Query; `expo-secure-store` (token) | Хөнгөн, найдвартай |
| **Mobile нэмэлт** | NativeWind (Tailwind for RN), i18next (5 хэл), expo-local-authentication (биометр), expo-notifications (push), expo-camera + ML Kit (Emirates ID OCR) | Специйн шаардлагатай нийцнэ |
| **Дараалал/cron** | BullMQ + Redis (эхэндээ заавал биш) | Мэдэгдэл, эргэн төлөлтийн cron |
| **Infra (dev)** | Docker Compose (Postgres+Redis) | Локал орчин |
| **Infra (deploy)** | Railway/Render/Fly → дараа нь **AWS me-central-1 (Abu Dhabi)** | Production-д UAE дата байршил (PDPL) шаардлагатай |
| **CI/CD** | GitHub Actions + EAS Build | Спецтэй нийцнэ |

### 3.3 Домэйн загварын лавлагаа (код биш, дизайн)
- **`frappe/lending`** — зээлийн бүтэн lifecycle (бүтээгдэхүүн → олголт → эргэн төлөлт → хүү). Stack нь өөр (Python) ч **домэйн загварын хамгийн сайн жишээ**.
- **`pietrzakadrian/bank-server`** (~285★) — double-entry ledger, олон валют, i18n — NestJS-ээр бичигдсэн.

### 3.4 KYC / OCR
- **Capture:** ML Kit OCR (`react-native-vision-camera-mlkit`) эсвэл BlinkID (төлбөртэй SDK).
- **Server-side:** `tesseract.js`.
- **Production verification/liveness:** hosted vendor (Onfido / Sumsub / Jumio) — лицензтэй болсны дараа.
- **Одоо:** mock KYC адаптер (тогтсон туршилтын үр дүн буцаана).

---

## 4. Repo бүтэц (monorepo)

```
daypay/
├── apps/
│   ├── api/                # NestJS modular monolith
│   │   └── src/modules/    # auth, kyc, loan, payment, notification, lender, admin
│   ├── web/                # Next.js — admin + lender портал
│   └── mobile/             # Expo (React Native) — хэрэглэгчийн апп
├── packages/
│   ├── contracts/          # shared Zod schema + TS types (DTO, API гэрээ)
│   ├── config/             # shared tsconfig / eslint / prettier
│   └── ui/                 # (хожим) shared design tokens (teal #00A896)
├── docker-compose.yml      # Postgres + Redis (локал)
├── turbo.json
└── .github/workflows/      # CI (lint, test, build)
```

**Сервис → Module зураглал** (специйн 8 сервис → 1 monolith-ийн module):
`auth-service → AuthModule`, `kyc-service → KycModule`, `loan-service → LoanModule`, `payment-service → PaymentModule`, `notification-service → NotificationModule`, `lender-service → LenderModule`, `admin-service → AdminModule`. (remittance — Phase 2.)

---

## 5. Ажлын урсгал (Workflow) — мобайлыг үргэлжлүүлэн хөгжүүлэх

### 5.1 Өдөр тутмын dev loop
1. `docker compose up` → Postgres + Redis.
2. `pnpm dev` (Turborepo бүх аппыг зэрэг) — эсвэл тус тусд нь:
   - Backend: `pnpm --filter api dev` → `localhost:3000`
   - Web: `pnpm --filter web dev` → `localhost:3001`
   - Mobile: `pnpm --filter mobile start` → **QR код** → утсан дээрх **Expo Go / dev build** дээр уншуулна → **hot-reload** (код хадгалмагц шууд шинэчлэгдэнэ).
3. Утас backend-д хүрэхийн тулд `--tunnel` эсвэл LAN IP ашиглана.

### 5.2 Claude-ийн үүрэг (давталт бүрт)
Код бичих/засах → migration → unit/e2e тест → lint → server ажиллуулах → commit → push → PR → `eas build` (binary) → `eas update` (OTA засвар).

### 5.3 Таны үүрэг (давталт бүрт)
Утсан дээрээ аппыг нээж дарж үзэх → "энэ болохгүй / ийм байх ёстой" гэж хэлэх → Claude засна. Давтана.

### 5.4 Release
- **`eas build`** → үүлэн дээр iOS (TestFlight) + Android (APK/AAB) binary.
- **`eas submit`** → дэлгүүрт илгээх.
- **`eas update`** → JS/UI засварыг дэлгүүрийн шинэ build-гүйгээр шууд хэрэглэгчид түлхэх (давталтад маш хүчтэй).

---

## 6. Та юу бэлдэх вэ (Checklist)

### A. Одоо эхлэхэд (заавал)
- [x] GitHub repo (бэлэн)
- [ ] Тест хийх **утас** (Android эсвэл iPhone) — Expo Go суулгана
- *Өөр юу ч хэрэггүй: Claude mock адаптераар бүх аппыг босгож эхэлнэ.*

### B. Данс / түлхүүр (хүн үүсгэнэ — Claude чадахгүй)
- [ ] **Expo** данс (үнэгүй)
- [ ] **Apple Developer** ($99/жил) — iOS дэлгүүр/TestFlight-д шаардагдах үед
- [ ] **Google Play Developer** ($25 нэг удаа)
- [ ] **Хостинг** данс — Railway/Render/Fly (үнэгүй tier-ээс эхэлж болно); production-д **AWS me-central-1**

### C. Гадаад үйлчилгээний гэрээ (жинхэнэ дата-д; лицензтэй компани шаардна)
- [ ] UAEID API (Emirates ID), [ ] AECB (зээлийн товчоо), [ ] SMS gateway (Amaken гм), [ ] KYC/AML vendor (Onfido/Sumsub/Jumio), [ ] E-Sign (DocuSign), [ ] Банк/IBAN direct-debit, [ ] Exchange house (Phase 2)
- *Хүртэл нь: Claude mock + sandbox түлхүүр ашиглана.*

### D. Бизнес / зохицуулалт (хуульч/нийцлийн баг — software-аас гадуур)
- [ ] DIFC компани, [ ] DFSA ITL лиценз, [ ] MLRO + нийцлийн ажилтан, [ ] хуулийн зөвлөх, [ ] суурь капитал (спец Хавсралт А/Б)

### E. Төхөөрөмж
- Утас — **тийм**. Mac — **шаардлагагүй** (EAS үүлэн build).

---

## 7. Хэрэгжүүлэлтийн үе шатууд

| Үе | Агуулга | Гадаад хамаарал |
|---|---|---|
| **0. Foundation** | Monorepo + 3 апп scaffold + shared contracts + Docker + CI | Байхгүй |
| **1. Auth + KYC (босоо зүсэлт)** | OTP бүртгэл, JWT, Emirates ID + selfie урсгал (mock), нүүр хуудас | Mock |
| **2. Зээлийн цөм** | Бүтээгдэхүүн, тооцоолуур, lender сонголт, өргөдөл, e-sign, хуваарь | Mock AECB |
| **3. Эргэн төлөлт + Мэдэгдэл** | IBAN, cron, push/SMS/email, тайлан | Mock bank/SMS |
| **4. Admin + Lender портал (web)** | Хэрэглэгч удирдлага, KYC дараалал, lender шийдвэр, DFSA тайлан | — |
| **5. Жинхэнэ интеграци** | Mock → бодит vendor (лиценз/түлхүүр ирэхэд) | Гэрээ шаардна |
| **6. Scale (хэрэгцээгээр)** | AWS me-central-1, autoscaling, (хэрэгцээтэй бол) Kong/microservice | — |

---

## 8. Лавлагаа repo-нууд (судалгаа)

| Зориулалт | Repo | ★ |
|---|---|---|
| Monorepo стандарт | `t3-oss/create-t3-turbo` | ~6.1k |
| NestJS+Next+Expo нэг repo | `barisgit/nextjs-nestjs-expo-template` | ~30 |
| NestJS backend boilerplate | `brocoders/nestjs-boilerplate` | ~4.3k |
| NestJS+Prisma+Next monorepo | `ejazahm3d/fullstack-turborepo-starter` | ~587 |
| Зээлийн домэйн загвар | `frappe/lending` | ~306 |
| Банк домэйн (NestJS, ledger) | `pietrzakadrian/bank-server` | ~285 |
| Mobile fintech UI | `Galaxies-dev/fintech-clone-react-native` | ~406 |

---

*Энэ нь санал. Баталгаажсаны дараа дараагийн алхам нь §7-ийн "Үе 0: Foundation"-ийг scaffold хийх явдал.*
