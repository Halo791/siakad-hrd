'use client';

import Link from 'next/link';
import { type ReactNode, useEffect, useMemo, useState } from 'react';
import { DashboardMenuGroup, DashboardShell } from '../../components/dashboard-shell';
import { clearSession, getSecureJson, getToken } from '../../lib/api';

const dosenSubmenus = [
  { label: 'Daftar Pegawai/Dosen', tab: 'daftar-pegawai-dosen' },
  { label: 'Detail Pegawai', tab: 'detail-pegawai' },
  { label: 'Pembimbing', tab: 'pembimbing' },
  { label: 'Tanda Tangan/NIDN/NIDK/NUPN', tab: 'identitas-dosen' }
] as const;

type DosenTab = (typeof dosenSubmenus)[number]['tab'];
type DosenSummary = { classes: number; unlockedGrades: number; pendingKrs: number };
type LecturerOption = {
  id: string;
  nidn: string;
  name: string;
  studyProgram: null | { code: string; name: string };
};
type StructuralPosition = {
  id: string;
  code: string;
  name: string;
  level: string;
  decreeNumber?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive: boolean;
  facultyName?: string | null;
  studyProgramName?: string | null;
};
type TeachingClass = {
  id: string;
  classLecturerId: string;
  isPrimary: boolean;
  name: string;
  periodCode: string;
  periodName: string;
  courseCode: string;
  courseName: string;
  sks: number;
  capacity: number;
  participantCount: number;
  schedules: { id: string; dayOfWeek: number; startTime: string; endTime: string; room: string }[];
};
type DosenPortalData = {
  viewerRole?: string;
  canInspectAllLecturers?: boolean;
  lecturers?: LecturerOption[];
  lecturer: null | {
    id: string;
    nidn: string;
    name: string;
    email: string;
    accountStatus: string;
    roleNames: string[];
    studyProgram: null | { code: string; name: string; degreeLevel: string; facultyCode: string; facultyName: string };
    structuralPositions: StructuralPosition[];
  };
  activePeriod: null | { id: string; code: string; name: string; isActive: boolean };
  teaching: {
    classes: TeachingClass[];
    activeClassCount: number;
    totalSks: number;
    studentCount: number;
  };
  advisories: {
    students: {
      id: string;
      studentId: string;
      nim: string;
      name: string;
      currentSemester: number;
      status: string;
      studyProgram: null | { code: string; name: string };
    }[];
    consultationCount: number;
    consultations: { id: string; studentId: string; studentNim: string; studentName: string; message: string; createdAt: string }[];
  };
  identity: { nidn: string | null; nidk: string | null; nupn: string | null; signatureStatus: string };
};

const emptyPortal: DosenPortalData = {
  lecturer: null,
  activePeriod: null,
  teaching: { classes: [], activeClassCount: 0, totalSks: 0, studentCount: 0 },
  advisories: { students: [], consultationCount: 0, consultations: [] },
  identity: { nidn: null, nidk: null, nupn: null, signatureStatus: 'Belum tercatat' }
};

