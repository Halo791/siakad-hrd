# SIAKAD Kampus - MVP Tahap 1

## Scope MVP
- Auth (JWT + refresh token)
- Master data PT
- Kurikulum
- Kelas kuliah
- KRS
- Nilai
- KHS
- Transkrip

## Arsitektur
Lihat detail: `docs/architecture.md`

## Menjalankan dengan Docker
1. `docker compose up --build -d`
2. API: `http://localhost:3101/api/v1`
3. Swagger: `http://localhost:3101/docs`
4. Web: `http://localhost:3000`

## Menjalankan Lokal
1. Install dependency root dan workspace
2. Salin env: `cp apps/api/.env.example apps/api/.env`
3. Jalankan DB MySQL lokal di port `3307` (atau sesuaikan `DATABASE_URL`)
4. Generate Prisma client: `npm --workspace @siakad/api run prisma:generate`
5. Migrate: `npm run db:migrate`
6. Seed: `npm run db:seed`
7. Start: `npm run dev`

## User Seed Default
- Email: `superadmin@siakad.local`
- Password: `Admin@12345`
