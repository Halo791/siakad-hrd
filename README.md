# SIAKAD Laravel

Versi Laravel full-stack untuk menjalankan backend dan frontend dalam satu aplikasi cPanel.

## Status

Starter ini memakai database SIAKAD MySQL yang sudah ada. Modul awal yang sudah dibuat:

- Login web menggunakan tabel `User` dan hash `passwordHash`.
- Dashboard ringkas.
- Master mahasiswa, dosen, fakultas, dan prodi.
- Register user sederhana.
- Endpoint kompatibilitas `/api/v1` untuk UI Next.js di repo ini.

Laravel ini sengaja ditempatkan di `apps/siakad-laravel` agar API Node lama tetap bisa menjadi fallback selama migrasi.

## Kebutuhan Server

- PHP 8.1 atau lebih baru.
- Composer 2.x.
- Extension umum Laravel: `pdo_mysql`, `openssl`, `mbstring`, `tokenizer`, `xml`, `ctype`, `json`, `fileinfo`.

## Setup Lokal atau Server

```bash
cd apps/siakad-laravel
composer install --no-dev --optimize-autoloader
cp .env.example .env
php artisan key:generate
```

Edit `.env`:

```env
APP_URL=https://xd.ingenio.id
DB_HOST=localhost
DB_DATABASE=ingg8232_siakad
DB_USERNAME=ingg8232_siakadku
DB_PASSWORD=...
```

Optimasi production:

```bash
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## cPanel

Set document root domain ke:

```text
apps/siakad-laravel/public
```

Jika cPanel tidak mengizinkan document root ke folder tersebut, upload isi `public/` ke `public_html` dan sesuaikan `index.php` agar menunjuk ke folder `apps/siakad-laravel`.

## Demo Login

```text
superadmin@siakad.local / Admin@12345
```

## Data Demo Besar

Untuk mengisi data contoh massal di cPanel/phpMyAdmin, import file berikut setelah struktur database utama sudah masuk:

```text
database/siakad_demo_1000.sql
```

Isi file tersebut mencakup 1000 mahasiswa, 120 dosen, mata kuliah, kelas, KRS, nilai, tagihan, pembayaran, pembimbing akademik, aktivitas, dan data pendukung lain. Akun contoh yang ikut dibuat:

```text
mhs0001@siakad.local / Admin@12345
dosen0001@siakad.local / Admin@12345
```

Jika perlu membuat ulang file SQL massal:

```bash
php database/generate_demo_1000.php
```

## Endpoint Awal

```text
GET  /api/v1
POST /api/v1/auth/login
GET  /api/v1/auth/profile
GET  /api/v1/dashboard/admin
GET  /api/v1/dashboard/dosen
GET  /api/v1/dashboard/mahasiswa
GET  /api/v1/dashboard/secure/admin
GET  /api/v1/dashboard/secure/dosen
GET  /api/v1/dashboard/secure/mahasiswa
GET  /api/v1/dashboard/secure/mahasiswa/portal
GET  /api/v1/dashboard/secure/dosen/portal
GET  /api/v1/access/roles
GET  /api/v1/access/permissions
GET  /api/v1/access/users
GET  /api/v1/master/universities
GET  /api/v1/master/faculties
GET  /api/v1/master/study-programs
GET  /api/v1/master/students
GET  /api/v1/master/lecturers
```

Frontend Next.js dapat diarahkan ke Laravel dengan:

```env
NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8000/api/v1
```