export default function DosenPage() {
  const [summary, setSummary] = useState<DosenSummary>({ classes: 0, unlockedGrades: 0, pendingKrs: 0 });
  const [portal, setPortal] = useState<DosenPortalData>(emptyPortal);
  const [activeTab, setActiveTab] = useState<DosenTab>('daftar-pegawai-dosen');
  const [selectedLecturerId, setSelectedLecturerId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setActiveTab(normalizeDosenTab(params.get('tab')));
    const lecturerId = params.get('lecturerId');
    if (lecturerId) setSelectedLecturerId(lecturerId);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const portalPath = selectedLecturerId
      ? `/dashboard/secure/dosen/portal?lecturerId=${encodeURIComponent(selectedLecturerId)}`
      : '/dashboard/secure/dosen/portal';

    Promise.all([
      getSecureJson<DosenSummary>('/dashboard/secure/dosen', summary),
      getSecureJson<DosenPortalData>(portalPath, emptyPortal)
    ]).then(([summaryData, portalData]) => {
      setSummary(summaryData);
      setPortal(portalData);
      if (!selectedLecturerId && portalData.lecturer?.id) setSelectedLecturerId(portalData.lecturer.id);
    }).finally(() => setLoading(false));
  }, [selectedLecturerId]);

  const loggedIn = Boolean(getToken());
  const metrics = useMemo(() => ({
    classes: portal.lecturer ? portal.teaching.activeClassCount : summary.classes,
    pendingKrs: portal.advisories.students.length || summary.pendingKrs,
    unlockedGrades: summary.unlockedGrades,
    totalSks: portal.teaching.totalSks
  }), [portal, summary]);

  const selectTab = (tab: DosenTab) => {
    setActiveTab(tab);
    updateDosenQuery(tab);
  };

  const selectLecturer = (lecturerId: string) => {
    setSelectedLecturerId(lecturerId);
    updateDosenQuery(activeTab, lecturerId);
  };

  const menuGroups = useMemo<DashboardMenuGroup[]>(() => [
    {
      label: 'Portal',
      description: 'Pusat data pengguna',
      defaultOpen: true,
      items: [
        {
          label: 'Pegawai',
          active: true,
          children: dosenSubmenus.map((item) => ({
            label: item.label,
            active: activeTab === item.tab,
            onClick: () => selectTab(item.tab)
          }))
        }
      ]
    },
    {
      label: 'Perkuliahan',
      items: [
        { label: 'Jadwal Mengajar', active: activeTab === 'detail-pegawai', onClick: () => selectTab('detail-pegawai') },
        { label: 'Pembimbing', active: activeTab === 'pembimbing', onClick: () => selectTab('pembimbing') }
      ]
    },
    {
      label: 'Data Pelengkap',
      items: [{ label: 'Identitas Dosen', active: activeTab === 'identitas-dosen', onClick: () => selectTab('identitas-dosen') }]
    }
  ], [activeTab]);

  return (
    <DashboardShell title="Portal Pegawai/Dosen" menuGroups={menuGroups}>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#42b429]">Portal Pegawai</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{tabTitle(activeTab)}</h2>
            <p className="mt-1 text-sm text-slate-500">Data dosen, homebase, jabatan struktural, kelas mengajar, dan pembimbing akademik.</p>
          </div>
          {loggedIn ? (
            <button onClick={() => { clearSession(); location.href = '/login'; }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Logout</button>
          ) : null}
        </div>

        {loggedIn && portal.canInspectAllLecturers ? (
          <section className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Mode {portal.viewerRole || 'Admin'}</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Lihat Detail Pegawai/Dosen</h3>
                <p className="mt-1 text-sm text-slate-500">Pilih dosen untuk membuka seluruh submenu pegawai.</p>
              </div>
              <label className="min-w-full text-sm font-bold text-slate-700 md:min-w-[360px]">
                Pegawai/Dosen
                <select
                  value={selectedLecturerId}
                  onChange={(event) => selectLecturer(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {(portal.lecturers || []).map((lecturer) => (
                    <option key={lecturer.id} value={lecturer.id}>
                      {lecturer.nidn} - {lecturer.name} ({lecturer.studyProgram?.code || 'Non-homebase'})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {!loggedIn ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Silakan <Link href="/login" className="font-semibold underline">login</Link> untuk melihat data pegawai/dosen.</p>
        ) : loading ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Memuat data pegawai/dosen...</p>
        ) : !portal.lecturer ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Akun ini belum terhubung ke data dosen.</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
              <Metric label="Kelas Diampu" value={metrics.classes} />
              <Metric label="SKS Aktif" value={metrics.totalSks} />
              <Metric label="Mahasiswa Bimbingan" value={portal.advisories.students.length} />
              <Metric label="Nilai Belum Lock" value={metrics.unlockedGrades} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {dosenSubmenus.map((item) => (
                <TabButton key={item.tab} label={item.label} active={activeTab === item.tab} onClick={() => selectTab(item.tab)} />
              ))}
            </div>

            {renderDosenTab(activeTab, portal, selectedLecturerId, selectLecturer)}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function DaftarPegawaiView({
  data,
  selectedLecturerId,
  onSelect
}: {
  data: DosenPortalData;
  selectedLecturerId: string;
  onSelect: (lecturerId: string) => void;
}) {
  const current = data.lecturer;
  const lecturers = data.canInspectAllLecturers
    ? data.lecturers || []
    : current
      ? [{ id: current.id, nidn: current.nidn, name: current.name, studyProgram: current.studyProgram }]
      : [];

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Daftar Pegawai/Dosen" description="Daftar dosen yang dapat dibuka pada portal pegawai." />
      <SimpleTable
        headers={['NIDN', 'Nama', 'Homebase', 'Aksi']}
        rows={lecturers.map((lecturer) => [
          lecturer.nidn,
          lecturer.name,
          lecturer.studyProgram ? `${lecturer.studyProgram.code} - ${lecturer.studyProgram.name}` : '-',
          <button
            key={lecturer.id}
            type="button"
            onClick={() => onSelect(lecturer.id)}
            className={`rounded-lg px-3 py-1.5 text-xs font-bold ${lecturer.id === selectedLecturerId ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
          >
            {lecturer.id === selectedLecturerId ? 'Dipilih' : 'Buka Detail'}
          </button>
        ])}
        empty="Belum ada data pegawai/dosen."
      />
    </section>
  );
}

function DetailPegawaiView({ data }: { data: DosenPortalData }) {
  const lecturer = data.lecturer!;
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Detail Pegawai" description="Identitas utama, homebase, jabatan, dan kelas mengajar." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="NIDN" value={lecturer.nidn} />
          <Info label="Nama Pegawai/Dosen" value={lecturer.name} />
          <Info label="Email Login" value={lecturer.email} />
          <Info label="Status Akun" value={lecturer.accountStatus} />
          <Info label="Homebase" value={lecturer.studyProgram?.name || '-'} helper={lecturer.studyProgram?.code} />
          <Info label="Fakultas" value={lecturer.studyProgram?.facultyName || '-'} helper={lecturer.studyProgram?.facultyCode} />
          <Info label="Jenjang Prodi" value={lecturer.studyProgram?.degreeLevel || '-'} />
          <Info label="Periode Aktif" value={data.activePeriod?.name || '-'} />
        </div>

        <div className="mt-5">
          <SectionTitle title="Kelas Mengajar" description="Kelas dan jadwal yang diampu dosen." />
          <SimpleTable
            headers={['Periode', 'Kode', 'Mata Kuliah', 'Kelas', 'SKS', 'Peserta', 'Jadwal']}
            rows={data.teaching.classes.map((item) => [
              item.periodName,
              item.courseCode,
              item.courseName,
              item.name,
              item.sks,
              item.participantCount,
              item.schedules.map((schedule) => `${dayName(schedule.dayOfWeek)} ${schedule.startTime}-${schedule.endTime} ${schedule.room}`).join(', ') || '-'
            ])}
            empty="Belum ada kelas mengajar."
          />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <SectionTitle title="Role" description="Role akses yang melekat pada akun." />
          <div className="mt-3 flex flex-wrap gap-2">
            {lecturer.roleNames.map((role) => <span key={role} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{role}</span>)}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle title="Jabatan Struktural" description="Penugasan aktif dan riwayat jabatan." />
          <div className="mt-3 grid gap-2">
            {lecturer.structuralPositions.length ? lecturer.structuralPositions.map((position) => (
              <div key={position.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{position.name}</p>
                <p className="text-xs text-slate-500">{position.level} | {position.decreeNumber || '-'}</p>
                <p className="text-xs text-slate-500">{position.studyProgramName || position.facultyName || '-'} | {position.isActive ? 'Aktif' : 'Nonaktif'}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Belum ada jabatan struktural.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}

function PembimbingView({ data }: { data: DosenPortalData }) {
  return (
    <div className="mt-5 space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Mahasiswa Bimbingan" value={data.advisories.students.length} compact />
        <Metric label="Konsultasi" value={data.advisories.consultationCount} compact />
        <Metric label="Kelas Aktif" value={data.teaching.activeClassCount} compact />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Mahasiswa Bimbingan" description="Daftar mahasiswa yang tercatat sebagai bimbingan akademik." />
        <SimpleTable
          headers={['NIM', 'Nama', 'Program Studi', 'Semester', 'Status']}
          rows={data.advisories.students.map((student) => [
            student.nim,
            student.name,
            student.studyProgram ? `${student.studyProgram.code} - ${student.studyProgram.name}` : '-',
            student.currentSemester,
            student.status
          ])}
          empty="Belum ada mahasiswa bimbingan."
        />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Konsultasi Akademik" description="Pesan konsultasi yang masuk untuk dosen pembimbing." />
        <SimpleTable
          headers={['Tanggal', 'NIM', 'Mahasiswa', 'Pesan']}
          rows={data.advisories.consultations.map((item) => [
            formatDate(item.createdAt),
            item.studentNim,
            item.studentName,
            item.message
          ])}
          empty="Belum ada konsultasi akademik."
        />
      </section>
    </div>
  );
}

function IdentitasDosenView({ data }: { data: DosenPortalData }) {
  const lecturer = data.lecturer!;
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Tanda Tangan/NIDN/NIDK/NUPN" description="Nomor identitas dosen dan status tanda tangan." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="NIDN" value={data.identity.nidn || lecturer.nidn || '-'} />
          <Info label="NIDK" value={data.identity.nidk || 'Belum tercatat'} />
          <Info label="NUPN" value={data.identity.nupn || 'Belum tercatat'} />
          <Info label="Tanda Tangan" value={data.identity.signatureStatus} />
          <Info label="Nama Dosen" value={lecturer.name} />
          <Info label="Email" value={lecturer.email} />
        </div>
      </section>

      <aside className="rounded-xl border border-slate-200 bg-slate-50 p-5">
        <SectionTitle title="Legalitas Jabatan" description="SK dan unit penugasan yang tercatat." />
        <div className="mt-3 grid gap-2">
          {lecturer.structuralPositions.length ? lecturer.structuralPositions.map((position) => (
            <div key={position.id} className="rounded-lg border border-slate-100 bg-white p-3">
              <p className="font-bold text-slate-900">{position.name}</p>
              <p className="text-xs text-slate-500">{position.decreeNumber || '-'} | {formatDate(position.startDate)}</p>
            </div>
          )) : <p className="text-sm text-slate-500">Belum ada data legalitas jabatan.</p>}
        </div>
      </aside>
    </div>
  );
}

function Metric({ label, value, compact = false }: { label: string; value: string | number; compact?: boolean }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className={`${compact ? 'text-lg' : 'text-2xl'} mt-1 font-black text-slate-950`}>{value}</p>
    </div>
  );
}

function TabButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return <button type="button" onClick={onClick} className={`rounded-lg px-4 py-2 text-sm font-bold ${active ? 'bg-[#42b429] text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>{label}</button>;
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-lg font-black text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function Info({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-900">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function SimpleTable({
  headers,
  rows,
  empty
}: {
  headers: string[];
  rows: ReactNode[][];
  empty: string;
}) {
  return (
    <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-600">
          <tr>{headers.map((header) => <th key={header} className="px-3 py-3">{header}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.length ? rows.map((row, rowIndex) => (
            <tr key={rowIndex}>{row.map((cell, cellIndex) => <td key={cellIndex} className="px-3 py-3 text-slate-700">{cell}</td>)}</tr>
          )) : (
            <tr><td colSpan={headers.length} className="px-3 py-6 text-center text-slate-500">{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function renderDosenTab(tab: DosenTab, data: DosenPortalData, selectedLecturerId: string, onSelect: (lecturerId: string) => void) {
  switch (tab) {
    case 'daftar-pegawai-dosen':
      return <DaftarPegawaiView data={data} selectedLecturerId={selectedLecturerId} onSelect={onSelect} />;
    case 'detail-pegawai':
      return <DetailPegawaiView data={data} />;
    case 'pembimbing':
      return <PembimbingView data={data} />;
    case 'identitas-dosen':
      return <IdentitasDosenView data={data} />;
  }
}

function normalizeDosenTab(value: string | null): DosenTab {
  const found = dosenSubmenus.find((item) => item.tab === value);
  return found?.tab || 'daftar-pegawai-dosen';
}

function tabTitle(tab: DosenTab) {
  return dosenSubmenus.find((item) => item.tab === tab)?.label || 'Portal Pegawai/Dosen';
}

function updateDosenQuery(tab: DosenTab, lecturerId?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  if (lecturerId !== undefined) {
    if (lecturerId) url.searchParams.set('lecturerId', lecturerId);
    else url.searchParams.delete('lecturerId');
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

function formatDate(value?: string | null) {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

function dayName(day: number) {
  const days: Record<number, string> = {
    1: 'Senin',
    2: 'Selasa',
    3: 'Rabu',
    4: 'Kamis',
    5: 'Jumat',
    6: 'Sabtu',
    7: 'Minggu'
  };
  return days[day] || `Hari ${day}`;
}
