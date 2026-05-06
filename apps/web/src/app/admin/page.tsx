'use client';

import Link from 'next/link';
import { useEffect, useState, type FormEvent, type ReactNode } from 'react';
import { DashboardShell, type DashboardMenuGroup } from '../../components/dashboard-shell';
import { clearSession, getSecureJson, getToken, secureGet, securePost } from '../../lib/api';

type AdminSummary = { students: number; classes: number; submittedKrs: number };
type RefItem = { id: string; code: string; name: string };
type University = RefItem;
type FacultyLecturer = { id: string; nidn: string; name: string; studyProgramId: string; studyProgramCode: string; studyProgramName: string };
type Faculty = RefItem & {
  universityId: string;
  accreditation?: string | null;
  leaderName?: string | null;
  leaderPhone?: string | null;
  studentBodyTotal?: number;
  studentBodyBySemester?: Array<{ semester: number; count: number }>;
  lecturers?: FacultyLecturer[];
  studyPrograms?: Array<StudyProgram & { studentCount?: number; lecturerCount?: number }>;
};
type StudyProgram = RefItem & {
  facultyId: string;
  degreeLevelId?: string | null;
  degreeLevel?: string | null;
  faculty?: Faculty | null;
  degreeLevelRef?: RefItem | null;
};
type AcademicYear = RefItem;
type AcademicPeriod = { id: string; code: string; name: string; academicYearId: string; startDate: string; endDate: string };
type Student = { id: string; studyProgramId?: string; nim: string; name: string; status: string; currentSemester?: number };
type ParentRow = { id: string; name: string; relation: string; studentId: string };
type LecturerRow = { id: string; name: string; nidn: string; studyProgramId?: string | null; studyProgram?: StudyProgram | null };
type MasterDataBag = {
  universities: University[];
  faculties: Faculty[];
  studyPrograms: StudyProgram[];
  degreeLevels: RefItem[];
  academicYears: AcademicYear[];
  academicPeriods: AcademicPeriod[];
  studySystems: RefItem[];
  studentClasses: RefItem[];
  studentStatuses: RefItem[];
  lecturers: LecturerRow[];
  students: Student[];
  parents: ParentRow[];
};

type MasterKey =
  | 'universities'
  | 'faculties'
  | 'study-programs'
  | 'degree-levels'
  | 'academic-years'
  | 'academic-periods'
  | 'study-systems'
  | 'student-classes'
  | 'student-statuses'
  | 'lecturers'
  | 'students'
  | 'student-parents';
type MasterView = 'list' | 'input' | 'study-program-detail';
type AdminWorkspace = 'master-data' | 'curriculum-module';
type CurriculumTab = 'years' | 'courses' | 'copy-courses' | 'program-curriculum' | 'grading-scale';

