# DayPay — Backend deploy (Railway) & connecting the mobile app

Энэ заавар нь backend-ийг үүлэн дээр deploy хийж, мобайл аппыг **бодит дата + жинхэнэ нэвтрэлт**-руу холбоно. (Локалд Postgres суулгахаас илүү найдвартай, ямар ч сүлжээнээс ажиллана.)

## 1. Backend-ийг Railway-д deploy хийх

1. https://railway.app → GitHub-аар бүртгүүл/нэвтэр.
2. **New Project → Deploy from GitHub repo → `Temuujinhub/daypay`**.
   - Repo-д `railway.json` байгаа тул Railway автоматаар `apps/api/Dockerfile`-ээр build хийнэ.
3. Тэр project дотор **New → Database → Add PostgreSQL** дарж Postgres нэм.
4. **API service → Variables** хэсэгт дараахыг нэм:
   | Нэр | Утга |
   |---|---|
   | `DATABASE_URL` | `${{Postgres.DATABASE_URL}}` (Postgres-ийг reference хийнэ) |
   | `JWT_ACCESS_SECRET` | урт санамсаргүй тэмдэгт мөр |
   | `JWT_REFRESH_SECRET` | өөр урт санамсаргүй мөр |
   | `JWT_ACCESS_TTL` | `15m` |
   | `JWT_REFRESH_TTL` | `30d` |
   | `SANDBOX_MODE` | `true` |
   | `INTEGRATIONS_MODE` | `mock` |
   | `NODE_ENV` | `production` |
   - `PORT`-ийг Railway өөрөө өгнө — бүү гар.
5. **API service → Settings → Networking → Generate Domain** дарж нийтийн URL ав
   (жнь `https://daypay-api-production.up.railway.app`).
6. Deploy дуустал хүлээ. Шалга:
   - `https://<домэйн>/health` → `{"status":"ok",...}`
   - `https://<домэйн>/docs` → Swagger API баримт
   - (Deploy үед migration + seed автоматаар ажиллаж, бүтээгдэхүүн + demo хэрэглэгч үүснэ.)

> **Render-ээр хийх бол:** New → **Web Service** → repo → Environment **Docker**, Dockerfile Path `apps/api/Dockerfile` → New → **PostgreSQL** үүсгэж `DATABASE_URL`-ийг service-д холбо → дээрхтэй ижил Variables.

## 2. Мобайл аппыг backend-руу холбох

1. `apps/mobile/.env` файл үүсгэ (байхгүй бол):
   ```
   EXPO_PUBLIC_API_URL=https://<Railway-ийн-домэйн>
   ```
2. Expo-г дахин асаа (env уншигдахаар):
   ```
   pnpm --filter @daypay/mobile start --clear
   ```
3. Утсан дээрх Expo Go → апп ачаална → **Login** дэлгэц гарна.
   - Demo хэрэглэгчээр нэвтэр: утас `+971500000001` → "Send code" →
     OTP кодыг (mock тул) Railway-ийн **Deploy Logs**-д `[mock-sms] OTP for ...`
     гэж харагдана → оруул → **бодит дата**-тай нэвтэрнэ.
   - Эсвэл шинэ дугаараар бүртгүүлж, **KYC submit** хийгээд (mock auto-verify)
     зээлийн бүтээгдэхүүн рүү **Apply** хийвэл жинхэнэ зээл үүснэ.

## 3. Орчны хувьсагч (товч)

- Backend: `DATABASE_URL`, `JWT_*`, `SANDBOX_MODE`, `INTEGRATIONS_MODE`, `NODE_ENV` (PORT auto).
- Mobile: `EXPO_PUBLIC_API_URL` (хоосон → DEMO mock mode; тохирсон → бодит backend).

## 4. Дараа нь (production-д)

- Бодит интеграци: `INTEGRATIONS_MODE=live` + UAEID/AECB/SMS/банк түлхүүрүүд (адаптер ард).
- Дата байршил: PDPL-ийн дагуу UAE бүс (AWS me-central-1) руу шилжих.
- `real_money_mode` болон жинхэнэ KYC vendor зөвхөн DFSA лицензийн дараа.
