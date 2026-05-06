# Arsitektur Sistem SIAKAD

## 1) Konseptual Arsitektur
- Frontend: Next.js 15 + React + Tailwind
- Backend API: NestJS modular per domain
- Database: PostgreSQL + Prisma ORM
- Auth: JWT access token + refresh token
- RBAC: role + permission matrix per aksi menu
- Audit trail: interceptor ke `audit_logs`

## 2) Struktur Monorepo
- `apps/web`: UI admin, dosen, mahasiswa
- `apps/api`: service REST API + prisma
- `packages/shared`: shared type/contracts (disiapkan untuk ekspansi)

## 3) Modul Backend MVP
- `auth`
- `master`
- `curriculum`
- `classes`
- `krs`
- `grades`
- `khs`
- `transcripts`

## 4) Security Baseline
- Password hashing bcrypt
- Global `JwtAuthGuard`
- Global `PermissionGuard`
- Global `ValidationPipe`
- Global `AuditLogInterceptor`

## 5) Scalability Path
- Queue worker (PDF/Excel/import)
- Redis cache + token blacklist
- Object storage dokumen
- API gateway + service decomposition per domain besar
