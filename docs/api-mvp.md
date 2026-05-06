# Endpoint REST API MVP Tahap 1

Semua endpoint (kecuali login/refresh) dilindungi JWT bearer token + permission guard.

## Auth
- `POST /api/v1/auth/login` (`Public`)
- `POST /api/v1/auth/refresh` (`Public`)
- `GET /api/v1/auth/profile` (JWT)

## Akses & Audit (Modul A)
- `GET /api/v1/access/roles`
- `GET /api/v1/access/permissions`
- `GET /api/v1/access/users`
- `POST /api/v1/access/users/assign-role`
- `POST /api/v1/access/users/set-primary-role`
- `GET /api/v1/access/role-permissions/:roleId`
- `POST /api/v1/access/role-permissions`
- `GET /api/v1/access/audit-logs?limit=100`
- `POST /api/v1/access/permission-check/validate`
- `POST /api/v1/access/permission-check/approve`
- `POST /api/v1/access/permission-check/reject`
- `POST /api/v1/access/permission-check/print`
- `POST /api/v1/access/permission-check/export`
- `POST /api/v1/access/permission-check/import`
- `POST /api/v1/access/permission-check/generate`
- `POST /api/v1/access/permission-check/lock`
- `POST /api/v1/access/permission-check/unlock`

## Master Data
- `GET /api/v1/master/universities`
- `POST /api/v1/master/universities`
- `PATCH /api/v1/master/universities/:id`
- `DELETE /api/v1/master/universities/:id`
- `GET /api/v1/master/academic-years`
- `POST /api/v1/master/academic-years`
- `PATCH /api/v1/master/academic-years/:id`
- `DELETE /api/v1/master/academic-years/:id`
- `GET /api/v1/master/faculties` (`MASTER_FACULTY:read`)
- `POST /api/v1/master/faculties` (`MASTER_FACULTY:insert`)
- `PATCH /api/v1/master/faculties/:id` (`MASTER_FACULTY:update`)
- `DELETE /api/v1/master/faculties/:id` (`MASTER_FACULTY:delete`)
- `GET /api/v1/master/study-programs` (`MASTER_STUDY_PROGRAM:read`)
- `POST /api/v1/master/study-programs` (`MASTER_STUDY_PROGRAM:insert`)
- `PATCH /api/v1/master/study-programs/:id` (`MASTER_STUDY_PROGRAM:update`)
- `DELETE /api/v1/master/study-programs/:id` (`MASTER_STUDY_PROGRAM:delete`)
- `GET /api/v1/master/degree-levels` (`MASTER_STUDY_PROGRAM:read`)
- `POST /api/v1/master/degree-levels` (`MASTER_STUDY_PROGRAM:insert`)
- `PATCH /api/v1/master/degree-levels/:id` (`MASTER_STUDY_PROGRAM:update`)
- `DELETE /api/v1/master/degree-levels/:id` (`MASTER_STUDY_PROGRAM:delete`)
- `GET /api/v1/master/academic-periods` (`MASTER_PERIOD:read`)
- `POST /api/v1/master/academic-periods` (`MASTER_PERIOD:insert`)
- `PATCH /api/v1/master/academic-periods/:id` (`MASTER_PERIOD:update`)
- `DELETE /api/v1/master/academic-periods/:id` (`MASTER_PERIOD:delete`)
- `GET /api/v1/master/students`
- `POST /api/v1/master/students`
- `PATCH /api/v1/master/students/:id`
- `DELETE /api/v1/master/students/:id`
- `GET /api/v1/master/lecturers`
- `POST /api/v1/master/lecturers`
- `PATCH /api/v1/master/lecturers/:id`
- `DELETE /api/v1/master/lecturers/:id`
- `GET /api/v1/master/student-parents`
- `POST /api/v1/master/student-parents`
- `PATCH /api/v1/master/student-parents/:id`
- `DELETE /api/v1/master/student-parents/:id`
- `GET /api/v1/master/study-systems`
- `POST /api/v1/master/study-systems`
- `PATCH /api/v1/master/study-systems/:id`
- `DELETE /api/v1/master/study-systems/:id`
- `GET /api/v1/master/student-classes`
- `POST /api/v1/master/student-classes`
- `PATCH /api/v1/master/student-classes/:id`
- `DELETE /api/v1/master/student-classes/:id`
- `GET /api/v1/master/student-statuses`
- `POST /api/v1/master/student-statuses`
- `PATCH /api/v1/master/student-statuses/:id`
- `DELETE /api/v1/master/student-statuses/:id`

