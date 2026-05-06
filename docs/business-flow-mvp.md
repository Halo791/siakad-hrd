# Flow Bisnis MVP Tahap 1

## 1. Auth + RBAC
1. User login pakai email/password.
2. Sistem verifikasi password hash.
3. Sistem terbitkan access token (1 jam) + refresh token (7 hari).
4. Setiap request endpoint privat wajib bearer token.
5. Endpoint memeriksa permission menu berdasarkan aksi (`read/insert/update/...`).
6. Aktivitas user dicatat ke `audit_logs`.

## 2. Master Data Perguruan Tinggi
1. Super admin/admin universitas membuat fakultas.
2. Admin fakultas/prodi membuat program studi.
3. Admin akademik membuat tahun ajaran dan periode aktif.
4. Data master menjadi referensi kurikulum, kelas, KRS, KHS.

## 3. Kurikulum
1. Admin prodi membuat kurikulum per tahun.
2. Admin prodi membuat mata kuliah (kode, nama, SKS, grade lulus minimal).
3. Mata kuliah dimapping ke kurikulum per semester.
4. Dapat ditambah prasyarat dan ekuivalensi.

## 4. Kelas Kuliah
1. Admin akademik membuka kelas dari mata kuliah kurikulum.
2. Sistem menentukan kapasitas kelas, jadwal, ruang, dosen pengajar.
3. Sistem dapat generate pertemuan otomatis berdasarkan jumlah pertemuan.

## 5. KRS
1. Mahasiswa membuat KRS status `DRAFT`.
2. Mahasiswa menambahkan item kelas ke KRS.
3. Sistem validasi awal:
   - Batas maksimal SKS per semester.
   - Tidak boleh ada bentrok jadwal.
   - Prasyarat mata kuliah terpenuhi.
4. Mahasiswa submit KRS (`SUBMITTED`).
5. Dosen PA validasi (`APPROVED` atau `REJECTED`).

## 6. Nilai
1. Dosen input komponen nilai per kelas.
2. Sistem hitung nilai akhir otomatis.
3. Konversi nilai angka ke huruf berdasarkan skala nilai prodi.
4. Nilai dikunci oleh admin akademik.

## 7. KHS dan Transkrip
1. Sistem mengambil nilai yang sudah locked.
2. Sistem hitung IPS per periode ke tabel `khs`.
3. Sistem hitung IPK kumulatif ke tabel `transcripts`.
4. Hasil bisa diekspor PDF/Excel.

## Validasi Bisnis Kritis MVP
- KRS tidak bisa disubmit jika total SKS > aturan periode.
- Presensi hanya dapat diinput untuk mahasiswa yang KRS-nya approved.
- Nilai yang sudah lock tidak bisa diubah dosen.
- KHS hanya menampilkan nilai locked.
- Transkrip harus mempertimbangkan aturan nilai ulang (best/latest) yang ditetapkan kampus.