export default function AdminPage() {
  const [summary, setSummary] = useState<AdminSummary>({ students: 0, classes: 0, submittedKrs: 0 });
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tab, setTab] = useState<MasterKey>('universities');
  const [masterView, setMasterView] = useState<MasterView>('list');
  const [activeWorkspace, setActiveWorkspace] = useState<AdminWorkspace>('master-data');
  const [curriculumTab, setCurriculumTab] = useState<CurriculumTab>('years');
  const [selectedStudyProgramId, setSelectedStudyProgramId] = useState('');
  const [loadingMaster, setLoadingMaster] = useState(false);

  const [universities, setUniversities] = useState<University[]>([]);
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [studyPrograms, setStudyPrograms] = useState<StudyProgram[]>([]);
  const [degreeLevels, setDegreeLevels] = useState<RefItem[]>([]);
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [academicPeriods, setAcademicPeriods] = useState<AcademicPeriod[]>([]);
  const [studySystems, setStudySystems] = useState<RefItem[]>([]);
  const [studentClasses, setStudentClasses] = useState<RefItem[]>([]);
  const [studentStatuses, setStudentStatuses] = useState<RefItem[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [parents, setParents] = useState<ParentRow[]>([]);
  const [lecturers, setLecturers] = useState<LecturerRow[]>([]);

  const [form, setForm] = useState<Record<string, string>>({});

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setReady(true);
      return;
    }
    getSecureJson<AdminSummary>('/dashboard/secure/admin', summary).then((data) => {
      setSummary(data);
      setReady(true);
    });
    void loadMasterData();
  }, []);

  const loggedIn = Boolean(getToken());
  const masterData: MasterDataBag = {
    universities,
    faculties,
    studyPrograms,
    degreeLevels,
    academicYears,
    academicPeriods,
    studySystems,
    studentClasses,
    studentStatuses,
    lecturers,
    students,
    parents
  };
  const activeMaster = MASTER_TABS.find((item) => item.key === tab) ?? MASTER_TABS[0];
  const openCurriculumTab = (targetTab: CurriculumTab) => {
    setActiveWorkspace('curriculum-module');
    setCurriculumTab(targetTab);
    setMasterView('list');
    setSelectedStudyProgramId('');
    setError('');
    setSuccess('');
  };
  const openMasterTab = (targetTab: MasterKey, view: MasterView = 'list') => {
    setActiveWorkspace('master-data');
    setTab(targetTab);
    setMasterView(view);
    setSelectedStudyProgramId('');
    setForm({});
    setError('');
    setSuccess('');
  };
  const plannedMenu = (path: string) => () => {
    setError('');
    setSuccess(`Menu ${path} sudah masuk struktur dan siap dibuat modulnya.`);
  };
  const menuGroups: DashboardMenuGroup[] = [
    {
      label: 'Beranda',
      description: 'Ringkasan sistem',
      items: [
        { label: 'Dashboard Admin', badge: 'Home' },
        { label: 'Ringkasan Akademik', badge: String(summary.students) },
        { label: 'Aktivitas Terbaru', badge: 'Audit' }
      ]
    },
    {
      label: 'Portal',
      description: 'Pusat data pengguna',
      items: [
        {
          label: 'Mahasiswa',
          active: activeWorkspace === 'master-data' && tab === 'students',
          children: [
            { label: 'Daftar Mahasiswa', active: activeWorkspace === 'master-data' && tab === 'students', onClick: () => openMasterTab('students') },
            { label: 'Detail Mahasiswa', onClick: plannedMenu('Portal > Mahasiswa > Detail Mahasiswa') },
            { label: 'Biodata', onClick: plannedMenu('Portal > Mahasiswa > Biodata') },
            { label: 'Status Semester', onClick: plannedMenu('Portal > Mahasiswa > Status Semester') },
            { label: 'KRS', onClick: plannedMenu('Portal > Mahasiswa > KRS') },
            { label: 'KHS', onClick: plannedMenu('Portal > Mahasiswa > KHS') },
            { label: 'Transkrip', onClick: plannedMenu('Portal > Mahasiswa > Transkrip') },
            { label: 'Riwayat Keuangan', onClick: plannedMenu('Portal > Mahasiswa > Riwayat Keuangan') },
            { label: 'Konsentrasi/Peminatan', onClick: plannedMenu('Portal > Mahasiswa > Konsentrasi/Peminatan') },
            { label: 'Pindah/Transfer Prodi', onClick: plannedMenu('Portal > Mahasiswa > Pindah/Transfer Prodi') },
            { label: 'Nilai Konversi', onClick: plannedMenu('Portal > Mahasiswa > Nilai Konversi') },
            { label: 'Aktivitas & Prestasi', onClick: plannedMenu('Portal > Mahasiswa > Aktivitas & Prestasi') },
            { label: 'Salin Mahasiswa', onClick: plannedMenu('Portal > Mahasiswa > Salin Mahasiswa') }
          ]
        },
        {
          label: 'Pegawai',
          active: activeWorkspace === 'master-data' && tab === 'lecturers',
          children: [
            { label: 'Daftar Pegawai/Dosen', active: activeWorkspace === 'master-data' && tab === 'lecturers', onClick: () => openMasterTab('lecturers') },
            { label: 'Detail Pegawai', onClick: plannedMenu('Portal > Pegawai > Detail Pegawai') },
            { label: 'Pembimbing', onClick: plannedMenu('Portal > Pegawai > Pembimbing') },
            { label: 'Tanda Tangan/NIDN/NIDK/NUPN', onClick: plannedMenu('Portal > Pegawai > Tanda Tangan/NIDN/NIDK/NUPN') }
          ]
        },
        {
          label: 'Kegiatan',
          children: [
            { label: 'Kalender Akademik', onClick: plannedMenu('Portal > Kegiatan > Kalender Akademik') },
            { label: 'Monitoring Kalender Akademik', onClick: plannedMenu('Portal > Kegiatan > Monitoring Kalender Akademik') }
          ]
        },
        {
          label: 'Orang Tua',
          children: [
            { label: 'Monitoring Mahasiswa', onClick: plannedMenu('Portal > Orang Tua > Monitoring Mahasiswa') }
          ]
        },
        {
          label: 'Alumni',
          children: [
            { label: 'Profil Alumni', onClick: plannedMenu('Portal > Alumni > Profil Alumni') }
          ]
        }
      ]
    },
    {
      label: 'Perkuliahan',
      description: 'Proses akademik',
      items: [
        {
          label: 'Data Kurikulum',
          active: activeWorkspace === 'curriculum-module',
          children: [
            { label: 'Tahun Kurikulum', active: activeWorkspace === 'curriculum-module' && curriculumTab === 'years', onClick: () => openCurriculumTab('years') },
            { label: 'Mata Kuliah', active: activeWorkspace === 'curriculum-module' && curriculumTab === 'courses', onClick: () => openCurriculumTab('courses') },
            { label: 'Kurikulum Prodi', active: activeWorkspace === 'curriculum-module' && curriculumTab === 'program-curriculum', onClick: () => openCurriculumTab('program-curriculum') },
            { label: 'Skala Nilai', active: activeWorkspace === 'curriculum-module' && curriculumTab === 'grading-scale', onClick: () => openCurriculumTab('grading-scale') },
            { label: 'Komposisi Nilai', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Komposisi Nilai') },
            { label: 'Predikat Kelulusan', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Predikat Kelulusan') },
            { label: 'Aturan Evaluasi', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Aturan Evaluasi') },
            { label: 'Ekivalensi Mata Kuliah', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Ekivalensi Mata Kuliah') },
            { label: 'Kurikulum Konsentrasi', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Kurikulum Konsentrasi') },
            { label: 'Prasyarat Mata Kuliah', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Prasyarat Mata Kuliah') },
            { label: 'Set Grup MK Wajib Pilihan', onClick: plannedMenu('Perkuliahan > Data Kurikulum > Set Grup MK Wajib Pilihan') }
          ]
        },
        {
          label: 'Data Kelas',
          children: [
            { label: 'Tahun Ajaran', active: activeWorkspace === 'master-data' && tab === 'academic-years', onClick: () => openMasterTab('academic-years') },
            { label: 'Kelas Kuliah', onClick: plannedMenu('Perkuliahan > Data Kelas > Kelas Kuliah') },
            { label: 'Detail Kelas Kuliah', onClick: plannedMenu('Perkuliahan > Data Kelas > Detail Kelas Kuliah') },
            { label: 'Dosen Pengajar', onClick: plannedMenu('Perkuliahan > Data Kelas > Dosen Pengajar') },
            { label: 'Jadwal Perkuliahan', onClick: plannedMenu('Perkuliahan > Data Kelas > Jadwal Perkuliahan') },
            { label: 'Peserta Kelas', onClick: plannedMenu('Perkuliahan > Data Kelas > Peserta Kelas') },
            { label: 'Presensi Kelas', onClick: plannedMenu('Perkuliahan > Data Kelas > Presensi Kelas') },
            { label: 'Nilai Perkuliahan', onClick: plannedMenu('Perkuliahan > Data Kelas > Nilai Perkuliahan') },
            { label: 'Jadwal & Presensi', onClick: plannedMenu('Perkuliahan > Data Kelas > Jadwal & Presensi') },
            { label: 'Pemutihan Nilai', onClick: plannedMenu('Perkuliahan > Data Kelas > Pemutihan Nilai') }
          ]
        },
        {
          label: 'Administrasi',
          children: [
            { label: 'Status Semester', onClick: plannedMenu('Perkuliahan > Administrasi > Status Semester') },
            { label: 'Pembimbing Akademik', onClick: plannedMenu('Perkuliahan > Administrasi > Pembimbing Akademik') },
            { label: 'Transfer Mahasiswa', onClick: plannedMenu('Perkuliahan > Administrasi > Transfer Mahasiswa') },
            { label: 'Evaluasi Mahasiswa', onClick: plannedMenu('Perkuliahan > Administrasi > Evaluasi Mahasiswa') },
            { label: 'Konversi Nilai', onClick: plannedMenu('Perkuliahan > Administrasi > Konversi Nilai') },
            { label: 'Paket Kuliah', onClick: plannedMenu('Perkuliahan > Administrasi > Paket Kuliah') },
            { label: 'Sunting KRS', onClick: plannedMenu('Perkuliahan > Administrasi > Sunting KRS') }
          ]
        },
        {
          label: 'Proposal Tugas Akhir',
          children: [
            { label: 'Tahap Proposal', onClick: plannedMenu('Perkuliahan > Proposal Tugas Akhir > Tahap Proposal') },
            { label: 'Syarat Ujian', onClick: plannedMenu('Perkuliahan > Proposal Tugas Akhir > Syarat Ujian') },
            { label: 'Unsur Nilai', onClick: plannedMenu('Perkuliahan > Proposal Tugas Akhir > Unsur Nilai') },
            { label: 'Daftar Proposal', onClick: plannedMenu('Perkuliahan > Proposal Tugas Akhir > Daftar Proposal') },
            { label: 'Detail Proposal', onClick: plannedMenu('Perkuliahan > Proposal Tugas Akhir > Detail Proposal') }
          ]
        },
        {
          label: 'Kegiatan Pendukung',
          children: [
            { label: 'Daftar Kegiatan', onClick: plannedMenu('Perkuliahan > Kegiatan Pendukung > Daftar Kegiatan') },
            { label: 'Peserta', onClick: plannedMenu('Perkuliahan > Kegiatan Pendukung > Peserta') },
            { label: 'Pembimbing', onClick: plannedMenu('Perkuliahan > Kegiatan Pendukung > Pembimbing') },
            { label: 'Rincian Kegiatan', onClick: plannedMenu('Perkuliahan > Kegiatan Pendukung > Rincian Kegiatan') },
            { label: 'Nilai/Konversi', onClick: plannedMenu('Perkuliahan > Kegiatan Pendukung > Nilai/Konversi') }
          ]
        },
        {
          label: 'Kuesioner',
          children: [
            { label: 'Daftar Pertanyaan', onClick: plannedMenu('Perkuliahan > Kuesioner > Daftar Pertanyaan') },
            { label: 'Daftar Jawaban', onClick: plannedMenu('Perkuliahan > Kuesioner > Daftar Jawaban') }
          ]
        },
        {
          label: 'Berhenti Studi',
          children: [
            { label: 'Pengajuan Cuti', onClick: plannedMenu('Perkuliahan > Berhenti Studi > Pengajuan Cuti') }
          ]
        },
        {
          label: 'Data Yudisium',
          children: [
            { label: 'Periode Yudisium', onClick: plannedMenu('Perkuliahan > Data Yudisium > Periode Yudisium') },
            { label: 'Syarat Yudisium', onClick: plannedMenu('Perkuliahan > Data Yudisium > Syarat Yudisium') },
            { label: 'Eligible Yudisium', onClick: plannedMenu('Perkuliahan > Data Yudisium > Eligible Yudisium') },
            { label: 'Tambah Peserta', onClick: plannedMenu('Perkuliahan > Data Yudisium > Tambah Peserta') },
            { label: 'Daftar Yudisium', onClick: plannedMenu('Perkuliahan > Data Yudisium > Daftar Yudisium') },
            { label: 'Penomoran Dokumen', onClick: plannedMenu('Perkuliahan > Data Yudisium > Penomoran Dokumen') }
          ]
        },
        {
          label: 'Data Wisuda',
          children: [
            { label: 'Periode Wisuda', onClick: plannedMenu('Perkuliahan > Data Wisuda > Periode Wisuda') },
            { label: 'Peserta Wisuda', onClick: plannedMenu('Perkuliahan > Data Wisuda > Peserta Wisuda') }
          ]
        }
      ]
    },
    {
      label: 'Kemahasiswaan',
      description: 'Layanan studi mahasiswa',
      items: [
        {
          label: 'Aktivitas',
          children: [
            { label: 'Kelompok Aktivitas', onClick: plannedMenu('Kemahasiswaan > Aktivitas > Kelompok Aktivitas') },
            { label: 'Peringkat Aktivitas', onClick: plannedMenu('Kemahasiswaan > Aktivitas > Peringkat Aktivitas') },
            { label: 'Aktivitas dan Prestasi', onClick: plannedMenu('Kemahasiswaan > Aktivitas > Aktivitas dan Prestasi') },
            { label: 'Validasi Aktivitas', onClick: plannedMenu('Kemahasiswaan > Aktivitas > Validasi Aktivitas') },
            { label: 'Tampil di SKPI', onClick: plannedMenu('Kemahasiswaan > Aktivitas > Tampil di SKPI') }
          ]
        },
        {
          label: 'SKPI',
          children: [
            { label: 'SKPI Mahasiswa', onClick: plannedMenu('Kemahasiswaan > SKPI > SKPI Mahasiswa') },
            { label: 'Informasi Tambahan', onClick: plannedMenu('Kemahasiswaan > SKPI > Informasi Tambahan') }
          ]
        },
        {
          label: 'Prestasi',
          children: [
            { label: 'Daftar Prestasi', onClick: plannedMenu('Kemahasiswaan > Prestasi > Daftar Prestasi') },
            { label: 'Validasi Prestasi', onClick: plannedMenu('Kemahasiswaan > Prestasi > Validasi Prestasi') }
          ]
        }
      ]
    },
    {
      label: 'Kampus Merdeka',
      description: 'MBKM dan konversi',
      items: [
        {
          label: 'Kelas Kuliah',
          children: [
            { label: 'Daftar Kelas MBKM', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Daftar Kelas MBKM') },
            { label: 'Tambah Kelas MBKM', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Tambah Kelas MBKM') },
            { label: 'Dosen Pengajar', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Dosen Pengajar') },
            { label: 'Jadwal dan Presensi', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Jadwal dan Presensi') },
            { label: 'Peserta dan Nilai', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Peserta dan Nilai') },
            { label: 'Mapping Kelas Reguler', onClick: plannedMenu('Kampus Merdeka > Kelas Kuliah > Mapping Kelas Reguler') }
          ]
        },
        {
          label: 'Mahasiswa',
          children: [
            { label: 'Data Mahasiswa Eksternal', onClick: plannedMenu('Kampus Merdeka > Mahasiswa > Data Mahasiswa Eksternal') },
            { label: 'Detail Mahasiswa MBKM', onClick: plannedMenu('Kampus Merdeka > Mahasiswa > Detail Mahasiswa MBKM') },
            { label: 'Peserta Kelas Eksternal', onClick: plannedMenu('Kampus Merdeka > Mahasiswa > Peserta Kelas Eksternal') }
          ]
        },
        {
          label: 'Aktivitas MBKM',
          children: [
            { label: 'Kegiatan MBKM', onClick: plannedMenu('Kampus Merdeka > Aktivitas MBKM > Kegiatan MBKM') },
            { label: 'Peserta', onClick: plannedMenu('Kampus Merdeka > Aktivitas MBKM > Peserta') },
            { label: 'Pembimbing', onClick: plannedMenu('Kampus Merdeka > Aktivitas MBKM > Pembimbing') }
          ]
        },
        {
          label: 'Konversi Nilai',
          children: [
            { label: 'Nilai Konversi MBKM', onClick: plannedMenu('Kampus Merdeka > Konversi Nilai > Nilai Konversi MBKM') },
            { label: 'Tampil di Transkrip', onClick: plannedMenu('Kampus Merdeka > Konversi Nilai > Tampil di Transkrip') },
            { label: 'SKPI', onClick: plannedMenu('Kampus Merdeka > Konversi Nilai > SKPI') }
          ]
        }
      ]
    },
    {
      label: 'Data Pelengkap',
      description: 'Master dan referensi',
      items: [
        {
          label: 'Perguruan Tinggi',
          active: activeWorkspace === 'master-data' && ['universities', 'faculties', 'study-programs'].includes(tab),
          children: [
            { label: 'Data Perguruan Tinggi', active: activeWorkspace === 'master-data' && tab === 'universities', onClick: () => openMasterTab('universities') },
            { label: 'Fakultas', active: activeWorkspace === 'master-data' && tab === 'faculties', onClick: () => openMasterTab('faculties') },
            { label: 'Program Studi', active: activeWorkspace === 'master-data' && tab === 'study-programs' && masterView === 'list', onClick: () => openMasterTab('study-programs') },
            { label: 'Detail Program Studi', active: activeWorkspace === 'master-data' && tab === 'study-programs' && masterView === 'study-program-detail', onClick: () => openMasterTab('study-programs', 'study-program-detail') },
            { label: 'Konsentrasi', onClick: plannedMenu('Data Pelengkap > Perguruan Tinggi > Konsentrasi') },
            { label: 'Kegiatan Akademik', onClick: plannedMenu('Data Pelengkap > Perguruan Tinggi > Kegiatan Akademik') },
            { label: 'Kalender Akademik', onClick: plannedMenu('Data Pelengkap > Perguruan Tinggi > Kalender Akademik') },
            { label: 'Data Unit/Jabatan Struktural', onClick: plannedMenu('Data Pelengkap > Perguruan Tinggi > Data Unit/Jabatan Struktural') }
          ]
        },
        {
          label: 'Mahasiswa',
          active: activeWorkspace === 'master-data' && tab === 'student-statuses',
          children: [
            { label: 'Status Mahasiswa', active: activeWorkspace === 'master-data' && tab === 'student-statuses', onClick: () => openMasterTab('student-statuses') },
            { label: 'Diajukan Mahasiswa', onClick: plannedMenu('Data Pelengkap > Mahasiswa > Diajukan Mahasiswa') }
          ]
        },
        {
          label: 'Perkuliahan',
          children: [
            { label: 'Grup MK Wajib Pilihan', onClick: plannedMenu('Data Pelengkap > Perkuliahan > Grup MK Wajib Pilihan') },
            { label: 'Unsur Nilai', onClick: plannedMenu('Data Pelengkap > Perkuliahan > Unsur Nilai') },
            { label: 'Kelompok Unsur Nilai', onClick: plannedMenu('Data Pelengkap > Perkuliahan > Kelompok Unsur Nilai') }
          ]
        },
        {
          label: 'Pegawai',
          children: [
            { label: 'Jenis Honor', onClick: plannedMenu('Data Pelengkap > Pegawai > Jenis Honor') },
            { label: 'Tarif Honor', onClick: plannedMenu('Data Pelengkap > Pegawai > Tarif Honor') }
          ]
        },
        {
          label: 'Template Laporan',
          children: [
            { label: 'Surat Keterangan Aktif', onClick: plannedMenu('Data Pelengkap > Template Laporan > Surat Keterangan Aktif') },
            { label: 'Header', onClick: plannedMenu('Data Pelengkap > Template Laporan > Header') },
            { label: 'Kalimat Pembuka', onClick: plannedMenu('Data Pelengkap > Template Laporan > Kalimat Pembuka') },
            { label: 'Kalimat Penutup', onClick: plannedMenu('Data Pelengkap > Template Laporan > Kalimat Penutup') }
          ]
        }
      ]
    },
    {
      label: 'Laporan',
      description: 'Cetak dan export',
      items: [
        {
          label: 'Administrasi',
          children: [
            { label: 'Kalender Akademik', onClick: plannedMenu('Laporan > Administrasi > Kalender Akademik') },
            { label: 'Status Semester Mahasiswa', onClick: plannedMenu('Laporan > Administrasi > Status Semester Mahasiswa') },
            { label: 'Daftar Mahasiswa', onClick: plannedMenu('Laporan > Administrasi > Daftar Mahasiswa') }
          ]
        },
        {
          label: 'Mahasiswa',
          children: [
            { label: 'KTM Per Mahasiswa', onClick: plannedMenu('Laporan > Mahasiswa > KTM Per Mahasiswa') },
            { label: 'KRS', onClick: plannedMenu('Laporan > Mahasiswa > KRS') },
            { label: 'KHS', onClick: plannedMenu('Laporan > Mahasiswa > KHS') },
            { label: 'Transkrip', onClick: plannedMenu('Laporan > Mahasiswa > Transkrip') },
            { label: 'Transkrip Sementara', onClick: plannedMenu('Laporan > Mahasiswa > Transkrip Sementara') },
            { label: 'Kartu UTS/UAS', onClick: plannedMenu('Laporan > Mahasiswa > Kartu UTS/UAS') }
          ]
        },
        { label: 'Nilai', children: [{ label: 'Distribusi Nilai', onClick: plannedMenu('Laporan > Nilai > Distribusi Nilai') }] },
        { label: 'Dosen', children: [{ label: 'Honorarium Dosen', onClick: plannedMenu('Laporan > Dosen > Honorarium Dosen') }] },
        {
          label: 'Laporan EMIS',
          children: [
            { label: 'Laporan EMIS Mahasiswa', onClick: plannedMenu('Laporan > Laporan EMIS > Laporan EMIS Mahasiswa') },
            { label: 'Laporan EMIS Dosen', onClick: plannedMenu('Laporan > Laporan EMIS > Laporan EMIS Dosen') }
          ]
        },
        {
          label: 'Keuangan',
          children: [
            { label: 'Tagihan Mahasiswa', onClick: plannedMenu('Laporan > Keuangan > Tagihan Mahasiswa') },
            { label: 'Pembayaran Mahasiswa', onClick: plannedMenu('Laporan > Keuangan > Pembayaran Mahasiswa') }
          ]
        },
        {
          label: 'PMB',
          children: [
            { label: 'Pendaftar', onClick: plannedMenu('Laporan > PMB > Pendaftar') },
            { label: 'Kelulusan', onClick: plannedMenu('Laporan > PMB > Kelulusan') }
          ]
        },
        { label: 'Yudisium', children: [{ label: 'Daftar Yudisium', onClick: plannedMenu('Laporan > Yudisium > Daftar Yudisium') }] },
        { label: 'Wisuda', children: [{ label: 'Daftar Wisuda', onClick: plannedMenu('Laporan > Wisuda > Daftar Wisuda') }] },
        { label: 'SKPI', children: [{ label: 'SKPI Mahasiswa', onClick: plannedMenu('Laporan > SKPI > SKPI Mahasiswa') }] },
        {
          label: 'Export',
          children: [
            { label: 'PDF', onClick: plannedMenu('Laporan > Export > PDF') },
            { label: 'Excel', onClick: plannedMenu('Laporan > Export > Excel') }
          ]
        }
      ]
    },
    {
      label: 'Setting',
      description: 'Konfigurasi sistem',
      items: [
        {
          label: 'Periode Akademik',
          active: activeWorkspace === 'master-data' && tab === 'academic-periods',
          children: [
            { label: 'Daftar Periode Akademik', active: activeWorkspace === 'master-data' && tab === 'academic-periods', onClick: () => openMasterTab('academic-periods') },
            { label: 'Tambah Periode Akademik', onClick: () => openMasterTab('academic-periods', 'input') },
            { label: 'Detail Periode Akademik', onClick: plannedMenu('Setting > Periode Akademik > Detail Periode Akademik') },
            { label: 'Status Aktif', onClick: plannedMenu('Setting > Periode Akademik > Status Aktif') },
            { label: 'Tanggal Awal Kuliah', onClick: plannedMenu('Setting > Periode Akademik > Tanggal Awal Kuliah') },
            { label: 'Tanggal Akhir Kuliah', onClick: plannedMenu('Setting > Periode Akademik > Tanggal Akhir Kuliah') },
            { label: 'Jumlah Pertemuan', onClick: plannedMenu('Setting > Periode Akademik > Jumlah Pertemuan') },
            { label: 'Kuesioner Layanan', onClick: plannedMenu('Setting > Periode Akademik > Kuesioner Layanan') }
          ]
        },
        {
          label: 'Setting Prodi',
          children: [
            { label: 'Daftar Setting Prodi', onClick: plannedMenu('Setting > Setting Prodi > Daftar Setting Prodi') },
            { label: 'Kurikulum Mahasiswa Baru', onClick: plannedMenu('Setting > Setting Prodi > Kurikulum Mahasiswa Baru') },
            { label: 'Biodata', onClick: plannedMenu('Setting > Setting Prodi > Biodata') },
            { label: 'KRS', onClick: plannedMenu('Setting > Setting Prodi > KRS') },
            { label: 'Validasi KRS', onClick: plannedMenu('Setting > Setting Prodi > Validasi KRS') },
            { label: 'Cetak KRS', onClick: plannedMenu('Setting > Setting Prodi > Cetak KRS') },
            { label: 'KHS', onClick: plannedMenu('Setting > Setting Prodi > KHS') },
            { label: 'Pengisian Nilai', onClick: plannedMenu('Setting > Setting Prodi > Pengisian Nilai') },
            { label: 'Pengisian Kuesioner', onClick: plannedMenu('Setting > Setting Prodi > Pengisian Kuesioner') },
            { label: 'Dosen Generate Pertemuan', onClick: plannedMenu('Setting > Setting Prodi > Dosen Generate Pertemuan') }
          ]
        },
        {
          label: 'Detail Setting Prodi',
          children: [
            { label: 'KRS & Validasi', onClick: plannedMenu('Setting > Detail Setting Prodi > KRS & Validasi') },
            { label: 'Tanggal Awal KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal KRS') },
            { label: 'Tanggal Akhir KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir KRS') },
            { label: 'Tanggal Cetak KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Cetak KRS') },
            { label: 'Tanggal Awal Validasi KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal Validasi KRS') },
            { label: 'Tanggal Akhir Validasi KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir Validasi KRS') },
            { label: 'KHS & Nilai', onClick: plannedMenu('Setting > Detail Setting Prodi > KHS & Nilai') },
            { label: 'Tanggal Awal KHS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal KHS') },
            { label: 'Tanggal Akhir KHS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir KHS') },
            { label: 'Tanggal Cetak KHS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Cetak KHS') },
            { label: 'Tanggal Awal Pengisian Nilai', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal Pengisian Nilai') },
            { label: 'Tanggal Akhir Pengisian Nilai', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir Pengisian Nilai') },
            { label: 'Ujian', onClick: plannedMenu('Setting > Detail Setting Prodi > Ujian') },
            { label: 'Buka Cetak Kartu UTS', onClick: plannedMenu('Setting > Detail Setting Prodi > Buka Cetak Kartu UTS') },
            { label: 'Tanggal Awal Cetak UTS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal Cetak UTS') },
            { label: 'Tanggal Akhir Cetak UTS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir Cetak UTS') },
            { label: 'Buka Cetak Kartu UAS', onClick: plannedMenu('Setting > Detail Setting Prodi > Buka Cetak Kartu UAS') },
            { label: 'Tanggal Awal Cetak UAS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal Cetak UAS') },
            { label: 'Tanggal Akhir Cetak UAS', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir Cetak UAS') },
            { label: 'Lain-lain', onClick: plannedMenu('Setting > Detail Setting Prodi > Lain-lain') },
            { label: 'Buka Pengubahan Biodata', onClick: plannedMenu('Setting > Detail Setting Prodi > Buka Pengubahan Biodata') },
            { label: 'Buka Kuesioner', onClick: plannedMenu('Setting > Detail Setting Prodi > Buka Kuesioner') },
            { label: 'Tanggal Awal Kuesioner', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Awal Kuesioner') },
            { label: 'Tanggal Akhir Kuesioner', onClick: plannedMenu('Setting > Detail Setting Prodi > Tanggal Akhir Kuesioner') },
            { label: 'Jumlah Pertemuan Kuliah', onClick: plannedMenu('Setting > Detail Setting Prodi > Jumlah Pertemuan Kuliah') },
            { label: 'Minimal Presensi UTS', onClick: plannedMenu('Setting > Detail Setting Prodi > Minimal Presensi UTS') },
            { label: 'Minimal Presensi UAS', onClick: plannedMenu('Setting > Detail Setting Prodi > Minimal Presensi UAS') },
            { label: 'Dosen Bisa Isi Persentase Komponen', onClick: plannedMenu('Setting > Detail Setting Prodi > Dosen Bisa Isi Persentase Komponen') },
            { label: 'Dosen Tampil di KRS', onClick: plannedMenu('Setting > Detail Setting Prodi > Dosen Tampil di KRS') },
            { label: 'Batas Penggantian Status Kuliah & Presensi', onClick: plannedMenu('Setting > Detail Setting Prodi > Batas Penggantian Status Kuliah & Presensi') }
          ]
        },
        {
          label: 'Kuesioner Layanan',
          children: [
            { label: 'Kategori Kuesioner Layanan', onClick: plannedMenu('Setting > Kuesioner Layanan > Kategori Kuesioner Layanan') },
            { label: 'Jenis Jawaban', onClick: plannedMenu('Setting > Kuesioner Layanan > Jenis Jawaban') },
            { label: 'Daftar Kuesioner Layanan', onClick: plannedMenu('Setting > Kuesioner Layanan > Daftar Kuesioner Layanan') }
          ]
        },
        {
          label: 'Setting Aplikasi',
          children: [
            { label: 'Wajib Melengkapi Biodata Sebelum KRS', onClick: plannedMenu('Setting > Setting Aplikasi > Wajib Melengkapi Biodata Sebelum KRS') },
            { label: 'Kolom Wajib Biodata', onClick: plannedMenu('Setting > Setting Aplikasi > Kolom Wajib Biodata') },
            { label: 'Template KTM', onClick: plannedMenu('Setting > Setting Aplikasi > Template KTM') },
            { label: 'Plugin/Addons', onClick: plannedMenu('Setting > Setting Aplikasi > Plugin/Addons') }
          ]
        }
      ]
    }
  ];
  const totalMasterRecords =
    universities.length +
    faculties.length +
    studyPrograms.length +
    degreeLevels.length +
    academicYears.length +
    academicPeriods.length +
    studySystems.length +
    studentClasses.length +
    studentStatuses.length +
    lecturers.length +
    students.length +
    parents.length;

  async function loadMasterData() {
    setLoadingMaster(true);
    setError('');
    try {
      const [
        u,
        f,
        sp,
        dl,
        ay,
        ap,
        ss,
        sc,
        st,
        l,
        s,
        p
      ] = await Promise.all([
        secureGet<University[]>('/master/universities'),
        secureGet<Faculty[]>('/master/faculties'),
        secureGet<StudyProgram[]>('/master/study-programs'),
        secureGet<RefItem[]>('/master/degree-levels'),
        secureGet<AcademicYear[]>('/master/academic-years'),
        secureGet<AcademicPeriod[]>('/master/academic-periods'),
        secureGet<RefItem[]>('/master/study-systems'),
        secureGet<RefItem[]>('/master/student-classes'),
        secureGet<RefItem[]>('/master/student-statuses'),
        secureGet<LecturerRow[]>('/master/lecturers'),
        secureGet<Student[]>('/master/students'),
        secureGet<ParentRow[]>('/master/student-parents')
      ]);
      setUniversities(u);
      setFaculties(f);
      setStudyPrograms(sp);
      setDegreeLevels(dl);
      setAcademicYears(ay);
      setAcademicPeriods(ap);
      setStudySystems(ss);
      setStudentClasses(sc);
      setStudentStatuses(st);
      setLecturers(l);
      setStudents(s);
      setParents(p);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal memuat master data');
    } finally {
      setLoadingMaster(false);
    }
  }

  async function submitCreate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      if (tab === 'universities') await securePost('/master/universities', { code: form.code, name: form.name });
      if (tab === 'faculties') {
        await securePost('/master/faculties', {
          universityId: form.universityId,
          code: form.code,
          name: form.name,
          accreditation: form.accreditation || undefined,
          leaderName: form.leaderName || undefined,
          leaderPhone: form.leaderPhone || undefined
        });
      }
      if (tab === 'degree-levels') await securePost('/master/degree-levels', { code: form.code, name: form.name });
      if (tab === 'study-programs') {
        await securePost('/master/study-programs', {
          facultyId: form.facultyId,
          code: form.code,
          name: form.name,
          degreeLevelId: form.degreeLevelId || undefined,
          degreeLevel: form.degreeLevel || undefined
        });
      }
      if (tab === 'academic-years') await securePost('/master/academic-years', { code: form.code, name: form.name });
      if (tab === 'academic-periods') {
        await securePost('/master/academic-periods', {
          academicYearId: form.academicYearId,
          code: form.code,
          name: form.name,
          startDate: form.startDate,
          endDate: form.endDate
        });
      }
      if (tab === 'study-systems') await securePost('/master/study-systems', { code: form.code, name: form.name });
      if (tab === 'student-classes') await securePost('/master/student-classes', { code: form.code, name: form.name });
      if (tab === 'student-statuses') await securePost('/master/student-statuses', { code: form.code, name: form.name });
      if (tab === 'lecturers') {
        await securePost('/master/lecturers', {
          universityId: form.universityId,
          name: form.name,
          email: form.email,
          nidn: form.nidn,
          studyProgramId: form.studyProgramId || undefined
        });
      }
      if (tab === 'students') {
        await securePost('/master/students', {
          universityId: form.universityId,
          studyProgramId: form.studyProgramId,
          nim: form.nim,
          name: form.name,
          email: form.email,
          status: form.status || 'AKTIF',
          currentSemester: Number(form.currentSemester || 1),
          studentClassId: form.studentClassId || undefined,
          studentStatusId: form.studentStatusId || undefined,
          studySystemId: form.studySystemId || undefined
        });
      }
      if (tab === 'student-parents') {
        await securePost('/master/student-parents', {
          studentId: form.studentId,
          name: form.name,
          relation: form.relation,
          phone: form.phone || undefined
        });
      }
      setSuccess('Data berhasil disimpan');
      setForm({});
      await loadMasterData();
      setMasterView('list');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gagal menyimpan');
    }
  }

  return (
    <DashboardShell title="Admin Akademik" menuGroups={menuGroups}>
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">SIM Akademik Perguruan Tinggi</p>
            <h2 className="mt-1 text-2xl font-bold text-slate-900">Dashboard Admin</h2>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusPill label="Periode" value="Ganjil 2026/2027" />
            <StatusPill label="Role" value="Super Admin" />
            {loggedIn ? <button onClick={() => { clearSession(); location.href = '/login'; }} className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Logout</button> : null}
          </div>
        </div>
      </div>

      {!loggedIn ? (
        <LoginPrompt />
      ) : (
        <div className="bg-[#f6faf9] p-5">
          <div className="grid grid-cols-1 gap-3 lg:grid-cols-4">
            <Card label="Mahasiswa Aktif" value={String(summary.students)} tone="teal" />
            <Card label="Kelas Aktif" value={String(summary.classes)} tone="amber" />
            <Card label="KRS Menunggu Validasi" value={String(summary.submittedKrs)} tone="rose" />
            <Card label="Total Master Data" value={String(totalMasterRecords)} tone="slate" />
          </div>

          {activeWorkspace === 'curriculum-module' ? (
            <CurriculumModulePage activeTab={curriculumTab} onTabChange={setCurriculumTab} />
          ) : (
          <div className="mt-5 min-w-0 rounded border border-slate-200 bg-white">
            <div className="border-b border-slate-200 px-4 py-3">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">{activeMaster.flow}</p>
                  <h3 className="mt-1 text-xl font-bold text-slate-900">{activeMaster.label}</h3>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <button onClick={() => setMasterView('list')} className={`rounded border px-3 py-2 text-sm font-medium ${masterView === 'list' ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 hover:bg-slate-50'}`}>Daftar Data</button>
                  <button onClick={() => { setMasterView('input'); setError(''); setSuccess(''); }} className={`rounded border px-3 py-2 text-sm font-medium ${masterView === 'input' ? 'border-teal-700 bg-teal-700 text-white' : 'border-slate-300 hover:bg-slate-50'}`}>Input Data</button>
                  <button onClick={() => void loadMasterData()} className="rounded border border-slate-300 px-3 py-2 text-sm font-medium hover:bg-slate-50">Muat Ulang</button>
                </div>
              </div>
            </div>

            <div className="min-h-[520px] p-4">
              {masterView === 'study-program-detail' ? (
                <StudyProgramDetailPage
                  data={masterData}
                  studyProgramId={selectedStudyProgramId}
                  onBack={() => {
                    setTab('faculties');
                    setMasterView('list');
                  }}
                />
              ) : masterView === 'input' ? (
                <form className="mx-auto max-w-3xl rounded border border-slate-200 bg-slate-50 p-4" onSubmit={submitCreate}>
                  <div className="mb-4 border-b border-slate-200 pb-3">
                    <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Tambah Baru</p>
                    <h4 className="mt-1 font-semibold text-slate-900">Input {activeMaster.label}</h4>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <FormFields tab={tab} form={form} setForm={setForm} refs={{ universities, faculties, degreeLevels, academicYears, studyPrograms, studentClasses, studentStatuses, studySystems, students }} />
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <button className="rounded bg-teal-700 px-4 py-2 text-sm font-semibold text-white hover:bg-teal-800">Simpan</button>
                    <button type="button" onClick={() => setForm({})} className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Bersihkan</button>
                    <button type="button" onClick={() => setMasterView('list')} className="rounded border border-slate-300 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50">Kembali ke Daftar</button>
                  </div>
                  {error ? <p className="mt-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
                  {success ? <p className="mt-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p> : null}
                </form>
              ) : (
                <div className="min-w-0">
                  <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <h4 className="font-semibold text-slate-900">Daftar {activeMaster.label}</h4>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-slate-500">{getTabCount(tab, masterData)} baris</span>
                      <button onClick={() => { setMasterView('input'); setForm({}); }} className="rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800">Tambah Data</button>
                    </div>
                  </div>
                  {success ? <p className="mb-3 rounded border border-emerald-200 bg-emerald-50 p-2 text-sm text-emerald-700">{success}</p> : null}
                  {error ? <p className="mb-3 rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">{error}</p> : null}
                  {loadingMaster ? <p className="text-sm text-slate-500">Memuat master data...</p> : (
                    <DataTable
                      tab={tab}
                      data={masterData}
                      onOpenStudyProgramDetail={(id) => {
                        setSelectedStudyProgramId(id);
                        setMasterView('study-program-detail');
                      }}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
          )}
        </div>
      )}

      {!ready ? <p className="px-5 pb-5 text-sm text-slate-500">Memuat data...</p> : null}
    </DashboardShell>
  );
}

function LoginPrompt() {
  return <p className="m-5 rounded border border-amber-200 bg-amber-50 p-3 text-sm">Silakan <Link href="/login" className="underline">login</Link> untuk melihat data dashboard.</p>;
}

type CurriculumYearRow = {
  id: string;
  year: string;
  description: string;
  effectivePeriod: string;
  startDate: string;
  endDate: string;
};

type CourseRow = {
  id: string;
  curriculumYear: string;
  code: string;
  name: string;
  sks: number;
  type: string;
  studyProgram: string;
  group: string;
  minPassingGrade: string;
  isMandatory: boolean;
};

type ProgramCurriculumRow = {
  id: string;
  curriculumYear: string;
  studyProgram: string;
  courseId: string;
  semester: number;
  minGrade: string;
  isMandatory: boolean;
  isPackage: boolean;
  prerequisite: string;
};

type GradingScaleRow = {
  id: string;
  unit: string;
  letter: string;
  point: number;
  minValue: number;
  maxValue: number;
  isPassing: boolean;
};

type CopyCoursePayload = {
  fromYear: string;
  toYear: string;
  allCourses: boolean;
  selectedIds: string[];
};

const CURRICULUM_PROGRAMS = ['S1 - Sistem Informasi', 'S1 - Administrasi Bisnis'];
const COURSE_TYPES = ['Kuliah', 'Praktikum', 'Skripsi'];
const COURSE_GROUPS = ['Wajib', 'Pilihan', 'Paket'];
const CURRICULUM_STORAGE_KEY = 'siakad_curriculum_module_v1';

type CurriculumWorkspaceState = {
  curriculumYears: CurriculumYearRow[];
  courses: CourseRow[];
  curriculumCourses: ProgramCurriculumRow[];
  gradingScales: GradingScaleRow[];
};

function CurriculumModulePage({ activeTab, onTabChange }: { activeTab: CurriculumTab; onTabChange: (tab: CurriculumTab) => void }) {
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [notice, setNotice] = useState('');
  const [storageReady, setStorageReady] = useState(false);
  const [searchYear, setSearchYear] = useState('');
  const [searchCourse, setSearchCourse] = useState('');
  const [selectedFilterYear, setSelectedFilterYear] = useState('Semua');
  const [selectedProgram, setSelectedProgram] = useState(CURRICULUM_PROGRAMS[0]);
  const [selectedCurriculumYear, setSelectedCurriculumYear] = useState('2025');
  const [selectedCourseIds, setSelectedCourseIds] = useState<string[]>(['course-a023']);
  const [yearForm, setYearForm] = useState({
    year: '2027',
    description: 'Kurikulum 2027',
    effectivePeriod: '2027/2028 Ganjil',
    startDate: '1 Sep 2027',
    endDate: '31 Jan 2028'
  });
  const [courseForm, setCourseForm] = useState({
    curriculumYear: '2025',
    code: '',
    name: '',
    sks: '3',
    type: 'Kuliah',
    studyProgram: CURRICULUM_PROGRAMS[0],
    group: 'Wajib',
    minPassingGrade: 'C'
  });
  const [programForm, setProgramForm] = useState({
    courseId: 'course-ar025',
    semester: '1',
    minGrade: 'C',
    isMandatory: true,
    isPackage: false,
    prerequisite: '-'
  });
  const [scaleForm, setScaleForm] = useState({
    unit: CURRICULUM_PROGRAMS[0],
    letter: '',
    point: '4.00',
    minValue: '91',
    maxValue: '100',
    isPassing: true
  });
  const [curriculumYears, setCurriculumYears] = useState<CurriculumYearRow[]>([
    { id: 'cur-2025', year: '2025', description: '2025', effectivePeriod: '2025/2026 Ganjil', startDate: '1 Sep 2025', endDate: '31 Jan 2026' },
    { id: 'cur-2024', year: '2024', description: '2024', effectivePeriod: '2024 Genap', startDate: '1 Feb 2024', endDate: '31 Agu 2024' },
    { id: 'cur-2023', year: '2023', description: '2023', effectivePeriod: '2023 Gasal', startDate: '1 Feb 2023', endDate: '31 Des 2024' },
    { id: 'cur-2022', year: '2022', description: '2022', effectivePeriod: '2022 Gasal', startDate: '10 Apr 2022', endDate: '22 Agu 2027' },
    { id: 'cur-2021', year: '2021', description: '2021', effectivePeriod: '2021 Gasal', startDate: '13 Agu 2021', endDate: '3 Agu 2025' }
  ]);
  const [courses, setCourses] = useState<CourseRow[]>([
    { id: 'course-ai22', curriculumYear: '2025', code: 'AI22', name: 'Administrasi Bisnis', sks: 4, type: 'Skripsi', studyProgram: 'S1 - Sistem Informasi', group: 'Wajib', minPassingGrade: 'C', isMandatory: true },
    { id: 'course-ar025', curriculumYear: '2025', code: 'AR025', name: 'Bahasa Rusia', sks: 4, type: 'Kuliah', studyProgram: 'S1 - Sistem Informasi', group: 'Wajib', minPassingGrade: 'C', isMandatory: true },
    { id: 'course-a023', curriculumYear: '2024', code: 'A023', name: 'Manajemen Bisnis', sks: 2, type: 'Kuliah', studyProgram: 'S1 - Administrasi Bisnis', group: 'Pilihan', minPassingGrade: 'C', isMandatory: false },
    { id: 'course-ar023', curriculumYear: '2024', code: 'AR023', name: 'Bahasa Jerman', sks: 8, type: 'Kuliah', studyProgram: 'S1 - Sistem Informasi', group: 'Wajib', minPassingGrade: 'C', isMandatory: true },
    { id: 'course-ar024', curriculumYear: '2024', code: 'AR024', name: 'Bahasa Jerman II', sks: 4, type: 'Kuliah', studyProgram: 'S1 - Sistem Informasi', group: 'Wajib', minPassingGrade: 'C', isMandatory: true },
    { id: 'course-dw001', curriculumYear: '2024', code: 'DW001', name: 'Pemetaan Sumber Data', sks: 3, type: 'Kuliah', studyProgram: 'S1 - Sistem Informasi', group: 'Paket', minPassingGrade: 'C', isMandatory: true }
  ]);
  const [curriculumCourses, setCurriculumCourses] = useState<ProgramCurriculumRow[]>([
    { id: 'pc-ar025', curriculumYear: '2025', studyProgram: 'S1 - Sistem Informasi', courseId: 'course-ar025', semester: 1, minGrade: 'C', isMandatory: true, isPackage: false, prerequisite: '-' },
    { id: 'pc-ai22', curriculumYear: '2025', studyProgram: 'S1 - Sistem Informasi', courseId: 'course-ai22', semester: 1, minGrade: 'C', isMandatory: true, isPackage: false, prerequisite: '-' }
  ]);
  const [gradingScales, setGradingScales] = useState<GradingScaleRow[]>([
    { id: 'scale-a', unit: 'S1 - Sistem Informasi', letter: 'A', point: 4, minValue: 91, maxValue: 100, isPassing: true },
    { id: 'scale-b', unit: 'S1 - Sistem Informasi', letter: 'B', point: 3, minValue: 81, maxValue: 90, isPassing: true },
    { id: 'scale-c', unit: 'S1 - Sistem Informasi', letter: 'C', point: 2, minValue: 71, maxValue: 80, isPassing: true },
    { id: 'scale-d', unit: 'S1 - Sistem Informasi', letter: 'D', point: 1, minValue: 61, maxValue: 70, isPassing: false },
    { id: 'scale-e', unit: 'S1 - Sistem Informasi', letter: 'E', point: 0, minValue: 0, maxValue: 60, isPassing: false }
  ]);

  useEffect(() => {
    const raw = localStorage.getItem(CURRICULUM_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Partial<CurriculumWorkspaceState>;
        if (parsed.curriculumYears?.length) setCurriculumYears(parsed.curriculumYears);
        if (parsed.courses?.length) setCourses(parsed.courses);
        if (parsed.curriculumCourses?.length) setCurriculumCourses(parsed.curriculumCourses);
        if (parsed.gradingScales?.length) setGradingScales(parsed.gradingScales);
      } catch {
        localStorage.removeItem(CURRICULUM_STORAGE_KEY);
      }
    }
    setStorageReady(true);
  }, []);

  useEffect(() => {
    if (!storageReady) return;
    const payload: CurriculumWorkspaceState = { curriculumYears, courses, curriculumCourses, gradingScales };
    localStorage.setItem(CURRICULUM_STORAGE_KEY, JSON.stringify(payload));
  }, [storageReady, curriculumYears, courses, curriculumCourses, gradingScales]);

  const tabs: Array<{ key: CurriculumTab; label: string; hint: string }> = [
    { key: 'years', label: 'Tahun Kurikulum', hint: '1' },
    { key: 'courses', label: 'Mata Kuliah', hint: '2' },
    { key: 'copy-courses', label: 'Salin MK', hint: '3' },
    { key: 'program-curriculum', label: 'Kurikulum Prodi', hint: '4' },
    { key: 'grading-scale', label: 'Skala Nilai', hint: '5' }
  ];
  const active = tabs.find((tab) => tab.key === activeTab) ?? tabs[0];
  const yearOptions = curriculumYears.map((item) => item.year);
  const gradeLetters = gradingScales
    .filter((scale) => scale.unit === selectedProgram)
    .map((scale) => scale.letter);
  const availableCoursesForProgram = courses.filter((course) => (
    course.curriculumYear === selectedCurriculumYear && course.studyProgram === selectedProgram
  ));
  const visibleYears = curriculumYears.filter((item) => {
    const keyword = searchYear.toLowerCase();
    return !keyword || [item.year, item.description, item.effectivePeriod].join(' ').toLowerCase().includes(keyword);
  });
  const visibleCourses = courses.filter((course) => {
    const keyword = searchCourse.toLowerCase();
    const matchYear = selectedFilterYear === 'Semua' || course.curriculumYear === selectedFilterYear;
    const matchKeyword = !keyword || [course.code, course.name, course.studyProgram, course.type, course.group].join(' ').toLowerCase().includes(keyword);
    return matchYear && matchKeyword;
  });
  const visibleProgramCourses = curriculumCourses
    .filter((row) => row.curriculumYear === selectedCurriculumYear && row.studyProgram === selectedProgram)
    .map((row) => ({ ...row, course: courses.find((course) => course.id === row.courseId) }))
    .filter((row) => row.course);
  const totalSks = visibleProgramCourses.reduce((sum, row) => sum + (row.course?.sks || 0), 0);
  const mandatorySks = visibleProgramCourses.reduce((sum, row) => sum + (row.isMandatory ? row.course?.sks || 0 : 0), 0);
  const electiveSks = totalSks - mandatorySks;

  function showMessage(message: string) {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  }

  function addCurriculumYear(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!yearForm.year.trim() || !yearForm.description.trim()) {
      showMessage('Tahun dan keterangan kurikulum wajib diisi.');
      return;
    }
    if (curriculumYears.some((item) => item.year === yearForm.year.trim())) {
      showMessage('Tahun kurikulum sudah tersedia.');
      return;
    }
    setCurriculumYears((current) => [
      {
        id: `cur-${Date.now()}`,
        year: yearForm.year.trim(),
        description: yearForm.description.trim(),
        effectivePeriod: yearForm.effectivePeriod.trim() || yearForm.description.trim(),
        startDate: yearForm.startDate.trim() || '-',
        endDate: yearForm.endDate.trim() || '-'
      },
      ...current
    ]);
    setSelectedCurriculumYear(yearForm.year.trim());
    setCourseForm((current) => ({ ...current, curriculumYear: yearForm.year.trim() }));
    showMessage('Tahun kurikulum baru berhasil ditambahkan.');
  }

  function deleteCurriculumYear(id: string, year: string) {
    setCurriculumYears((current) => current.filter((item) => item.id !== id));
    setCourses((current) => current.filter((course) => course.curriculumYear !== year));
    setCurriculumCourses((current) => current.filter((row) => row.curriculumYear !== year));
    if (selectedCurriculumYear === year) {
      setSelectedCurriculumYear(curriculumYears.find((item) => item.year !== year)?.year || '');
    }
    showMessage('Tahun kurikulum dan data turunannya dihapus dari tampilan kerja.');
  }

  function addCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = courseForm.code.trim().toUpperCase();
    const name = courseForm.name.trim();
    const sks = Number(courseForm.sks);
    if (!code || !name || !Number.isFinite(sks) || sks < 1) {
      showMessage('Kode, nama, dan SKS mata kuliah wajib valid.');
      return;
    }
    if (courses.some((course) => course.curriculumYear === courseForm.curriculumYear && course.code === code)) {
      showMessage('Kode mata kuliah pada tahun kurikulum ini sudah ada.');
      return;
    }
    const newCourse: CourseRow = {
      id: `course-${Date.now()}`,
      curriculumYear: courseForm.curriculumYear,
      code,
      name,
      sks,
      type: courseForm.type,
      studyProgram: courseForm.studyProgram,
      group: courseForm.group,
      minPassingGrade: courseForm.minPassingGrade,
      isMandatory: courseForm.group !== 'Pilihan'
    };
    setCourses((current) => [newCourse, ...current]);
    setProgramForm((current) => ({ ...current, courseId: newCourse.id, minGrade: newCourse.minPassingGrade }));
    showMessage('Mata kuliah berhasil ditambahkan.');
  }

  function toggleCourse(id: string) {
    setSelectedCourseIds((current) => (
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id]
    ));
  }

  function deleteCourse(id: string) {
    setCourses((current) => current.filter((course) => course.id !== id));
    setCurriculumCourses((current) => current.filter((row) => row.courseId !== id));
    setSelectedCourseIds((current) => current.filter((item) => item !== id));
    showMessage('Mata kuliah dihapus.');
  }

  function deleteSelectedCourses() {
    if (!selectedCourseIds.length) {
      showMessage('Centang mata kuliah yang ingin dihapus dulu.');
      return;
    }
    setCourses((current) => current.filter((course) => !selectedCourseIds.includes(course.id)));
    setCurriculumCourses((current) => current.filter((row) => !selectedCourseIds.includes(row.courseId)));
    setSelectedCourseIds([]);
    showMessage('Mata kuliah tercentang berhasil dihapus.');
  }

  function copyCourses(payload: CopyCoursePayload) {
    const sourceCourses = courses.filter((course) => {
      const matchSource = course.curriculumYear === payload.fromYear;
      const matchSelection = payload.allCourses || payload.selectedIds.includes(course.id);
      return matchSource && matchSelection;
    });
    if (!sourceCourses.length) {
      showMessage('Tidak ada mata kuliah sumber yang bisa disalin.');
      return;
    }
    let copied = 0;
    setCourses((current) => {
      const next = [...current];
      sourceCourses.forEach((course) => {
        const exists = next.some((item) => item.curriculumYear === payload.toYear && item.code === course.code);
        if (!exists) {
          copied += 1;
          next.unshift({ ...course, id: `course-copy-${Date.now()}-${copied}`, curriculumYear: payload.toYear });
        }
      });
      return next;
    });
    setSelectedCurriculumYear(payload.toYear);
    setSelectedFilterYear(payload.toYear);
    setShowCopyModal(false);
    showMessage(copied ? `${copied} mata kuliah berhasil disalin.` : 'Semua mata kuliah tujuan sudah tersedia, tidak ada salinan baru.');
  }

  function addProgramCourse(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const course = courses.find((item) => item.id === programForm.courseId);
    const semester = Number(programForm.semester);
    if (!course || !Number.isFinite(semester) || semester < 1) {
      showMessage('Pilih mata kuliah dan semester yang valid.');
      return;
    }
    if (curriculumCourses.some((row) => (
      row.curriculumYear === selectedCurriculumYear &&
      row.studyProgram === selectedProgram &&
      row.courseId === course.id
    ))) {
      showMessage('Mata kuliah sudah masuk kurikulum prodi ini.');
      return;
    }
    setCurriculumCourses((current) => [
      ...current,
      {
        id: `pc-${Date.now()}`,
        curriculumYear: selectedCurriculumYear,
        studyProgram: selectedProgram,
        courseId: course.id,
        semester,
        minGrade: programForm.minGrade,
        isMandatory: programForm.isMandatory,
        isPackage: programForm.isPackage,
        prerequisite: programForm.prerequisite.trim() || '-'
      }
    ]);
    showMessage('Mata kuliah berhasil disusun ke kurikulum prodi.');
  }

  function removeProgramCourse(id: string) {
    setCurriculumCourses((current) => current.filter((row) => row.id !== id));
    showMessage('Mata kuliah dikeluarkan dari kurikulum prodi.');
  }

  function addScale(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const letter = scaleForm.letter.trim().toUpperCase();
    const point = Number(scaleForm.point);
    const minValue = Number(scaleForm.minValue);
    const maxValue = Number(scaleForm.maxValue);
    if (!letter || !Number.isFinite(point) || !Number.isFinite(minValue) || !Number.isFinite(maxValue)) {
      showMessage('Grade, bobot, nilai bawah, dan nilai atas wajib valid.');
      return;
    }
    if (gradingScales.some((scale) => scale.unit === scaleForm.unit && scale.letter === letter)) {
      showMessage('Grade pada unit kerja ini sudah tersedia.');
      return;
    }
    setGradingScales((current) => [
      ...current,
      { id: `scale-${Date.now()}`, unit: scaleForm.unit, letter, point, minValue, maxValue, isPassing: scaleForm.isPassing }
    ]);
    setProgramForm((current) => ({ ...current, minGrade: letter }));
    showMessage('Skala nilai berhasil ditambahkan dan bisa dipakai sebagai Nilai Min.');
  }

  function removeScale(id: string) {
    setGradingScales((current) => current.filter((scale) => scale.id !== id));
    showMessage('Skala nilai dihapus.');
  }

  const yearRows = visibleYears.map((item): ReactNode[] => [
    item.year,
    item.description,
    item.effectivePeriod,
    item.startDate,
    item.endDate,
    <button key={item.id} type="button" onClick={() => deleteCurriculumYear(item.id, item.year)} className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">Hapus</button>
  ]);

  const courseRows = visibleCourses.map((course): ReactNode[] => [
    <input key={course.id} type="checkbox" checked={selectedCourseIds.includes(course.id)} onChange={() => toggleCourse(course.id)} />,
    course.curriculumYear,
    course.code,
    course.name,
    course.sks.toString(),
    course.type,
    course.studyProgram,
    <button key={course.id} type="button" onClick={() => deleteCourse(course.id)} className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">Hapus</button>
  ]);

  const programRows = visibleProgramCourses.map((row, index): ReactNode[] => [
    String(index + 1),
    row.course?.code || '-',
    row.course?.name || '-',
    String(row.semester),
    String(row.course?.sks || 0),
    row.isMandatory ? 'Wajib' : 'Pilihan',
    row.minGrade,
    row.prerequisite,
    <button key={row.id} type="button" onClick={() => removeProgramCourse(row.id)} className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">Hapus</button>
  ]);

  const scaleRows = gradingScales.map((scale): ReactNode[] => [
    scale.unit,
    scale.letter,
    scale.point.toFixed(2),
    scale.minValue.toFixed(2),
    scale.maxValue.toFixed(2),
    scale.isPassing ? 'Lulus' : 'Tidak lulus',
    <button key={scale.id} type="button" onClick={() => removeScale(scale.id)} className="rounded bg-red-500 px-2 py-1 text-xs font-semibold text-white">Hapus</button>
  ]);

  return (
    <section className="mt-5 rounded border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-4 py-3">
        <p className="text-[11px] text-slate-500">Beranda &gt; Perkuliahan &gt; Data Kurikulum &gt; {active.label}</p>
        <div className="mt-2 grid gap-3 lg:grid-cols-[minmax(0,1fr)_320px] lg:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Perkuliahan / Data Kurikulum</p>
            <h3 className="text-2xl font-black text-slate-900">{active.label}</h3>
            <p className="mt-1 text-sm text-slate-500">Alur kerja: tahun kurikulum, mata kuliah, salin MK, susun kurikulum prodi, lalu lengkapi skala nilai.</p>
          </div>
          <label className="text-sm font-semibold text-slate-700">
            Sub Menu Kurikulum
            <select
              value={activeTab}
              onChange={(event) => onTabChange(event.target.value as CurriculumTab)}
              className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-800"
            >
              {tabs.map((tab) => <option key={tab.key} value={tab.key}>{tab.hint}. {tab.label}</option>)}
            </select>
          </label>
        </div>
        {notice ? <p className="mt-3 rounded border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-800">{notice}</p> : null}
      </div>

      <div className="bg-[#f7f7f7] p-4">
        {activeTab === 'years' ? (
          <ModulePanel title="Tahun Kurikulum">
            <form onSubmit={addCurriculumYear} className="mb-4 grid gap-3 rounded border border-emerald-100 bg-emerald-50 p-3 md:grid-cols-5">
              <label className="text-sm font-semibold">Tahun<input value={yearForm.year} onChange={(event) => setYearForm({ ...yearForm, year: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Keterangan<input value={yearForm.description} onChange={(event) => setYearForm({ ...yearForm, description: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Mulai Berlaku<input value={yearForm.effectivePeriod} onChange={(event) => setYearForm({ ...yearForm, effectivePeriod: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Tanggal Awal<input value={yearForm.startDate} onChange={(event) => setYearForm({ ...yearForm, startDate: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Tanggal Akhir<input value={yearForm.endDate} onChange={(event) => setYearForm({ ...yearForm, endDate: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white md:col-span-5">+ Tambah Tahun Kurikulum</button>
            </form>
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <select value={selectedFilterYear} onChange={(event) => setSelectedFilterYear(event.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                <option>Semua</option>
                {yearOptions.map((year) => <option key={year}>{year}</option>)}
              </select>
              <input value={searchYear} onChange={(event) => setSearchYear(event.target.value)} className="min-w-[240px] rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Cari Tahun Kurikulum" />
              <button type="button" onClick={() => { setSearchYear(''); setSelectedFilterYear('Semua'); }} className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Refresh</button>
            </div>
            <ModuleTable headers={['Tahun', 'Keterangan', 'Mulai Berlaku', 'Tanggal Awal', 'Tanggal Akhir', 'Aksi']} rows={yearRows} />
          </ModulePanel>
        ) : null}

        {activeTab === 'courses' ? (
          <ModulePanel title="Mata Kuliah">
            <div className="grid gap-4 lg:grid-cols-[180px_minmax(0,1fr)]">
              <aside className="rounded border border-slate-200 bg-white p-3">
                <p className="mb-3 border-b border-amber-300 pb-2 text-sm font-bold">FILTER</p>
                <FilterBox title="Tahun Kurikulum" values={yearOptions} onSelect={setSelectedFilterYear} />
                <FilterBox title="Unit / Prodi Pengampu" values={CURRICULUM_PROGRAMS} onSelect={(value) => setCourseForm({ ...courseForm, studyProgram: value })} />
                <FilterBox title="Jenis Mata Kuliah" values={COURSE_TYPES} onSelect={(value) => setCourseForm({ ...courseForm, type: value })} />
                <FilterBox title="Kelompok Mata Kuliah" values={COURSE_GROUPS} onSelect={(value) => setCourseForm({ ...courseForm, group: value })} />
              </aside>
              <div className="min-w-0">
                <form onSubmit={addCourse} className="mb-4 grid gap-3 rounded border border-emerald-100 bg-emerald-50 p-3 md:grid-cols-4">
                  <label className="text-sm font-semibold">Kurikulum<select value={courseForm.curriculumYear} onChange={(event) => setCourseForm({ ...courseForm, curriculumYear: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{yearOptions.map((year) => <option key={year}>{year}</option>)}</select></label>
                  <label className="text-sm font-semibold">Kode<input value={courseForm.code} onChange={(event) => setCourseForm({ ...courseForm, code: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" placeholder="IF104" /></label>
                  <label className="text-sm font-semibold">Nama<input value={courseForm.name} onChange={(event) => setCourseForm({ ...courseForm, name: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" placeholder="Nama mata kuliah" /></label>
                  <label className="text-sm font-semibold">SKS<input value={courseForm.sks} onChange={(event) => setCourseForm({ ...courseForm, sks: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
                  <label className="text-sm font-semibold">Jenis MK<select value={courseForm.type} onChange={(event) => setCourseForm({ ...courseForm, type: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{COURSE_TYPES.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="text-sm font-semibold">Prodi<select value={courseForm.studyProgram} onChange={(event) => setCourseForm({ ...courseForm, studyProgram: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{CURRICULUM_PROGRAMS.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="text-sm font-semibold">Kelompok<select value={courseForm.group} onChange={(event) => setCourseForm({ ...courseForm, group: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{COURSE_GROUPS.map((item) => <option key={item}>{item}</option>)}</select></label>
                  <label className="text-sm font-semibold">Nilai Minimal<select value={courseForm.minPassingGrade} onChange={(event) => setCourseForm({ ...courseForm, minPassingGrade: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{gradingScales.map((scale) => <option key={scale.id}>{scale.letter}</option>)}</select></label>
                  <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white md:col-span-4">+ Tambah Mata Kuliah</button>
                </form>
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <select value={selectedFilterYear} onChange={(event) => setSelectedFilterYear(event.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                    <option>Semua</option>
                    {yearOptions.map((year) => <option key={year}>{year}</option>)}
                  </select>
                  <input value={searchCourse} onChange={(event) => setSearchCourse(event.target.value)} className="min-w-[210px] rounded border border-slate-300 px-3 py-2 text-sm" placeholder="Cari Mata Kuliah" />
                  <button type="button" onClick={() => { setSearchCourse(''); setSelectedFilterYear('Semua'); }} className="rounded bg-blue-600 px-3 py-2 text-sm font-semibold text-white">Refresh</button>
                  <button type="button" onClick={deleteSelectedCourses} className="rounded bg-red-500 px-3 py-2 text-sm font-semibold text-white">Hapus Tercentang</button>
                  <button type="button" onClick={() => setShowCopyModal(true)} className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-white">Aksi: Salin MK</button>
                  <button type="button" onClick={() => showMessage('Preview cetak mata kuliah siap untuk integrasi PDF/Excel.')} className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Cetak</button>
                </div>
                <ModuleTable headers={['Pilih', 'Kur.', 'Kode', 'Nama', 'SKS', 'Jenis MK', 'Prodi', 'Aksi']} rows={courseRows} highlightRow={2} />
              </div>
            </div>
          </ModulePanel>
        ) : null}

        {activeTab === 'copy-courses' ? (
          <CopyCoursePanel
            years={yearOptions}
            courses={courses}
            selectedCourseIds={selectedCourseIds}
            onCopy={copyCourses}
          />
        ) : null}

        {activeTab === 'program-curriculum' ? (
          <ModulePanel title="Kurikulum Prodi">
            <div className="mb-4 grid gap-3 rounded border border-amber-200 bg-amber-50 p-3 md:grid-cols-[120px_minmax(0,1fr)_100px_150px_auto] md:items-center">
              <label className="text-sm font-bold text-amber-700">Program Studi</label>
              <select value={selectedProgram} onChange={(event) => setSelectedProgram(event.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                {CURRICULUM_PROGRAMS.map((program) => <option key={program}>{program}</option>)}
              </select>
              <label className="text-sm font-bold text-amber-700">Kurikulum</label>
              <select value={selectedCurriculumYear} onChange={(event) => setSelectedCurriculumYear(event.target.value)} className="rounded border border-slate-300 bg-white px-3 py-2 text-sm">
                {yearOptions.map((year) => <option key={year}>{year}</option>)}
              </select>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowCopyModal(true)} className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-white">Salin</button>
                <button type="button" onClick={() => showMessage(`Review ${visibleProgramCourses.length} mata kuliah kurikulum ${selectedCurriculumYear}.`)} className="rounded bg-blue-700 px-3 py-2 text-sm font-semibold text-white">Review</button>
                <button type="button" onClick={() => showMessage('Cetak kurikulum prodi siap untuk integrasi PDF/Excel.')} className="rounded bg-sky-500 px-3 py-2 text-sm font-semibold text-white">Cetak</button>
              </div>
            </div>
            <form onSubmit={addProgramCourse} className="mb-3 grid gap-3 rounded border border-teal-200 p-3 md:grid-cols-[minmax(0,1fr)_90px_110px_minmax(0,1fr)_auto] md:items-end">
              <label className="text-sm font-semibold">Mata Kuliah<select value={programForm.courseId} onChange={(event) => setProgramForm({ ...programForm, courseId: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2">{availableCoursesForProgram.map((course) => <option key={course.id} value={course.id}>{course.code} - {course.name}</option>)}</select></label>
              <label className="text-sm font-semibold">Semester<input value={programForm.semester} onChange={(event) => setProgramForm({ ...programForm, semester: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Nilai Min<select value={programForm.minGrade} onChange={(event) => setProgramForm({ ...programForm, minGrade: event.target.value })} className="mt-1 w-full rounded border-2 border-red-500 px-3 py-2">{(gradeLetters.length ? gradeLetters : ['A', 'B', 'C', 'D', 'E']).map((grade) => <option key={grade}>{grade}</option>)}</select></label>
              <label className="text-sm font-semibold">Opsi Tambahan<span className="mt-2 flex flex-wrap gap-3"><span><input type="checkbox" checked={programForm.isMandatory} onChange={(event) => setProgramForm({ ...programForm, isMandatory: event.target.checked })} /> MK Wajib</span><span><input type="checkbox" checked={programForm.isPackage} onChange={(event) => setProgramForm({ ...programForm, isPackage: event.target.checked })} /> Paket MK</span><input value={programForm.prerequisite} onChange={(event) => setProgramForm({ ...programForm, prerequisite: event.target.value })} className="w-full rounded border border-slate-300 px-3 py-2" placeholder="Prasyarat" /></span></label>
              <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white">+ Tambah</button>
            </form>
            <ModuleTable headers={['No', 'Kode', 'Mata Kuliah', 'SMT', 'SKS', 'Status', 'Nilai Min', 'Prasyarat', 'Aksi']} rows={programRows} />
            <div className="mt-3 rounded bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700">Total SKS: {totalSks} | Wajib: {mandatorySks} | Pilihan: {electiveSks}</div>
          </ModulePanel>
        ) : null}

        {activeTab === 'grading-scale' ? (
          <ModulePanel title="Skala Nilai">
            <form onSubmit={addScale} className="mb-4 grid gap-3 rounded border border-amber-300 p-3 md:grid-cols-6">
              <label className="text-sm font-semibold md:col-span-2">Unit Induk<select value={scaleForm.unit} onChange={(event) => setScaleForm({ ...scaleForm, unit: event.target.value })} className="mt-1 w-full rounded border-2 border-red-500 px-3 py-2">{CURRICULUM_PROGRAMS.map((program) => <option key={program}>{program}</option>)}</select></label>
              <label className="text-sm font-semibold">Grade<input value={scaleForm.letter} onChange={(event) => setScaleForm({ ...scaleForm, letter: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" placeholder="A" /></label>
              <label className="text-sm font-semibold">Bobot<input value={scaleForm.point} onChange={(event) => setScaleForm({ ...scaleForm, point: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Nilai Bawah<input value={scaleForm.minValue} onChange={(event) => setScaleForm({ ...scaleForm, minValue: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="text-sm font-semibold">Nilai Atas<input value={scaleForm.maxValue} onChange={(event) => setScaleForm({ ...scaleForm, maxValue: event.target.value })} className="mt-1 w-full rounded border border-slate-300 px-3 py-2" /></label>
              <label className="flex items-center gap-2 text-sm font-semibold md:col-span-2"><input type="checkbox" checked={scaleForm.isPassing} onChange={(event) => setScaleForm({ ...scaleForm, isPassing: event.target.checked })} /> Lulus / boleh dipakai sebagai nilai minimal</label>
              <button className="rounded bg-emerald-600 px-3 py-2 text-sm font-semibold text-white md:col-span-2">+ Tambah Skala Nilai</button>
              <button type="button" onClick={() => showMessage('Salin data skala nilai siap untuk tahap integrasi antar kurikulum.')} className="rounded bg-amber-500 px-3 py-2 text-sm font-semibold text-white md:col-span-2">Salin Data</button>
            </form>
            <ModuleTable headers={['Unit Kerja', 'Grade', 'Bobot', 'Nilai Bawah', 'Nilai Atas', 'Setting', 'Aksi']} rows={scaleRows} />
          </ModulePanel>
        ) : null}
      </div>

      {showCopyModal ? (
        <CopyCourseModal
          years={yearOptions}
          courses={courses}
          selectedCourseIds={selectedCourseIds}
          onCopy={copyCourses}
          onClose={() => setShowCopyModal(false)}
        />
      ) : null}
    </section>
  );
}

function ModulePanel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="overflow-hidden rounded border border-slate-200 bg-[#f7f7f7] p-4 shadow-sm">
      <h4 className="mb-3 text-xl font-semibold text-slate-800">{title}</h4>
      <div className="border-t-2 border-teal-500 bg-white p-3">{children}</div>
    </div>
  );
}

function CopyCoursePanel({
  years,
  courses,
  selectedCourseIds,
  onCopy
}: {
  years: string[];
  courses: CourseRow[];
  selectedCourseIds: string[];
  onCopy: (payload: CopyCoursePayload) => void;
}) {
  return (
    <ModulePanel title="Salin Data Mata Kuliah">
      <div className="mx-auto max-w-2xl rounded-xl border border-slate-200 bg-white p-6 shadow-[0_14px_36px_rgba(15,23,42,0.10)]">
        <CopyCourseForm years={years} courses={courses} selectedCourseIds={selectedCourseIds} onCopy={onCopy} />
      </div>
    </ModulePanel>
  );
}

function CopyCourseModal({
  years,
  courses,
  selectedCourseIds,
  onCopy,
  onClose
}: {
  years: string[];
  courses: CourseRow[];
  selectedCourseIds: string[];
  onCopy: (payload: CopyCoursePayload) => void;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-[0_24px_70px_rgba(15,23,42,0.28)]">
        <div className="mb-5 flex items-center justify-between">
          <h4 className="text-2xl font-black text-slate-900">Salin Data Mata Kuliah</h4>
          <button onClick={onClose} className="text-2xl text-slate-500">x</button>
        </div>
        <CopyCourseForm years={years} courses={courses} selectedCourseIds={selectedCourseIds} onCopy={onCopy} onCancel={onClose} />
      </div>
    </div>
  );
}

function CopyCourseForm({
  years,
  courses,
  selectedCourseIds,
  onCopy,
  onCancel
}: {
  years: string[];
  courses: CourseRow[];
  selectedCourseIds: string[];
  onCopy: (payload: CopyCoursePayload) => void;
  onCancel?: () => void;
}) {
  const newestYear = years[0] || '2025';
  const previousYear = years.find((year) => year !== newestYear) || newestYear;
  const [form, setForm] = useState({
    toYear: newestYear,
    fromYear: previousYear,
    allCourses: selectedCourseIds.length === 0
  });
  const sourceCount = courses.filter((course) => course.curriculumYear === form.fromYear).length;
  const selectedCount = selectedCourseIds.length;

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onCopy({ ...form, selectedIds: selectedCourseIds });
  }

  return (
    <form onSubmit={submit}>
      <div className="grid gap-4 text-sm md:grid-cols-[190px_minmax(0,1fr)]">
        <label className="font-bold text-indigo-500">Ke Kurikulum</label>
        <select value={form.toYear} onChange={(event) => setForm({ ...form, toYear: event.target.value })} className="rounded border border-slate-300 px-3 py-2">
          {years.map((year) => <option key={year}>{year}</option>)}
        </select>
        <label className="font-bold text-indigo-500">Dari Kurikulum</label>
        <select value={form.fromYear} onChange={(event) => setForm({ ...form, fromYear: event.target.value })} className="rounded border border-teal-600 px-3 py-2">
          {years.map((year) => <option key={year}>{year}</option>)}
        </select>
        <label className="font-bold text-indigo-500">Semua Mata Kuliah</label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.allCourses} onChange={(event) => setForm({ ...form, allCourses: event.target.checked })} />
          Salin semua mata kuliah dari kurikulum sumber
        </label>
        <span className="font-bold text-indigo-500">Ringkasan</span>
        <span className="rounded bg-slate-50 px-3 py-2 text-slate-600">
          Sumber: {sourceCount} MK, tercentang: {selectedCount} MK. Jika semua tidak dicentang, sistem memakai MK yang tercentang.
        </span>
      </div>
      <div className="mt-6 flex justify-end gap-2">
        <button className="rounded bg-emerald-600 px-5 py-2 font-semibold text-white">Salin</button>
        <button type="button" onClick={onCancel} className="rounded bg-red-500 px-5 py-2 font-semibold text-white">Batal</button>
      </div>
    </form>
  );
}

function ModuleTable({ headers, rows, highlightRow }: { headers: string[]; rows: ReactNode[][]; highlightRow?: number }) {
  return (
    <div className="overflow-auto rounded border border-slate-300">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="bg-[#005487] text-xs uppercase tracking-wide text-white">
          <tr>{headers.map((header) => <th key={header} className="border border-[#24719d] px-3 py-2">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className={`${index === highlightRow ? 'bg-emerald-50' : index % 2 ? 'bg-slate-50' : 'bg-white'}`}>
              {row.map((cell, cellIndex) => <td key={cellIndex} className="border border-slate-200 px-3 py-2">{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FilterBox({ title, values, onSelect }: { title: string; values: string[]; onSelect?: (value: string) => void }) {
  return (
    <div className="mb-3 border-b border-slate-200 pb-2">
      <p className="mb-1 text-xs font-semibold text-slate-500">{title}</p>
      <div className="grid gap-1 text-xs text-emerald-700">
        {values.map((value) => onSelect ? (
          <button key={value} type="button" onClick={() => onSelect(value)} className="text-left hover:underline">{value}</button>
        ) : (
          <span key={value}>{value}</span>
        ))}
      </div>
    </div>
  );
}
function Card({ label, value, tone }: { label: string; value: string; tone: 'teal' | 'amber' | 'rose' | 'slate' }) {
  const tones = {
    teal: 'border-teal-100 bg-teal-50 text-teal-900',
    amber: 'border-amber-100 bg-amber-50 text-amber-900',
    rose: 'border-rose-100 bg-rose-50 text-rose-900',
    slate: 'border-slate-200 bg-white text-slate-900'
  };
  return <div className={`rounded border p-4 ${tones[tone]}`}><p className="text-sm opacity-75">{label}</p><p className="mt-1 text-2xl font-black">{value}</p></div>;
}

function StatusPill({ label, value }: { label: string; value: string }) {
  return <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm"><span className="text-slate-500">{label}: </span><span className="font-semibold text-slate-900">{value}</span></div>;
}

const MASTER_TABS: Array<{ key: MasterKey; label: string; flow: string }> = [
  { key: 'universities', label: 'Universitas', flow: 'Perguruan Tinggi' },
  { key: 'faculties', label: 'Fakultas', flow: 'Struktur Akademik' },
  { key: 'study-programs', label: 'Program Studi', flow: 'Struktur Akademik' },
  { key: 'degree-levels', label: 'Jenjang Pendidikan', flow: 'Referensi Prodi' },
  { key: 'academic-years', label: 'Tahun Ajaran', flow: 'Kalender Akademik' },
  { key: 'academic-periods', label: 'Periode Akademik', flow: 'Kalender Akademik' },
  { key: 'study-systems', label: 'Sistem Kuliah', flow: 'Referensi Mahasiswa' },
  { key: 'student-classes', label: 'Kelas Mahasiswa', flow: 'Referensi Mahasiswa' },
  { key: 'student-statuses', label: 'Status Mahasiswa', flow: 'Referensi Mahasiswa' },
  { key: 'lecturers', label: 'Data Dosen', flow: 'SDM Akademik' },
  { key: 'students', label: 'Data Mahasiswa', flow: 'Registrasi Akademik' },
  { key: 'student-parents', label: 'Orang Tua Mahasiswa', flow: 'Data Pendukung' }
];

function TextInput({ label, value, onChange, required = true }: { label: string; value?: string; onChange: (v: string) => void; required?: boolean }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <input required={required} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100" />
    </label>
  );
}

function SelectInput({ label, value, onChange, options, required = true }: { label: string; value?: string; onChange: (v: string) => void; options: Array<{ id: string; name: string; code?: string }>; required?: boolean }) {
  return (
    <label className="text-sm">
      <span className="mb-1 block font-medium text-slate-700">{label}</span>
      <select required={required} value={value || ''} onChange={(e) => onChange(e.target.value)} className="w-full rounded border border-slate-300 bg-white px-3 py-2 outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-100">
        <option value="">Pilih...</option>
        {options.map((o) => <option key={o.id} value={o.id}>{o.code ? `${o.code} - ${o.name}` : o.name}</option>)}
      </select>
    </label>
  );
}

function FormFields({ tab, form, setForm, refs }: {
  tab: MasterKey;
  form: Record<string, string>;
  setForm: (fn: Record<string, string>) => void;
  refs: {
    universities: University[];
    faculties: Faculty[];
    degreeLevels: RefItem[];
    academicYears: AcademicYear[];
    studyPrograms: StudyProgram[];
    studentClasses: RefItem[];
    studentStatuses: RefItem[];
    studySystems: RefItem[];
    students: Student[];
  };
}) {
  const set = (k: string, v: string) => setForm({ ...form, [k]: v });

  if (tab === 'universities' || tab === 'degree-levels' || tab === 'academic-years' || tab === 'study-systems' || tab === 'student-classes' || tab === 'student-statuses') {
    return <>
      <TextInput label="Kode" value={form.code} onChange={(v) => set('code', v)} />
      <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
    </>;
  }
  if (tab === 'faculties') return <>
    <SelectInput label="Universitas" value={form.universityId} onChange={(v) => set('universityId', v)} options={refs.universities} />
    <TextInput label="Kode" value={form.code} onChange={(v) => set('code', v)} />
    <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
    <TextInput label="Akreditasi" value={form.accreditation} onChange={(v) => set('accreditation', v)} required={false} />
    <TextInput label="Nama Pimpinan Fakultas" value={form.leaderName} onChange={(v) => set('leaderName', v)} required={false} />
    <TextInput label="Nomor Telepon Pimpinan" value={form.leaderPhone} onChange={(v) => set('leaderPhone', v)} required={false} />
  </>;
  if (tab === 'study-programs') return <>
    <SelectInput label="Fakultas" value={form.facultyId} onChange={(v) => set('facultyId', v)} options={refs.faculties} />
    <SelectInput label="Jenjang" value={form.degreeLevelId} onChange={(v) => set('degreeLevelId', v)} options={refs.degreeLevels} required={false} />
    <TextInput label="Kode" value={form.code} onChange={(v) => set('code', v)} />
    <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
  </>;
  if (tab === 'academic-periods') return <>
    <SelectInput label="Tahun Ajaran" value={form.academicYearId} onChange={(v) => set('academicYearId', v)} options={refs.academicYears} />
    <TextInput label="Kode" value={form.code} onChange={(v) => set('code', v)} />
    <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
    <TextInput label="Mulai (YYYY-MM-DD)" value={form.startDate} onChange={(v) => set('startDate', v)} />
    <TextInput label="Selesai (YYYY-MM-DD)" value={form.endDate} onChange={(v) => set('endDate', v)} />
  </>;
  if (tab === 'lecturers') return <>
    <SelectInput label="Universitas" value={form.universityId} onChange={(v) => set('universityId', v)} options={refs.universities} />
    <SelectInput label="Homebase Program Studi" value={form.studyProgramId} onChange={(v) => set('studyProgramId', v)} options={refs.studyPrograms} required={false} />
    <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
    <TextInput label="Email" value={form.email} onChange={(v) => set('email', v)} />
    <TextInput label="NIDN" value={form.nidn} onChange={(v) => set('nidn', v)} />
  </>;
  if (tab === 'students') return <>
    <SelectInput label="Universitas" value={form.universityId} onChange={(v) => set('universityId', v)} options={refs.universities} />
    <SelectInput label="Program Studi" value={form.studyProgramId} onChange={(v) => set('studyProgramId', v)} options={refs.studyPrograms} />
    <TextInput label="NIM" value={form.nim} onChange={(v) => set('nim', v)} />
    <TextInput label="Nama" value={form.name} onChange={(v) => set('name', v)} />
    <TextInput label="Email" value={form.email} onChange={(v) => set('email', v)} />
    <TextInput label="Status" value={form.status || 'AKTIF'} onChange={(v) => set('status', v)} />
    <TextInput label="Semester Aktif" value={form.currentSemester || '1'} onChange={(v) => set('currentSemester', v)} />
    <SelectInput label="Kelas Mahasiswa" value={form.studentClassId} onChange={(v) => set('studentClassId', v)} options={refs.studentClasses} required={false} />
    <SelectInput label="Status Mahasiswa" value={form.studentStatusId} onChange={(v) => set('studentStatusId', v)} options={refs.studentStatuses} required={false} />
    <SelectInput label="Sistem Kuliah" value={form.studySystemId} onChange={(v) => set('studySystemId', v)} options={refs.studySystems} required={false} />
  </>;
  return <>
    <SelectInput label="Mahasiswa" value={form.studentId} onChange={(v) => set('studentId', v)} options={refs.students.map((s) => ({ id: s.id, name: `${s.nim} - ${s.name}` }))} />
    <TextInput label="Nama Orang Tua" value={form.name} onChange={(v) => set('name', v)} />
    <TextInput label="Relasi" value={form.relation} onChange={(v) => set('relation', v)} />
    <TextInput label="No. HP" value={form.phone} onChange={(v) => set('phone', v)} required={false} />
  </>;
}

function getRows(tab: MasterKey, data: MasterDataBag): Array<Record<string, string>> {
  if (tab === 'universities') return data.universities.map((x) => ({ Kode: x.code, Nama: x.name }));
  if (tab === 'faculties') return data.faculties.map((x) => ({
    Kode: x.code,
    Fakultas: x.name,
    Akreditasi: x.accreditation || '-',
    Pimpinan: x.leaderName || '-',
    Telepon: x.leaderPhone || '-',
    'Student Body': String(x.studentBodyTotal || 0),
    Universitas: findName(data.universities, x.universityId)
  }));
  if (tab === 'study-programs') return data.studyPrograms.map((x) => ({ Kode: x.code, Prodi: x.name, Jenjang: findName(data.degreeLevels, x.degreeLevelId || '') || x.degreeLevel || '-', Fakultas: findName(data.faculties, x.facultyId) }));
  if (tab === 'degree-levels') return data.degreeLevels.map((x) => ({ Kode: x.code, Jenjang: x.name }));
  if (tab === 'academic-years') return data.academicYears.map((x) => ({ Kode: x.code, 'Tahun Ajaran': x.name }));
  if (tab === 'academic-periods') return data.academicPeriods.map((x) => ({ Kode: x.code, Periode: x.name, Tahun: findName(data.academicYears, x.academicYearId), Mulai: x.startDate.slice(0, 10), Selesai: x.endDate.slice(0, 10) }));
  if (tab === 'study-systems') return data.studySystems.map((x) => ({ Kode: x.code, 'Sistem Kuliah': x.name }));
  if (tab === 'student-classes') return data.studentClasses.map((x) => ({ Kode: x.code, 'Kelas Mahasiswa': x.name }));
  if (tab === 'student-statuses') return data.studentStatuses.map((x) => ({ Kode: x.code, Status: x.name }));
  if (tab === 'lecturers') return data.lecturers.map((x) => ({ NIDN: x.nidn, Nama: x.name, Prodi: x.studyProgram?.name || '-' }));
  if (tab === 'students') return data.students.map((x) => ({ NIM: x.nim, Nama: x.name, Semester: String(x.currentSemester || 1), Status: x.status }));
  return data.parents.map((x) => ({ Nama: x.name, Relasi: x.relation, Mahasiswa: findStudentName(data.students, x.studentId) }));
}

function getTabCount(tab: MasterKey, data: MasterDataBag): number {
  return getRows(tab, data).length;
}

function findName(items: Array<{ id: string; name: string }>, id?: string) {
  return items.find((item) => item.id === id)?.name || '-';
}

function findStudentName(items: Student[], id?: string) {
  const student = items.find((item) => item.id === id);
  return student ? `${student.nim} - ${student.name}` : '-';
}

function DataTable({
  tab,
  data,
  onOpenStudyProgramDetail
}: {
  tab: MasterKey;
  data: MasterDataBag;
  onOpenStudyProgramDetail?: (id: string) => void;
}) {
  if (tab === 'faculties') return <FacultyDataView data={data} onOpenStudyProgramDetail={onOpenStudyProgramDetail} />;

  const rows = getRows(tab, data);
  const headers = Object.keys(rows[0] || {});
  if (rows.length === 0) return <p className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">Belum ada data.</p>;
  return (
    <div className="max-h-[520px] overflow-auto rounded border border-slate-200">
      <table className="min-w-full border-collapse text-left text-sm">
        <thead className="sticky top-0 bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-600">
          <tr>
            <th className="w-12 border-b border-slate-200 px-3 py-2">No</th>
            {headers.map((header) => <th key={header} className="border-b border-slate-200 px-3 py-2">{header}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={`${tab}-${index}`} className="odd:bg-white even:bg-slate-50">
              <td className="border-b border-slate-100 px-3 py-2 text-slate-500">{index + 1}</td>
              {headers.map((header) => <td key={header} className="border-b border-slate-100 px-3 py-2">{row[header] || '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FacultyDataView({ data, onOpenStudyProgramDetail }: { data: MasterDataBag; onOpenStudyProgramDetail?: (id: string) => void }) {
  if (data.faculties.length === 0) {
    return <p className="rounded border border-dashed border-slate-300 p-4 text-sm text-slate-500">Belum ada data fakultas.</p>;
  }

  return (
    <div className="space-y-4">
      {data.faculties.map((faculty) => (
        <details key={faculty.id} className="group rounded border border-slate-200 bg-white" open={data.faculties.length === 1}>
          <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 marker:hidden">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-teal-200 bg-teal-50 text-xs font-bold text-teal-800 group-open:hidden">+</span>
            <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded border border-teal-700 bg-teal-700 text-xs font-bold text-white group-open:flex">-</span>
            <h5 className="truncate text-sm font-semibold text-slate-950">{faculty.name}</h5>
          </summary>

          <div className="border-t border-slate-200">
            <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2 xl:grid-cols-5">
              <MiniMetric label="Kode" value={faculty.code} />
              <MiniMetric label="Akreditasi" value={faculty.accreditation || '-'} />
              <MiniMetric label="Student Body" value={String(faculty.studentBodyTotal || 0)} />
              <MiniMetric label="Prodi" value={String(faculty.studyPrograms?.length || 0)} />
              <MiniMetric label="Dosen" value={String(faculty.lecturers?.length || 0)} />
            </div>
            <div className="border-t border-slate-200 px-4 py-3">
              <InfoLine label="Universitas" value={findName(data.universities, faculty.universityId)} />
            </div>
            <div className="grid grid-cols-1 gap-2 p-4 md:grid-cols-2">
              <InfoLine label="Pimpinan Fakultas" value={faculty.leaderName || '-'} />
              <InfoLine label="Nomor Telepon Pimpinan" value={faculty.leaderPhone || '-'} />
            </div>

            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-4 xl:grid-cols-2">
              <div>
                <h6 className="mb-2 font-semibold text-slate-900">Student Body per Semester</h6>
                <SimpleTable
                  headers={['Semester', 'Jumlah Mahasiswa']}
                  rows={(faculty.studentBodyBySemester || []).map((item) => [`Semester ${item.semester}`, String(item.count)])}
                  empty="Belum ada mahasiswa pada fakultas ini."
                />
              </div>
              <div>
                <h6 className="mb-2 font-semibold text-slate-900">Program Studi</h6>
                <StudyProgramDropdowns faculty={faculty} onOpenStudyProgramDetail={onOpenStudyProgramDetail} />
              </div>
            </div>

            <div className="border-t border-slate-200 p-4">
              <h6 className="mb-2 font-semibold text-slate-900">Daftar Dosen berdasarkan Prodi</h6>
              <SimpleTable
                headers={['Prodi', 'NIDN', 'Nama Dosen']}
                rows={(faculty.lecturers || []).map((lecturer) => [`${lecturer.studyProgramCode} - ${lecturer.studyProgramName}`, lecturer.nidn, lecturer.name])}
                empty="Belum ada dosen homebase pada fakultas ini."
              />
            </div>
          </div>
        </details>
      ))}
    </div>
  );
}

function StudyProgramDropdowns({
  faculty,
  onOpenStudyProgramDetail
}: {
  faculty: Faculty;
  onOpenStudyProgramDetail?: (id: string) => void;
}) {
  const studyPrograms = faculty.studyPrograms || [];
  if (studyPrograms.length === 0) {
    return <p className="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500">Belum ada program studi.</p>;
  }

  return (
    <div className="space-y-2">
      {studyPrograms.map((studyProgram) => {
        const lecturers = (faculty.lecturers || []).filter((lecturer) => lecturer.studyProgramId === studyProgram.id);
        return (
          <details key={studyProgram.id} className="group rounded border border-slate-200 bg-white">
            <summary className="flex cursor-pointer list-none items-center gap-2 px-3 py-2 marker:hidden">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded border border-teal-200 bg-teal-50 text-xs font-bold text-teal-800 group-open:hidden">+</span>
              <span className="hidden h-6 w-6 shrink-0 items-center justify-center rounded border border-teal-700 bg-teal-700 text-xs font-bold text-white group-open:flex">-</span>
              <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-950">{studyProgram.name}</span>
              <span className="rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">{studyProgram.code}</span>
            </summary>

            <div className="border-t border-slate-200 p-3">
              <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                <MiniMetric label="Kode Prodi" value={studyProgram.code} />
                <MiniMetric label="Mahasiswa" value={String(studyProgram.studentCount || 0)} />
                <MiniMetric label="Dosen" value={String(lecturers.length)} />
              </div>
              <SimpleTable
                headers={['NIDN', 'Nama Dosen']}
                rows={lecturers.map((lecturer) => [lecturer.nidn, lecturer.name])}
                empty="Belum ada dosen homebase pada prodi ini."
              />
              <div className="mt-3">
                <button
                  type="button"
                  onClick={() => onOpenStudyProgramDetail?.(studyProgram.id)}
                  className="rounded bg-teal-700 px-3 py-2 text-sm font-semibold text-white hover:bg-teal-800"
                >
                  Detail Prodi
                </button>
              </div>
            </div>
          </details>
        );
      })}
    </div>
  );
}

function StudyProgramDetailPage({
  data,
  studyProgramId,
  onBack
}: {
  data: MasterDataBag;
  studyProgramId: string;
  onBack: () => void;
}) {
  const fromList = data.studyPrograms.find((item) => item.id === studyProgramId);
  const fromFaculty = data.faculties.flatMap((faculty) => faculty.studyPrograms || []).find((item) => item.id === studyProgramId);
  const studyProgram = fromList || fromFaculty;

  if (!studyProgram) {
    return (
      <div className="rounded border border-dashed border-slate-300 p-4">
        <p className="text-sm text-slate-500">Data prodi tidak ditemukan.</p>
        <button type="button" onClick={onBack} className="mt-3 rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">Kembali</button>
      </div>
    );
  }

  const faculty = data.faculties.find((item) => item.id === studyProgram.facultyId) || studyProgram.faculty || null;
  const degreeLevelName = findName(data.degreeLevels, studyProgram.degreeLevelId || '') || studyProgram.degreeLevelRef?.name || studyProgram.degreeLevel || '-';
  const lecturers = data.lecturers
    .filter((lecturer) => lecturer.studyProgramId === studyProgram.id)
    .sort((a, b) => a.name.localeCompare(b.name));
  const students = data.students
    .filter((student) => student.studyProgramId === studyProgram.id)
    .sort((a, b) => a.nim.localeCompare(b.nim));
  const semesterRows = Array.from(students.reduce((map, student) => {
    const semester = student.currentSemester || 1;
    map.set(semester, (map.get(semester) || 0) + 1);
    return map;
  }, new Map<number, number>()).entries())
    .sort(([a], [b]) => a - b)
    .map(([semester, count]) => [`Semester ${semester}`, String(count)]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal-700">Detail Program Studi</p>
          <h4 className="mt-1 text-2xl font-black text-slate-950">{studyProgram.name}</h4>
          <p className="mt-1 text-sm text-slate-500">{studyProgram.code} | {faculty?.name || '-'} | {degreeLevelName}</p>
        </div>
        <button type="button" onClick={onBack} className="w-fit rounded border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50">Kembali ke Fakultas</button>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-4">
        <MiniMetric label="Kode Prodi" value={studyProgram.code} />
        <MiniMetric label="Jenjang" value={degreeLevelName} />
        <MiniMetric label="Mahasiswa" value={String(students.length)} />
        <MiniMetric label="Dosen Homebase" value={String(lecturers.length)} />
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        <InfoLine label="Fakultas" value={faculty?.name || '-'} />
        <InfoLine label="Universitas" value={faculty ? findName(data.universities, faculty.universityId) : '-'} />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section>
          <h5 className="mb-2 font-semibold text-slate-900">Mahasiswa per Semester</h5>
          <SimpleTable headers={['Semester', 'Jumlah Mahasiswa']} rows={semesterRows} empty="Belum ada mahasiswa pada prodi ini." />
        </section>
        <section>
          <h5 className="mb-2 font-semibold text-slate-900">Dosen Homebase</h5>
          <SimpleTable headers={['NIDN', 'Nama Dosen']} rows={lecturers.map((lecturer) => [lecturer.nidn, lecturer.name])} empty="Belum ada dosen homebase pada prodi ini." />
        </section>
      </div>

      <section>
        <h5 className="mb-2 font-semibold text-slate-900">Daftar Mahasiswa</h5>
        <SimpleTable
          headers={['NIM', 'Nama Mahasiswa', 'Semester', 'Status']}
          rows={students.map((student) => [student.nim, student.name, String(student.currentSemester || 1), student.status])}
          empty="Belum ada mahasiswa pada prodi ini."
        />
      </section>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-0.5 font-bold text-slate-900">{value}</p>
    </div>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-slate-200 bg-slate-50 px-3 py-2 text-sm">
      <span className="text-slate-500">{label}: </span>
      <span className="font-semibold text-slate-900">{value}</span>
    </div>
  );
}

function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: string[][]; empty: string }) {
  if (rows.length === 0) return <p className="rounded border border-dashed border-slate-300 p-3 text-sm text-slate-500">{empty}</p>;
  return (
    <div className="overflow-auto rounded border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-600">
          <tr>{headers.map((header) => <th key={header} className="border-b border-slate-200 px-3 py-2">{header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.join('-') || index} className="odd:bg-white even:bg-slate-50">
              {row.map((cell, cellIndex) => <td key={`${cell}-${cellIndex}`} className="border-b border-slate-100 px-3 py-2">{cell || '-'}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
