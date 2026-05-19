# SIAKAD Laravel

Versi Laravel full-stack untuk menjalankan backend dan frontend dalam satu aplikasi cPanel.

## Status

Starter ini memakai database SIAKAD MySQL yang sudah ada. Modul awal yang sudah dibuat:

- Login web menggunakan tabel `User` dan hash `passwordHash`.
- Dashboard ringkas.
- Master mahasiswa, dosen, fakultas, dan prodi.
- Register user sederhana.
- Endpoint kompatibilitas awal `/api/v1`.

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

## Endpoint Awal

```text
GET  /api/v1
POST /api/v1/auth/login
GET  /api/v1/auth/profile
GET  /api/v1/dashboard/admin
GET  /api/v1/access/roles
GET  /api/v1/access/users
```
