@php
    $planned = fn (string $path) => route('dashboard', ['menu' => $path]);
    $studentPortal = fn (string $tab) => route('portal.mahasiswa', ['tab' => $tab] + (request('studentId') ? ['studentId' => request('studentId')] : []));
    $portal = fn (string $section, string $tab) => route('portal.index', ['section' => $section, 'tab' => $tab]);
    $curriculum = fn (string $tab) => route('curriculum.index', ['tab' => $tab]);
    $menuGroups = [
        [
            'label' => 'Beranda', 'description' => 'Ringkasan sistem', 'items' => [
                ['label' => 'Dashboard Admin', 'href' => route('dashboard'), 'active' => request()->routeIs('dashboard') && !request('menu')],
                ['label' => 'Ringkasan Akademik', 'href' => route('dashboard', ['menu' => 'Beranda > Ringkasan Akademik'])],
                ['label' => 'Aktivitas Terbaru', 'href' => route('dashboard', ['menu' => 'Beranda > Aktivitas Terbaru'])],
            ],
        ],
        [
            'label' => 'Portal', 'description' => 'Pusat data pengguna', 'items' => [
                ['label' => 'Mahasiswa', 'active' => request()->routeIs('portal.mahasiswa') || request()->routeIs('master.students'), 'children' => [
                    ['label' => 'Daftar Mahasiswa', 'href' => $studentPortal('daftar-mahasiswa'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab', 'daftar-mahasiswa') === 'daftar-mahasiswa'],
                    ['label' => 'Detail Mahasiswa', 'href' => $studentPortal('detail-mahasiswa'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'detail-mahasiswa'],
                    ['label' => 'Biodata', 'href' => $studentPortal('biodata'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'biodata'],
                    ['label' => 'Status Semester', 'href' => $studentPortal('status-semester'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'status-semester'],
                    ['label' => 'KRS', 'href' => $studentPortal('krs'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'krs'],
                    ['label' => 'KHS', 'href' => $studentPortal('khs'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'khs'],
                    ['label' => 'Transkrip', 'href' => $studentPortal('transkrip'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'transkrip'],
                    ['label' => 'Riwayat Keuangan', 'href' => $studentPortal('riwayat-keuangan'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'riwayat-keuangan'],
                    ['label' => 'Konsentrasi/Peminatan', 'href' => $studentPortal('konsentrasi-peminatan'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'konsentrasi-peminatan'],
                    ['label' => 'Pindah/Transfer Prodi', 'href' => $studentPortal('pindah-transfer-prodi'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'pindah-transfer-prodi'],
                    ['label' => 'Nilai Konversi', 'href' => $studentPortal('nilai-konversi'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'nilai-konversi'],
                    ['label' => 'Aktivitas & Prestasi', 'href' => $studentPortal('aktivitas-prestasi'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'aktivitas-prestasi'],
                    ['label' => 'Salin Mahasiswa', 'href' => $studentPortal('salin-mahasiswa'), 'active' => request()->routeIs('portal.mahasiswa') && request('tab') === 'salin-mahasiswa'],
                ]],
                ['label' => 'Pegawai', 'active' => request()->routeIs('portal.index') && request()->route('section') === 'pegawai', 'children' => [
                    ['label' => 'Daftar Pegawai/Dosen', 'href' => $portal('pegawai', 'daftar-pegawai'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'pegawai' && request('tab', 'daftar-pegawai') === 'daftar-pegawai'],
                    ['label' => 'Detail Pegawai', 'href' => $portal('pegawai', 'detail-pegawai'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'pegawai' && request('tab') === 'detail-pegawai'],
                    ['label' => 'Pembimbing', 'href' => $portal('pegawai', 'pembimbing'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'pegawai' && request('tab') === 'pembimbing'],
                    ['label' => 'Tanda Tangan/NIDN/NIDK/NUPN', 'href' => $portal('pegawai', 'tanda-tangan'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'pegawai' && request('tab') === 'tanda-tangan'],
                ]],
                ['label' => 'Kegiatan', 'active' => request()->routeIs('portal.index') && request()->route('section') === 'kegiatan', 'children' => [
                    ['label' => 'Kalender Akademik', 'href' => $portal('kegiatan', 'kalender-akademik'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'kegiatan' && request('tab', 'kalender-akademik') === 'kalender-akademik'],
                    ['label' => 'Monitoring Kalender Akademik', 'href' => $portal('kegiatan', 'monitoring-kalender-akademik'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'kegiatan' && request('tab') === 'monitoring-kalender-akademik'],
                ]],
                ['label' => 'Orang Tua', 'active' => request()->routeIs('portal.index') && request()->route('section') === 'orang-tua', 'children' => [
                    ['label' => 'Monitoring Mahasiswa', 'href' => $portal('orang-tua', 'monitoring-mahasiswa'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'orang-tua'],
                ]],
                ['label' => 'Alumni', 'active' => request()->routeIs('portal.index') && request()->route('section') === 'alumni', 'children' => [
                    ['label' => 'Profil Alumni', 'href' => $portal('alumni', 'profil-alumni'), 'active' => request()->routeIs('portal.index') && request()->route('section') === 'alumni'],
                ]],
            ],
        ],
        [
            'label' => 'Perkuliahan', 'description' => 'Proses akademik', 'items' => [
                ['label' => 'Data Kurikulum', 'active' => request()->routeIs('curriculum.index'), 'children' => [
                    ['label' => 'Tahun Kurikulum', 'href' => $curriculum('tahun-kurikulum'), 'active' => request()->routeIs('curriculum.index') && request('tab', 'tahun-kurikulum') === 'tahun-kurikulum'],
                    ['label' => 'Mata Kuliah', 'href' => $curriculum('mata-kuliah'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'mata-kuliah'],
                    ['label' => 'Kurikulum Prodi', 'href' => $curriculum('kurikulum-prodi'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'kurikulum-prodi'],
                    ['label' => 'Skala Nilai', 'href' => $curriculum('skala-nilai'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'skala-nilai'],
                    ['label' => 'Komposisi Nilai', 'href' => $curriculum('komposisi-nilai'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'komposisi-nilai'],
                    ['label' => 'Predikat Kelulusan', 'href' => $curriculum('predikat-kelulusan'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'predikat-kelulusan'],
                    ['label' => 'Aturan Evaluasi', 'href' => $curriculum('aturan-evaluasi'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'aturan-evaluasi'],
                    ['label' => 'Ekivalensi Mata Kuliah', 'href' => $curriculum('ekivalensi-mata-kuliah'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'ekivalensi-mata-kuliah'],
                    ['label' => 'Kurikulum Konsentrasi', 'href' => $curriculum('kurikulum-konsentrasi'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'kurikulum-konsentrasi'],
                    ['label' => 'Prasyarat Mata Kuliah', 'href' => $curriculum('prasyarat-mata-kuliah'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'prasyarat-mata-kuliah'],
                    ['label' => 'Set Grup MK Wajib Pilihan', 'href' => $curriculum('grup-mk-wajib-pilihan'), 'active' => request()->routeIs('curriculum.index') && request('tab') === 'grup-mk-wajib-pilihan'],
                ]],
                ['label' => 'Data Kelas', 'children' => [
                    ['label' => 'Tahun Ajaran', 'href' => $planned('Perkuliahan > Data Kelas > Tahun Ajaran')],
                    ['label' => 'Kelas Kuliah', 'href' => $planned('Perkuliahan > Data Kelas > Kelas Kuliah')],
                    ['label' => 'Detail Kelas Kuliah', 'href' => $planned('Perkuliahan > Data Kelas > Detail Kelas Kuliah')],
                    ['label' => 'Dosen Pengajar', 'href' => $planned('Perkuliahan > Data Kelas > Dosen Pengajar')],
                    ['label' => 'Jadwal Perkuliahan', 'href' => $planned('Perkuliahan > Data Kelas > Jadwal Perkuliahan')],
                    ['label' => 'Peserta Kelas', 'href' => $planned('Perkuliahan > Data Kelas > Peserta Kelas')],
                    ['label' => 'Presensi Kelas', 'href' => $planned('Perkuliahan > Data Kelas > Presensi Kelas')],
                    ['label' => 'Nilai Perkuliahan', 'href' => $planned('Perkuliahan > Data Kelas > Nilai Perkuliahan')],
                    ['label' => 'Jadwal & Presensi', 'href' => $planned('Perkuliahan > Data Kelas > Jadwal & Presensi')],
                    ['label' => 'Pemutihan Nilai', 'href' => $planned('Perkuliahan > Data Kelas > Pemutihan Nilai')],
                ]],
                ['label' => 'Administrasi', 'children' => [
                    ['label' => 'Status Semester', 'href' => $planned('Perkuliahan > Administrasi > Status Semester')],
                    ['label' => 'Pembimbing Akademik', 'href' => $planned('Perkuliahan > Administrasi > Pembimbing Akademik')],
                    ['label' => 'Transfer Mahasiswa', 'href' => $planned('Perkuliahan > Administrasi > Transfer Mahasiswa')],
                    ['label' => 'Evaluasi Mahasiswa', 'href' => $planned('Perkuliahan > Administrasi > Evaluasi Mahasiswa')],
                    ['label' => 'Konversi Nilai', 'href' => $planned('Perkuliahan > Administrasi > Konversi Nilai')],
                    ['label' => 'Paket Kuliah', 'href' => $planned('Perkuliahan > Administrasi > Paket Kuliah')],
                    ['label' => 'Sunting KRS', 'href' => $planned('Perkuliahan > Administrasi > Sunting KRS')],
                ]],
                ['label' => 'Proposal Tugas Akhir', 'children' => [
                    ['label' => 'Tahap Proposal', 'href' => $planned('Perkuliahan > Proposal Tugas Akhir > Tahap Proposal')],
                    ['label' => 'Syarat Ujian', 'href' => $planned('Perkuliahan > Proposal Tugas Akhir > Syarat Ujian')],
                    ['label' => 'Unsur Nilai', 'href' => $planned('Perkuliahan > Proposal Tugas Akhir > Unsur Nilai')],
                    ['label' => 'Daftar Proposal', 'href' => $planned('Perkuliahan > Proposal Tugas Akhir > Daftar Proposal')],
                    ['label' => 'Detail Proposal', 'href' => $planned('Perkuliahan > Proposal Tugas Akhir > Detail Proposal')],
                ]],
                ['label' => 'Kegiatan Pendukung', 'children' => [
                    ['label' => 'Daftar Kegiatan', 'href' => $planned('Perkuliahan > Kegiatan Pendukung > Daftar Kegiatan')],
                    ['label' => 'Peserta', 'href' => $planned('Perkuliahan > Kegiatan Pendukung > Peserta')],
                    ['label' => 'Pembimbing', 'href' => $planned('Perkuliahan > Kegiatan Pendukung > Pembimbing')],
                    ['label' => 'Rincian Kegiatan', 'href' => $planned('Perkuliahan > Kegiatan Pendukung > Rincian Kegiatan')],
                    ['label' => 'Nilai/Konversi', 'href' => $planned('Perkuliahan > Kegiatan Pendukung > Nilai/Konversi')],
                ]],
                ['label' => 'Kuesioner', 'children' => [
                    ['label' => 'Daftar Pertanyaan', 'href' => $planned('Perkuliahan > Kuesioner > Daftar Pertanyaan')],
                    ['label' => 'Daftar Jawaban', 'href' => $planned('Perkuliahan > Kuesioner > Daftar Jawaban')],
                ]],
                ['label' => 'Berhenti Studi', 'children' => [
                    ['label' => 'Pengajuan Cuti', 'href' => $planned('Perkuliahan > Berhenti Studi > Pengajuan Cuti')],
                ]],
                ['label' => 'Data Yudisium', 'children' => [
                    ['label' => 'Periode Yudisium', 'href' => $planned('Perkuliahan > Data Yudisium > Periode Yudisium')],
                    ['label' => 'Syarat Yudisium', 'href' => $planned('Perkuliahan > Data Yudisium > Syarat Yudisium')],
                    ['label' => 'Eligible Yudisium', 'href' => $planned('Perkuliahan > Data Yudisium > Eligible Yudisium')],
                    ['label' => 'Tambah Peserta', 'href' => $planned('Perkuliahan > Data Yudisium > Tambah Peserta')],
                    ['label' => 'Daftar Yudisium', 'href' => $planned('Perkuliahan > Data Yudisium > Daftar Yudisium')],
                    ['label' => 'Penomoran Dokumen', 'href' => $planned('Perkuliahan > Data Yudisium > Penomoran Dokumen')],
                ]],
                ['label' => 'Data Wisuda', 'children' => [
                    ['label' => 'Periode Wisuda', 'href' => $planned('Perkuliahan > Data Wisuda > Periode Wisuda')],
                    ['label' => 'Peserta Wisuda', 'href' => $planned('Perkuliahan > Data Wisuda > Peserta Wisuda')],
                ]],
            ],
        ],
        [
            'label' => 'Kemahasiswaan', 'description' => 'Layanan studi mahasiswa', 'items' => [
                ['label' => 'Aktivitas', 'children' => [
                    ['label' => 'Kelompok Aktivitas', 'href' => $planned('Kemahasiswaan > Aktivitas > Kelompok Aktivitas')],
                    ['label' => 'Peringkat Aktivitas', 'href' => $planned('Kemahasiswaan > Aktivitas > Peringkat Aktivitas')],
                    ['label' => 'Aktivitas dan Prestasi', 'href' => $planned('Kemahasiswaan > Aktivitas > Aktivitas dan Prestasi')],
                    ['label' => 'Validasi Aktivitas', 'href' => $planned('Kemahasiswaan > Aktivitas > Validasi Aktivitas')],
                    ['label' => 'Tampil di SKPI', 'href' => $planned('Kemahasiswaan > Aktivitas > Tampil di SKPI')],
                ]],
                ['label' => 'SKPI', 'children' => [
                    ['label' => 'SKPI Mahasiswa', 'href' => $planned('Kemahasiswaan > SKPI > SKPI Mahasiswa')],
                    ['label' => 'Informasi Tambahan', 'href' => $planned('Kemahasiswaan > SKPI > Informasi Tambahan')],
                ]],
                ['label' => 'Prestasi', 'children' => [
                    ['label' => 'Daftar Prestasi', 'href' => $planned('Kemahasiswaan > Prestasi > Daftar Prestasi')],
                    ['label' => 'Validasi Prestasi', 'href' => $planned('Kemahasiswaan > Prestasi > Validasi Prestasi')],
                ]],
            ],
        ],
        [
            'label' => 'Kampus Merdeka', 'description' => 'MBKM dan konversi', 'items' => [
                ['label' => 'Kelas Kuliah', 'children' => [
                    ['label' => 'Daftar Kelas MBKM', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Daftar Kelas MBKM')],
                    ['label' => 'Tambah Kelas MBKM', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Tambah Kelas MBKM')],
                    ['label' => 'Dosen Pengajar', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Dosen Pengajar')],
                    ['label' => 'Jadwal dan Presensi', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Jadwal dan Presensi')],
                    ['label' => 'Peserta dan Nilai', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Peserta dan Nilai')],
                    ['label' => 'Mapping Kelas Reguler', 'href' => $planned('Kampus Merdeka > Kelas Kuliah > Mapping Kelas Reguler')],
                ]],
                ['label' => 'Mahasiswa', 'children' => [
                    ['label' => 'Data Mahasiswa Eksternal', 'href' => $planned('Kampus Merdeka > Mahasiswa > Data Mahasiswa Eksternal')],
                    ['label' => 'Detail Mahasiswa MBKM', 'href' => $planned('Kampus Merdeka > Mahasiswa > Detail Mahasiswa MBKM')],
                    ['label' => 'Peserta Kelas Eksternal', 'href' => $planned('Kampus Merdeka > Mahasiswa > Peserta Kelas Eksternal')],
                ]],
                ['label' => 'Aktivitas MBKM', 'children' => [
                    ['label' => 'Kegiatan MBKM', 'href' => $planned('Kampus Merdeka > Aktivitas MBKM > Kegiatan MBKM')],
                    ['label' => 'Peserta', 'href' => $planned('Kampus Merdeka > Aktivitas MBKM > Peserta')],
                    ['label' => 'Pembimbing', 'href' => $planned('Kampus Merdeka > Aktivitas MBKM > Pembimbing')],
                ]],
                ['label' => 'Konversi Nilai', 'children' => [
                    ['label' => 'Nilai Konversi MBKM', 'href' => $planned('Kampus Merdeka > Konversi Nilai > Nilai Konversi MBKM')],
                    ['label' => 'Tampil di Transkrip', 'href' => $planned('Kampus Merdeka > Konversi Nilai > Tampil di Transkrip')],
                    ['label' => 'SKPI', 'href' => $planned('Kampus Merdeka > Konversi Nilai > SKPI')],
                ]],
            ],
        ],
        [
            'label' => 'Data Pelengkap', 'description' => 'Master dan referensi', 'items' => [
                ['label' => 'Perguruan Tinggi', 'active' => request()->routeIs('master.faculties'), 'children' => [
                    ['label' => 'Data Perguruan Tinggi', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Data Perguruan Tinggi')],
                    ['label' => 'Fakultas', 'href' => route('master.faculties'), 'active' => request()->routeIs('master.faculties')],
                    ['label' => 'Program Studi', 'href' => route('master.faculties')],
                    ['label' => 'Detail Program Studi', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Detail Program Studi')],
                    ['label' => 'Konsentrasi', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Konsentrasi')],
                    ['label' => 'Kegiatan Akademik', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Kegiatan Akademik')],
                    ['label' => 'Kalender Akademik', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Kalender Akademik')],
                    ['label' => 'Data Unit/Jabatan Struktural', 'href' => $planned('Data Pelengkap > Perguruan Tinggi > Data Unit/Jabatan Struktural')],
                ]],
                ['label' => 'Mahasiswa', 'children' => [
                    ['label' => 'Status Mahasiswa', 'href' => $planned('Data Pelengkap > Mahasiswa > Status Mahasiswa')],
                    ['label' => 'Diajukan Mahasiswa', 'href' => $planned('Data Pelengkap > Mahasiswa > Diajukan Mahasiswa')],
                ]],
                ['label' => 'Perkuliahan', 'children' => [
                    ['label' => 'Grup MK Wajib Pilihan', 'href' => $planned('Data Pelengkap > Perkuliahan > Grup MK Wajib Pilihan')],
                    ['label' => 'Unsur Nilai', 'href' => $planned('Data Pelengkap > Perkuliahan > Unsur Nilai')],
                    ['label' => 'Kelompok Unsur Nilai', 'href' => $planned('Data Pelengkap > Perkuliahan > Kelompok Unsur Nilai')],
                ]],
                ['label' => 'Pegawai', 'children' => [
                    ['label' => 'Jenis Honor', 'href' => $planned('Data Pelengkap > Pegawai > Jenis Honor')],
                    ['label' => 'Tarif Honor', 'href' => $planned('Data Pelengkap > Pegawai > Tarif Honor')],
                ]],
                ['label' => 'Template Laporan', 'children' => [
                    ['label' => 'Surat Keterangan Aktif', 'href' => $planned('Data Pelengkap > Template Laporan > Surat Keterangan Aktif')],
                    ['label' => 'Header', 'href' => $planned('Data Pelengkap > Template Laporan > Header')],
                    ['label' => 'Kalimat Pembuka', 'href' => $planned('Data Pelengkap > Template Laporan > Kalimat Pembuka')],
                    ['label' => 'Kalimat Penutup', 'href' => $planned('Data Pelengkap > Template Laporan > Kalimat Penutup')],
                ]],
            ],
        ],
        [
            'label' => 'Laporan', 'description' => 'Cetak dan export', 'items' => [
                ['label' => 'Administrasi', 'children' => [
                    ['label' => 'Kalender Akademik', 'href' => $planned('Laporan > Administrasi > Kalender Akademik')],
                    ['label' => 'Status Semester Mahasiswa', 'href' => $planned('Laporan > Administrasi > Status Semester Mahasiswa')],
                    ['label' => 'Daftar Mahasiswa', 'href' => $planned('Laporan > Administrasi > Daftar Mahasiswa')],
                ]],
                ['label' => 'Mahasiswa', 'children' => [
                    ['label' => 'KTM Per Mahasiswa', 'href' => $planned('Laporan > Mahasiswa > KTM Per Mahasiswa')],
                    ['label' => 'KRS', 'href' => $planned('Laporan > Mahasiswa > KRS')],
                    ['label' => 'KHS', 'href' => $planned('Laporan > Mahasiswa > KHS')],
                    ['label' => 'Transkrip', 'href' => $planned('Laporan > Mahasiswa > Transkrip')],
                    ['label' => 'Transkrip Sementara', 'href' => $planned('Laporan > Mahasiswa > Transkrip Sementara')],
                    ['label' => 'Kartu UTS/UAS', 'href' => $planned('Laporan > Mahasiswa > Kartu UTS/UAS')],
                ]],
                ['label' => 'Nilai', 'children' => [['label' => 'Distribusi Nilai', 'href' => $planned('Laporan > Nilai > Distribusi Nilai')]]],
                ['label' => 'Dosen', 'children' => [['label' => 'Honorarium Dosen', 'href' => $planned('Laporan > Dosen > Honorarium Dosen')]]],
                ['label' => 'Laporan EMIS', 'children' => [
                    ['label' => 'Laporan EMIS Mahasiswa', 'href' => $planned('Laporan > Laporan EMIS > Laporan EMIS Mahasiswa')],
                    ['label' => 'Laporan EMIS Dosen', 'href' => $planned('Laporan > Laporan EMIS > Laporan EMIS Dosen')],
                ]],
                ['label' => 'Keuangan', 'children' => [
                    ['label' => 'Tagihan Mahasiswa', 'href' => $planned('Laporan > Keuangan > Tagihan Mahasiswa')],
                    ['label' => 'Pembayaran Mahasiswa', 'href' => $planned('Laporan > Keuangan > Pembayaran Mahasiswa')],
                ]],
                ['label' => 'PMB', 'children' => [
                    ['label' => 'Pendaftar', 'href' => $planned('Laporan > PMB > Pendaftar')],
                    ['label' => 'Kelulusan', 'href' => $planned('Laporan > PMB > Kelulusan')],
                ]],
                ['label' => 'Yudisium', 'children' => [['label' => 'Daftar Yudisium', 'href' => $planned('Laporan > Yudisium > Daftar Yudisium')]]],
                ['label' => 'Wisuda', 'children' => [['label' => 'Daftar Wisuda', 'href' => $planned('Laporan > Wisuda > Daftar Wisuda')]]],
                ['label' => 'SKPI', 'children' => [['label' => 'SKPI Mahasiswa', 'href' => $planned('Laporan > SKPI > SKPI Mahasiswa')]]],
                ['label' => 'Export', 'children' => [
                    ['label' => 'PDF', 'href' => $planned('Laporan > Export > PDF')],
                    ['label' => 'Excel', 'href' => $planned('Laporan > Export > Excel')],
                ]],
            ],
        ],
        [
            'label' => 'Setting', 'description' => 'Konfigurasi sistem', 'items' => [
                ['label' => 'Hak Akses User', 'active' => request()->routeIs('access.index'), 'children' => [
                    ['label' => 'Role & Permission', 'href' => route('access.index', ['tab' => 'role-permissions']), 'active' => request()->routeIs('access.index') && request('tab') === 'role-permissions'],
                    ['label' => 'Register User', 'href' => route('access.index', ['tab' => 'register-user']), 'active' => request()->routeIs('access.index') && (!request('tab') || request('tab') === 'register-user')],
                    ['label' => 'Assign Role User', 'href' => route('access.index', ['tab' => 'user-roles'])],
                    ['label' => 'Audit Log', 'href' => route('access.index', ['tab' => 'audit-logs'])],
                ]],
                ['label' => 'Periode Akademik', 'children' => [
                    ['label' => 'Daftar Periode Akademik', 'href' => $planned('Setting > Periode Akademik > Daftar Periode Akademik')],
                    ['label' => 'Tambah Periode Akademik', 'href' => $planned('Setting > Periode Akademik > Tambah Periode Akademik')],
                    ['label' => 'Detail Periode Akademik', 'href' => $planned('Setting > Periode Akademik > Detail Periode Akademik')],
                    ['label' => 'Status Aktif', 'href' => $planned('Setting > Periode Akademik > Status Aktif')],
                    ['label' => 'Tanggal Awal Kuliah', 'href' => $planned('Setting > Periode Akademik > Tanggal Awal Kuliah')],
                    ['label' => 'Tanggal Akhir Kuliah', 'href' => $planned('Setting > Periode Akademik > Tanggal Akhir Kuliah')],
                    ['label' => 'Jumlah Pertemuan', 'href' => $planned('Setting > Periode Akademik > Jumlah Pertemuan')],
                    ['label' => 'Kuesioner Layanan', 'href' => $planned('Setting > Periode Akademik > Kuesioner Layanan')],
                ]],
                ['label' => 'Setting Prodi', 'children' => [
                    ['label' => 'Daftar Setting Prodi', 'href' => $planned('Setting > Setting Prodi > Daftar Setting Prodi')],
                    ['label' => 'Kurikulum Mahasiswa Baru', 'href' => $planned('Setting > Setting Prodi > Kurikulum Mahasiswa Baru')],
                    ['label' => 'Biodata', 'href' => $planned('Setting > Setting Prodi > Biodata')],
                    ['label' => 'KRS', 'href' => $planned('Setting > Setting Prodi > KRS')],
                    ['label' => 'Validasi KRS', 'href' => $planned('Setting > Setting Prodi > Validasi KRS')],
                    ['label' => 'Cetak KRS', 'href' => $planned('Setting > Setting Prodi > Cetak KRS')],
                    ['label' => 'KHS', 'href' => $planned('Setting > Setting Prodi > KHS')],
                    ['label' => 'Pengisian Nilai', 'href' => $planned('Setting > Setting Prodi > Pengisian Nilai')],
                    ['label' => 'Pengisian Kuesioner', 'href' => $planned('Setting > Setting Prodi > Pengisian Kuesioner')],
                    ['label' => 'Dosen Generate Pertemuan', 'href' => $planned('Setting > Setting Prodi > Dosen Generate Pertemuan')],
                ]],
                ['label' => 'Detail Setting Prodi', 'children' => [
                    ['label' => 'KRS & Validasi', 'href' => $planned('Setting > Detail Setting Prodi > KRS & Validasi')],
                    ['label' => 'Tanggal Awal KRS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Awal KRS')],
                    ['label' => 'Tanggal Akhir KRS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Akhir KRS')],
                    ['label' => 'Tanggal Cetak KRS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Cetak KRS')],
                    ['label' => 'Tanggal Awal Validasi KRS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Awal Validasi KRS')],
                    ['label' => 'Tanggal Akhir Validasi KRS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Akhir Validasi KRS')],
                    ['label' => 'KHS & Nilai', 'href' => $planned('Setting > Detail Setting Prodi > KHS & Nilai')],
                    ['label' => 'Tanggal Awal KHS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Awal KHS')],
                    ['label' => 'Tanggal Akhir KHS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Akhir KHS')],
                    ['label' => 'Tanggal Cetak KHS', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Cetak KHS')],
                    ['label' => 'Tanggal Awal Pengisian Nilai', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Awal Pengisian Nilai')],
                    ['label' => 'Tanggal Akhir Pengisian Nilai', 'href' => $planned('Setting > Detail Setting Prodi > Tanggal Akhir Pengisian Nilai')],
                    ['label' => 'Ujian', 'href' => $planned('Setting > Detail Setting Prodi > Ujian')],
                    ['label' => 'Buka Cetak Kartu UTS', 'href' => $planned('Setting > Detail Setting Prodi > Buka Cetak Kartu UTS')],
                    ['label' => 'Buka Cetak Kartu UAS', 'href' => $planned('Setting > Detail Setting Prodi > Buka Cetak Kartu UAS')],
                    ['label' => 'Lain-lain', 'href' => $planned('Setting > Detail Setting Prodi > Lain-lain')],
                    ['label' => 'Buka Pengubahan Biodata', 'href' => $planned('Setting > Detail Setting Prodi > Buka Pengubahan Biodata')],
                    ['label' => 'Buka Kuesioner', 'href' => $planned('Setting > Detail Setting Prodi > Buka Kuesioner')],
                    ['label' => 'Jumlah Pertemuan Kuliah', 'href' => $planned('Setting > Detail Setting Prodi > Jumlah Pertemuan Kuliah')],
                    ['label' => 'Minimal Presensi UTS', 'href' => $planned('Setting > Detail Setting Prodi > Minimal Presensi UTS')],
                    ['label' => 'Minimal Presensi UAS', 'href' => $planned('Setting > Detail Setting Prodi > Minimal Presensi UAS')],
                    ['label' => 'Dosen Bisa Isi Persentase Komponen', 'href' => $planned('Setting > Detail Setting Prodi > Dosen Bisa Isi Persentase Komponen')],
                    ['label' => 'Dosen Tampil di KRS', 'href' => $planned('Setting > Detail Setting Prodi > Dosen Tampil di KRS')],
                    ['label' => 'Batas Penggantian Status Kuliah & Presensi', 'href' => $planned('Setting > Detail Setting Prodi > Batas Penggantian Status Kuliah & Presensi')],
                ]],
                ['label' => 'Kuesioner Layanan', 'children' => [
                    ['label' => 'Kategori Kuesioner Layanan', 'href' => $planned('Setting > Kuesioner Layanan > Kategori Kuesioner Layanan')],
                    ['label' => 'Jenis Jawaban', 'href' => $planned('Setting > Kuesioner Layanan > Jenis Jawaban')],
                    ['label' => 'Daftar Kuesioner Layanan', 'href' => $planned('Setting > Kuesioner Layanan > Daftar Kuesioner Layanan')],
                ]],
                ['label' => 'Setting Aplikasi', 'children' => [
                    ['label' => 'Wajib Melengkapi Biodata Sebelum KRS', 'href' => $planned('Setting > Setting Aplikasi > Wajib Melengkapi Biodata Sebelum KRS')],
                    ['label' => 'Kolom Wajib Biodata', 'href' => $planned('Setting > Setting Aplikasi > Kolom Wajib Biodata')],
                    ['label' => 'Template KTM', 'href' => $planned('Setting > Setting Aplikasi > Template KTM')],
                    ['label' => 'Plugin/Addons', 'href' => $planned('Setting > Setting Aplikasi > Plugin/Addons')],
                ]],
            ],
        ],
    ];
@endphp
<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'SIAKAD' }}</title>
    <style>
        :root{--green:#42b429;--green-dark:#2f941d;--ink:#111827;--muted:#64748b;--line:#e5e7eb;--soft:#f5f5f5}
        *{box-sizing:border-box}body{margin:0;background:var(--soft);color:var(--ink);font-family:Inter,Arial,sans-serif}a{text-decoration:none;color:inherit}
        .app{min-height:100vh}.wrap{max-width:1120px;margin:0 auto;padding:12px 16px 28px}.topnav{position:relative;z-index:20;border-radius:12px;background:var(--green);padding:10px 14px;box-shadow:0 18px 35px rgba(66,180,41,.18)}
        .navrow{display:flex;align-items:center;gap:18px}.avatar{display:flex;height:58px;width:58px;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.7);border-radius:999px;background:rgba(255,255,255,.16);color:white;font-weight:900;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}
        .top-actions{display:flex;align-items:center;gap:8px}.user-pill{max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-radius:999px;background:rgba(255,255,255,.18);padding:8px 12px;color:white;font-size:12px;font-weight:900}.logout-btn{border:1px solid rgba(255,255,255,.7);border-radius:999px;background:white;padding:8px 12px;color:var(--green-dark);font-size:12px;font-weight:900;cursor:pointer}.logout-btn:hover{background:#f0fbea}
        .menus{display:flex;flex:1;flex-wrap:wrap;justify-content:center;gap:4px;margin:0;padding:0;list-style:none}.menu{position:relative}.menu-btn{display:flex;min-width:78px;flex-direction:column;align-items:center;gap:4px;border:0;border-radius:8px;background:transparent;padding:7px 8px;color:white;cursor:pointer}
        .menu:hover .menu-btn,.menu:focus-within .menu-btn{background:rgba(255,255,255,.2)}.menu-icon{display:grid;height:18px;width:18px;place-items:center;border:1px solid rgba(255,255,255,.72);border-radius:5px;font-size:10px;line-height:1}.menu-label{max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px}
        .dropdown{position:absolute;left:50%;top:100%;display:none;width:310px;transform:translateX(-50%);padding-top:8px}.menu:hover .dropdown,.menu:focus-within .dropdown{display:block}.dropdown-inner{overflow:visible;border:1px solid #f1f5f9;border-radius:12px;background:white;padding:8px;box-shadow:0 22px 60px rgba(0,0,0,.18)}
        .drop-head{margin-bottom:8px;border-radius:8px;background:#f6f6f6;padding:10px 12px}.drop-title{font-size:12px;font-weight:900}.drop-desc{margin-top:2px;color:var(--muted);font-size:11px}.drop-link{display:flex;align-items:center;justify-content:space-between;border-radius:8px;padding:8px 9px;color:#475569;font-size:12px;font-weight:700}.drop-link:hover,.drop-link.active{background:#f0fbea;color:var(--green-dark);font-weight:900}.drop-link span:last-child{color:#0d8178}
        .drop-list{display:grid;gap:1px}.drop-item{position:relative}.drop-item:hover>.submenu-panel,.drop-item:focus-within>.submenu-panel{display:block}.submenu-panel{position:absolute;left:calc(100% - 4px);top:0;z-index:60;display:none;width:292px;padding-left:10px}.submenu-inner{max-height:58vh;overflow:auto;border:1px solid #f1f5f9;border-radius:12px;background:white;padding:8px;box-shadow:0 18px 45px rgba(0,0,0,.16)}.submenu-title{margin-bottom:8px;border-radius:8px;background:#f6f6f6;padding:9px 10px;color:#151515;font-size:11px;font-weight:900}
        .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:44px}.metric{position:relative;min-height:114px;overflow:hidden;border-radius:16px;padding:24px;color:white;box-shadow:0 10px 22px rgba(0,0,0,.08)}.metric:before{content:"";position:absolute;right:-34px;top:-34px;height:112px;width:112px;transform:rotate(45deg);border-radius:24px;background:rgba(255,255,255,.1)}.metric:after{content:"";position:absolute;right:16px;bottom:-40px;height:96px;width:96px;border-radius:24px;background:rgba(0,0,0,.05)}
        .metric-content{position:relative;display:flex;align-items:center;gap:16px}.metric-icon{display:grid;height:48px;width:48px;place-items:center;border-radius:999px;background:rgba(255,255,255,.25);font-weight:900}.metric-value{display:block;font-size:30px;font-weight:900;line-height:1}.metric-label{display:block;margin-top:8px;font-size:14px}
        .hero{margin-top:24px}.page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.eyebrow{margin:0;color:var(--green);font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.page-title{margin:3px 0 0;color:#111;font-size:24px;font-weight:900}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border-radius:999px;background:white;padding:8px 14px;color:#64748b;font-size:12px;font-weight:800;box-shadow:0 1px 8px rgba(15,23,42,.05)}.chip.green{background:#e9f8e6;color:var(--green-dark)}
        .panel{overflow:hidden;border-radius:16px;background:white;box-shadow:0 12px 32px rgba(0,0,0,.07)}.panel.pad{padding:18px}.grid{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-form{grid-template-columns:340px 1fr}.muted{color:var(--muted)}.section-title{margin:0 0 12px;font-size:18px;font-weight:900}
        .table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:white}th,td{border-bottom:1px solid #edf2f7;padding:13px 14px;text-align:left;font-size:14px;vertical-align:top}th{background:#f1f5f9;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}tbody tr:hover{background:#fbfdfb}.badge{display:inline-flex;border-radius:999px;background:#dcfce7;padding:5px 10px;color:#047857;font-size:12px;font-weight:900}.badge.gray{background:#f1f5f9;color:#475569}
        label{display:block;margin-top:12px;color:#334155;font-size:13px;font-weight:800}input,select{width:100%;margin-top:6px;border:1px solid #cbd5e1;border-radius:10px;background:white;padding:11px 12px;font:inherit;outline:none}input:focus,select:focus{border-color:#42b429;box-shadow:0 0 0 4px #e9f8e6}.btn{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:10px;background:var(--green);padding:11px 15px;color:white;font-weight:900;cursor:pointer}.btn:hover{background:var(--green-dark)}
        .alert{border-radius:10px;padding:12px 14px;margin-bottom:14px;font-weight:700}.ok{border:1px solid #86efac;background:#dcfce7;color:#166534}.err{border:1px solid #fecaca;background:#fee2e2;color:#991b1b}.pager{padding:14px}
        @media(max-width:900px){.wrap{padding:10px 12px 22px}.navrow{align-items:flex-start;flex-wrap:wrap}.avatar{height:46px;width:46px}.menus{justify-content:flex-start;order:3;width:100%}.top-actions{margin-left:auto}.metrics,.grid-2,.grid-form{grid-template-columns:1fr}.page-head{align-items:flex-start;flex-direction:column}.dropdown{left:0;transform:none;width:min(310px,calc(100vw - 32px))}.submenu-panel{position:static;display:block;width:auto;padding:0 0 0 18px}.submenu-inner{max-height:none;box-shadow:none;border:0;padding:0}.submenu-title{display:none}}
    </style>
</head>
<body>
<div class="app">
    <div class="wrap">
        <nav class="topnav">
            <div class="navrow">
                <a class="avatar" href="{{ route('dashboard') }}" aria-label="Dashboard">UM</a>
                <ul class="menus">
                    @foreach($menuGroups as $groupIndex => $group)
                        <li class="menu">
                            <button class="menu-btn" type="button">
                                <span class="menu-icon">{{ substr($group['label'], 0, 1) }}</span>
                                <span class="menu-label">{{ $group['label'] }}</span>
                            </button>
                            <div class="dropdown"><div class="dropdown-inner">
                                <div class="drop-head"><div class="drop-title">{{ $group['label'] }}</div><div class="drop-desc">{{ $group['description'] ?? 'Menu sistem' }}</div></div>
                                <div class="drop-list">
                                    @foreach($group['items'] as $item)
                                        <div class="drop-item">
                                            <a class="drop-link {{ ($item['active'] ?? false) ? 'active' : '' }}" href="{{ $item['href'] ?? '#' }}">
                                                {{ $item['label'] }}
                                                @if(!empty($item['children']))<span>&gt;</span>@elseif(!empty($item['badge']))<span>{{ $item['badge'] }}</span>@endif
                                            </a>
                                            @if(!empty($item['children']))
                                                <div class="submenu-panel"><div class="submenu-inner">
                                                    <div class="submenu-title">{{ $item['label'] }}</div>
                                                    @foreach($item['children'] as $child)
                                                        <a class="drop-link {{ ($child['active'] ?? false) ? 'active' : '' }}" href="{{ $child['href'] ?? '#' }}">
                                                            {{ $child['label'] }} <span>&gt;</span>
                                                        </a>
                                                    @endforeach
                                                </div></div>
                                            @endif
                                        </div>
                                    @endforeach
                                    @if($group['label'] === 'Setting' && session('siakad_user_id'))
                                        <div class="drop-item">
                                            <form method="post" action="{{ route('logout') }}">@csrf<button class="drop-link" style="border:0;width:100%;background:transparent;cursor:pointer" type="submit">Logout <span>&gt;</span></button></form>
                                        </div>
                                    @endif
                                </div>
                            </div></div>
                        </li>
                    @endforeach
                </ul>
                @if(session('siakad_user_id'))
                    <div class="top-actions">
                        <span class="user-pill">{{ session('siakad_name') ?? 'User' }}</span>
                        <form method="post" action="{{ route('logout') }}">
                            @csrf
                            <button class="logout-btn" type="submit">Logout</button>
                        </form>
                    </div>
                @endif
            </div>
        </nav>

        <section class="metrics">
            <article class="metric" style="background:#ffa752"><div class="metric-content"><span class="metric-icon">D</span><span><span class="metric-value">{{ $stats['users'] ?? '2478' }}</span><span class="metric-label">Total Data Akademik</span></span></div></article>
            <article class="metric" style="background:#5bdd5a"><div class="metric-content"><span class="metric-icon">V</span><span><span class="metric-value">{{ $stats['students'] ?? '983' }}</span><span class="metric-label">Data Tervalidasi</span></span></div></article>
            <article class="metric" style="background:#b58ad8"><div class="metric-content"><span class="metric-icon">R</span><span><span class="metric-value">{{ $stats['lecturers'] ?? '1256' }}</span><span class="metric-label">Perlu Review</span></span></div></article>
            <article class="metric" style="background:#70a1bb"><div class="metric-content"><span class="metric-icon">L</span><span><span class="metric-value">{{ $stats['faculties'] ?? '652' }}</span><span class="metric-label">Laporan Tersedia</span></span></div></article>
        </section>

        <section class="hero">
            <div class="page-head">
                <div>
                    <p class="eyebrow">Sistem Informasi Akademik</p>
                    <h1 class="page-title">{{ $title ?? 'Dashboard' }}</h1>
                </div>
                <div class="chips">
                    <span class="chip">Universitas Contoh Nusantara</span>
                    <span class="chip green">Ganjil 2026/2027</span>
                    @if(session('siakad_role'))<span class="chip">Role: {{ session('siakad_role') }}</span>@endif
                </div>
            </div>
            @if(session('success'))<div class="alert ok">{{ session('success') }}</div>@endif
            @if($errors->any())<div class="alert err">{{ $errors->first() }}</div>@endif
            @yield('content')
        </section>
    </div>
</div>
</body>
</html>