## Kurikulum
- `GET /api/v1/curriculum` (`CURRICULUM:read`)
- `POST /api/v1/curriculum` (`CURRICULUM:insert`)
- `GET /api/v1/curriculum/courses` (`COURSE:read`)
- `POST /api/v1/curriculum/courses` (`COURSE:insert`)

## Kelas Kuliah
- `GET /api/v1/classes` (`CLASS:read`)
- `POST /api/v1/classes` (`CLASS:insert`)

## KRS
- `GET /api/v1/krs` (`KRS:read`)
  - filter opsional: `periodId`, `status` (`DRAFT|SUBMITTED|APPROVED|REJECTED|CANCELED`)
- `POST /api/v1/krs` (`KRS:insert`)
- `POST /api/v1/krs/:id/items` (`KRS:insert`)
- `POST /api/v1/krs/:id/submit` (`KRS:update`)
- `POST /api/v1/krs/:id/approve` (`KRS:approve`)
- `POST /api/v1/krs/approve-bulk` (`KRS:approve`) untuk validasi massal KRS
- `POST /api/v1/krs/:id/reject` (`KRS:reject`)
- `POST /api/v1/krs/:id/validate` (`KRS:validate`)

## Setting Prodi (sesuai alur panduan SIM)
- `GET /api/v1/settings/study-program` (`SETTING_PRODI:read`) filter opsional `periodId`
- `POST /api/v1/settings/study-program` (`SETTING_PRODI:update`)
  - mengatur: buka/tutup KRS, rentang tanggal KRS, buka validasi KRS, cetak KRS/UTS/UAS, minimal presensi, jumlah pertemuan, hak dosen

## Nilai
- `GET /api/v1/grades` (`GRADE:read`)
- `POST /api/v1/grades/:id/lock` (`GRADE:lock`)
- `POST /api/v1/grades/:id/unlock` (`GRADE:unlock`)
- `POST /api/v1/grades/import-csv` (`GRADE:import`, multipart: `file`, body: `classId`)

## KHS
- `GET /api/v1/khs` (`KHS:read`)
- `POST /api/v1/khs/generate/:periodId` (`KHS:generate`)

## Transkrip
- `GET /api/v1/transcripts` (`TRANSCRIPT:read`)
- `POST /api/v1/transcripts/generate/:studentId` (`TRANSCRIPT:generate`)

## Laporan Export
- `GET /api/v1/reports/krs/:studyPlanId.csv` (`KRS:export`)
- `GET /api/v1/reports/krs/:studyPlanId.xlsx` (`KRS:export`)
- `GET /api/v1/reports/transcript/:studentId.csv` (`TRANSCRIPT:export`)
- `GET /api/v1/reports/transcript/:studentId.xlsx` (`TRANSCRIPT:export`)
- `GET /api/v1/reports/khs/:studentId/:periodId.pdf` (`KHS:print`)

## Dokumen Akademik
- `POST /api/v1/documents/upload` (`DOCUMENT:insert`, multipart: `file`, body: `studentId`, `category`)
- `GET /api/v1/documents/student/:studentId` (`DOCUMENT:read`)
- `GET /api/v1/documents/:id/download` (`DOCUMENT:read`)
- `DELETE /api/v1/documents/:id` (`DOCUMENT:delete`)

Aturan upload:
- Maksimum ukuran file: `5MB`
- Tipe file: `.pdf, .jpg, .jpeg, .png, .doc, .docx, .xlsx`

## Format CSV Import Nilai
Header minimum:
`nim,score,letter`

Contoh:
`20260001,88,A`

## Skenario QA Seed (Siap Uji)
- Login super admin:
  - email: `superadmin@siakad.local`
  - password: `Admin@12345`
- Skenario sukses KRS:
  - `studyPlanId`: `krs_mhs1_2026_ganjil`
- Skenario gagal prasyarat:
  - `studyPlanId`: `krs_mhs2_prereq_fail`
  - expected: `400` dengan pesan prasyarat belum terpenuhi
- Skenario gagal bentrok jadwal:
  - `studyPlanId`: `krs_mhs2_conflict`
  - expected: `400` dengan pesan bentrok jadwal
