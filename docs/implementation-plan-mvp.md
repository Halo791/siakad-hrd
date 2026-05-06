# Implementation Plan MVP Tahap 1

## Sprint 1 (sudah)
- Monorepo scaffold (web + api + prisma)
- Schema prisma core + tabel minimum
- Auth login/refresh
- Guard JWT + RBAC + audit log interceptor
- Endpoint dasar master/kurikulum/kelas/KRS
- Dashboard UI admin/dosen/mahasiswa

## Sprint 2 (lanjutan sebelum go-live internal)
- CRUD lengkap master data (universitas, fakultas, prodi, periode, dosen, mahasiswa)
- Validasi KRS lanjutan:
  - prasyarat matkul
  - cek bentrok jadwal
  - cek batas SKS berbasis IPS
- Workflow approval KRS oleh dosen PA
- Modul nilai:
  - input manual
  - lock/unlock
  - hitung nilai akhir
- Generate KHS + transkrip otomatis

## Sprint 3
- Upload dokumen (mahasiswa, tugas, PMB) via object storage
- Export PDF/Excel (KRS, KHS, transkrip, nilai)
- Dashboard statistik real-time
- Audit trail viewer di UI admin

## Sprint 4
- PMB basic flow
- Keuangan akademik basic (bill, payment, VA)
- Integrasi payment gateway (adapter pattern)
- Integrasi Neo Feeder (sync queue)

## Definition of Done Teknis
- Semua endpoint punya validasi DTO + business rule
- Semua mutasi data tercatat audit log
- Semua query list punya pagination
- Semua modul utama punya unit test minimal service-layer
- Seed data cukup untuk demo 3 role: super admin, dosen, mahasiswa
