'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { DashboardMenuGroup, DashboardShell } from '../../components/dashboard-shell';
import { clearSession, getSecureJson, getToken } from '../../lib/api';

const studentSubmenus = [
  { label: 'Daftar Mahasiswa', tab: 'daftar-mahasiswa' },
  { label: 'Detail Mahasiswa', tab: 'detail-mahasiswa' },
  { label: 'Biodata', tab: 'biodata' },
  { label: 'Status Semester', tab: 'status-semester' },
  { label: 'KRS', tab: 'krs' },
  { label: 'KHS', tab: 'khs' },
  { label: 'Transkrip', tab: 'transkrip' },
  { label: 'Riwayat Keuangan', tab: 'riwayat-keuangan' },
  { label: 'Konsentrasi/Peminatan', tab: 'konsentrasi-peminatan' },
  { label: 'Pindah/Transfer Prodi', tab: 'pindah-transfer-prodi' },
  { label: 'Nilai Konversi', tab: 'nilai-konversi' },
  { label: 'Aktivitas & Prestasi', tab: 'aktivitas-prestasi' },
  { label: 'Salin Mahasiswa', tab: 'salin-mahasiswa' }
] as const;

type PortalTab = (typeof studentSubmenus)[number]['tab'];
type MahasiswaSummary = { totalSks: number; ips: number; ipk: number; docs: number };
type StudentOption = {
  id: string;
  nim: string;
  name: string;
  currentSemester: number;
  studyProgram: { code: string; name: string };
};
type StudentDetail = {
  id?: string;
  nim: string;
  name: string;
  email: string;
  status: string;
  currentSemester: number;
  accountStatus: string;
  roleNames: string[];
  studyProgram: { code: string; name: string; degreeLevel: string; facultyCode: string; facultyName: string };
  studentClass: string;
  studentStatus: string;
  studySystem: string;
  parents: { id: string; name: string; relation: string; phone?: string | null }[];
};
type KhsRow = {
  classId: string;
  courseCode: string;
  courseName: string;
  className: string;
  sks: number;
  score: number | null;
  letter: string;
  isLocked: boolean;
};
type PortalData = {
  viewerRole?: string;
  canInspectAllStudents?: boolean;
  students?: StudentOption[];
  student: null | StudentDetail;
  activePeriod: null | { id: string; code: string; name: string; isActive: boolean };
  semesterStatus: null | {
    periodId?: string | null;
    periodName: string;
    krsStatus: string;
    krsLabel: string;
    plannedSks: number;
    classCount: number;
    gradedSks: number;
    lockedGradeCount: number;
    documentCount: number;
    activeClassRows: { classId: string; courseCode: string; courseName: string; className: string; sks: number }[];
  };
  khs: {
    periodId: string;
    periodCode: string;
    periodName: string;
    totalSks: number;
    ips: number;
    ipk: number;
    generated: boolean;
    rows: KhsRow[];
  }[];
  transcript?: null | { id: string; gpa: number; totalSks: number };
  documents?: { id: string; category: string; fileName: string; filePath: string; uploadedAt: string }[];
  finance?: {
    bills: { id: string; amount: number; type: string; status: string; createdAt: string }[];
    payments: { id: string; billId: string; amount: number; paidAt: string; method: string; status: string }[];
    virtualAccounts: { id: string; billId: string; vaNumber: string; provider: string; status: string }[];
  };
  activities?: { id: string; name: string; category: string; score: number | null; isShownInSkpi: boolean }[];
  mbkmActivities?: {
    id: string;
    type: string;
    partner: string;
    semester: string;
    conversions: { id: string; courseId: string; courseCode: string; courseName: string; sks: number; convertedScore: number }[];
  }[];
};

const emptyFinance = { bills: [], payments: [], virtualAccounts: [] };
const emptyPortal: PortalData = {
  student: null,
  activePeriod: null,
  semesterStatus: null,
  khs: [],
  transcript: null,
  documents: [],
  finance: emptyFinance,
  activities: [],
  mbkmActivities: []
};

export default function MahasiswaPage() {
  const [summary, setSummary] = useState<MahasiswaSummary>({ totalSks: 0, ips: 0, ipk: 0, docs: 0 });
  const [portal, setPortal] = useState<PortalData>(emptyPortal);
  const [activeTab, setActiveTab] = useState<PortalTab>('daftar-mahasiswa');
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const requestedTab = normalizePortalTab(params.get('tab'));
    const requestedStudentId = params.get('studentId');
    setActiveTab(requestedTab);
    if (requestedStudentId) setSelectedStudentId(requestedStudentId);
  }, []);

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const portalPath = selectedStudentId
      ? `/dashboard/secure/mahasiswa/portal?studentId=${encodeURIComponent(selectedStudentId)}`
      : '/dashboard/secure/mahasiswa/portal';
    Promise.all([
      getSecureJson<MahasiswaSummary>('/dashboard/secure/mahasiswa', summary),
      getSecureJson<PortalData>(portalPath, emptyPortal)
    ]).then(([summaryData, portalData]) => {
      setSummary(summaryData);
      setPortal(portalData);
      if (!selectedStudentId && portalData.student?.id) setSelectedStudentId(portalData.student.id);
    }).finally(() => setLoading(false));
  }, [selectedStudentId]);

  const loggedIn = Boolean(getToken());
  const metrics = useMemo(() => buildMetrics(summary, portal), [summary, portal]);

  const selectTab = (tab: PortalTab) => {
    setActiveTab(tab);
    updatePortalQuery(tab);
  };

  const selectStudent = (studentId: string) => {
    setSelectedStudentId(studentId);
    updatePortalQuery(activeTab, studentId);
  };

  const menuGroups = useMemo<DashboardMenuGroup[]>(() => [
    {
      label: 'Portal',
      description: 'Pusat data pengguna',
      defaultOpen: true,
      items: [
        {
          label: 'Mahasiswa',
          active: true,
          children: studentSubmenus.map((item) => ({
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
        { label: 'KRS', active: activeTab === 'krs', onClick: () => selectTab('krs') },
        { label: 'KHS', active: activeTab === 'khs', onClick: () => selectTab('khs') },
        { label: 'Transkrip', active: activeTab === 'transkrip', onClick: () => selectTab('transkrip') }
      ]
    },
    {
      label: 'Kemahasiswaan',
      items: [
        { label: 'Aktivitas & Prestasi', active: activeTab === 'aktivitas-prestasi', onClick: () => selectTab('aktivitas-prestasi') },
        { label: 'Nilai Konversi', active: activeTab === 'nilai-konversi', onClick: () => selectTab('nilai-konversi') }
      ]
    },
    {
      label: 'Laporan',
      items: [
        { label: 'KHS', active: activeTab === 'khs', onClick: () => selectTab('khs') },
        { label: 'Transkrip', active: activeTab === 'transkrip', onClick: () => selectTab('transkrip') }
      ]
    }
  ], [activeTab]);

  return (
    <DashboardShell title="Portal Mahasiswa" menuGroups={menuGroups}>
      <div className="p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#42b429]">Portal Mahasiswa</p>
            <h2 className="mt-1 text-2xl font-black text-slate-950">{tabTitle(activeTab)}</h2>
            <p className="mt-1 text-sm text-slate-500">Detail akademik, KRS/KHS, transkrip, keuangan, dan aktivitas mahasiswa.</p>
          </div>
          {loggedIn ? (
            <button onClick={() => { clearSession(); location.href = '/login'; }} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">Logout</button>
          ) : null}
        </div>

        {loggedIn && portal.canInspectAllStudents ? (
          <section className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Mode {portal.viewerRole || 'Admin'}</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">Lihat Detail Mahasiswa</h3>
                <p className="mt-1 text-sm text-slate-500">Pilih mahasiswa untuk membuka semua submenu portal.</p>
              </div>
              <label className="min-w-full text-sm font-bold text-slate-700 md:min-w-[360px]">
                Mahasiswa
                <select
                  value={selectedStudentId}
                  onChange={(event) => selectStudent(event.target.value)}
                  className="mt-1 w-full rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-100"
                >
                  {(portal.students || []).map((student) => (
                    <option key={student.id} value={student.id}>
                      {student.nim} - {student.name} ({student.studyProgram.code}, smt {student.currentSemester})
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>
        ) : null}

        {!loggedIn ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Silakan <Link href="/login" className="font-semibold underline">login</Link> untuk melihat data portal mahasiswa.</p>
        ) : loading ? (
          <p className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">Memuat data mahasiswa...</p>
        ) : !portal.student ? (
          <p className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">Akun ini belum terhubung ke data mahasiswa.</p>
        ) : (
          <>
            <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-4">
              <Metric label="Total SKS Tempuh" value={metrics.totalSks} />
              <Metric label="IPS Terakhir" value={metrics.ips.toFixed(2)} />
              <Metric label="IPK Sementara" value={metrics.ipk.toFixed(2)} />
              <Metric label="Dokumen" value={metrics.docs} />
            </div>

            <div className="mt-5 flex flex-wrap gap-2 border-b border-slate-200 pb-3">
              {studentSubmenus.map((item) => (
                <TabButton key={item.tab} label={item.label} active={activeTab === item.tab} onClick={() => selectTab(item.tab)} />
              ))}
            </div>

            {renderPortalTab(activeTab, portal, selectedStudentId, selectStudent)}
          </>
        )}
      </div>
    </DashboardShell>
  );
}

function DaftarMahasiswaView({
  data,
  selectedStudentId,
  onSelect
}: {
  data: PortalData;
  selectedStudentId: string;
  onSelect: (studentId: string) => void;
}) {
  const current = data.student;
  const students = data.canInspectAllStudents
    ? data.students || []
    : current
      ? [{ id: current.id || '', nim: current.nim, name: current.name, currentSemester: current.currentSemester, studyProgram: current.studyProgram }]
      : [];

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Daftar Mahasiswa" description="Daftar mahasiswa yang bisa dibuka pada portal detail." />
      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-600">
            <tr>
              <th className="px-3 py-3">NIM</th>
              <th className="px-3 py-3">Nama</th>
              <th className="px-3 py-3">Program Studi</th>
              <th className="px-3 py-3">Semester</th>
              <th className="px-3 py-3">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {students.length ? students.map((student) => {
              const active = student.id === selectedStudentId;
              return (
                <tr key={student.id || student.nim}>
                  <td className="px-3 py-3 font-bold text-slate-900">{student.nim}</td>
                  <td className="px-3 py-3 text-slate-700">{student.name}</td>
                  <td className="px-3 py-3 text-slate-700">{student.studyProgram.code} - {student.studyProgram.name}</td>
                  <td className="px-3 py-3 text-slate-700">{student.currentSemester}</td>
                  <td className="px-3 py-3">
                    <button
                      type="button"
                      onClick={() => student.id && onSelect(student.id)}
                      className={`rounded-lg px-3 py-1.5 text-xs font-bold ${active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {active ? 'Dipilih' : 'Buka Detail'}
                    </button>
                  </td>
                </tr>
              );
            }) : (
              <tr><td colSpan={5} className="px-3 py-6 text-center text-slate-500">Belum ada data mahasiswa.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function DetailMahasiswaView({ data }: { data: PortalData }) {
  const student = data.student!;
  const latestKhs = data.khs[0];
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Detail Mahasiswa" description="Ringkasan data utama dari seluruh layanan akademik." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="NIM" value={student.nim} />
          <Info label="Nama Mahasiswa" value={student.name} />
          <Info label="Email Login" value={student.email} />
          <Info label="Status Mahasiswa" value={student.studentStatus} />
          <Info label="Program Studi" value={student.studyProgram.name} helper={student.studyProgram.code} />
          <Info label="Fakultas" value={student.studyProgram.facultyName} helper={student.studyProgram.facultyCode} />
          <Info label="Semester" value={student.currentSemester} />
          <Info label="Kelas" value={student.studentClass} />
          <Info label="Status KRS" value={data.semesterStatus?.krsLabel || '-'} />
          <Info label="IPK" value={(data.transcript?.gpa ?? latestKhs?.ipk ?? 0).toFixed(2)} />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <SectionTitle title="Periode Aktif" description="Posisi akademik saat ini." />
          <p className="mt-4 text-sm font-bold text-slate-950">{data.activePeriod?.name || data.semesterStatus?.periodName || '-'}</p>
          <p className="mt-1 text-xs text-slate-500">SKS rencana: {data.semesterStatus?.plannedSks ?? 0}</p>
        </section>
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle title="Dokumen" description="Berkas mahasiswa yang tercatat." />
          <div className="mt-3 grid gap-2">
            {(data.documents || []).length ? (data.documents || []).map((document) => (
              <div key={document.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{document.category}</p>
                <p className="text-xs text-slate-500">{document.fileName}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Belum ada dokumen.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}

function BiodataView({ data }: { data: PortalData }) {
  const student = data.student!;
  return (
    <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Biodata Akademik" description="Identitas utama mahasiswa untuk layanan akademik." />
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <Info label="NIM" value={student.nim} />
          <Info label="Nama Mahasiswa" value={student.name} />
          <Info label="Email Login" value={student.email} />
          <Info label="Status Akun" value={student.accountStatus} />
          <Info label="Fakultas" value={student.studyProgram.facultyName} helper={student.studyProgram.facultyCode} />
          <Info label="Program Studi" value={student.studyProgram.name} helper={student.studyProgram.code} />
          <Info label="Jenjang" value={student.studyProgram.degreeLevel} />
          <Info label="Sistem Kuliah" value={student.studySystem} />
          <Info label="Kelas Mahasiswa" value={student.studentClass} />
          <Info label="Status Mahasiswa" value={student.studentStatus} />
        </div>
      </section>

      <aside className="space-y-4">
        <section className="rounded-xl border border-slate-200 bg-slate-50 p-5">
          <SectionTitle title="Role & Semester" description="Status akses dan posisi akademik saat ini." />
          <div className="mt-3 flex flex-wrap gap-2">
            {student.roleNames.map((role) => <span key={role} className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-100">{role}</span>)}
          </div>
          <p className="mt-4 text-sm text-slate-500">Semester aktif mahasiswa</p>
          <p className="text-3xl font-black text-slate-950">{student.currentSemester}</p>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <SectionTitle title="Orang Tua/Wali" description="Kontak keluarga yang tercatat." />
          <div className="mt-3 grid gap-2">
            {student.parents.length ? student.parents.map((parent) => (
              <div key={parent.id} className="rounded-lg border border-slate-100 bg-slate-50 p-3">
                <p className="font-bold text-slate-900">{parent.name}</p>
                <p className="text-xs text-slate-500">{parent.relation} | {parent.phone || '-'}</p>
              </div>
            )) : <p className="text-sm text-slate-500">Belum ada data orang tua/wali.</p>}
          </div>
        </section>
      </aside>
    </div>
  );
}

function StatusSemesterView({ data }: { data: PortalData }) {
  const status = data.semesterStatus;
  if (!status) return <EmptyState text="Belum ada status semester untuk mahasiswa ini." />;

  return (
    <div className="mt-5 space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Periode" value={status.periodName} compact />
        <Metric label="Status KRS" value={status.krsLabel} compact />
        <Metric label="SKS Rencana" value={status.plannedSks} compact />
        <Metric label="Nilai Terkunci" value={status.lockedGradeCount} compact />
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Mata Kuliah Semester Aktif" description="Daftar kelas dari KRS pada periode aktif." />
        <SimpleTable
          headers={['Kode', 'Mata Kuliah', 'Kelas', 'SKS']}
          rows={status.activeClassRows.map((row) => [row.courseCode, row.courseName, row.className, row.sks])}
          empty="Belum ada mata kuliah pada KRS semester aktif."
        />
      </section>
    </div>
  );
}

function KrsView({ data }: { data: PortalData }) {
  const status = data.semesterStatus;
  if (!status) return <EmptyState text="Belum ada KRS untuk mahasiswa ini." />;

  return (
    <div className="mt-5 space-y-4">
      <section className="grid gap-3 md:grid-cols-4">
        <Metric label="Periode" value={status.periodName} compact />
        <Metric label="Status KRS" value={status.krsLabel} compact />
        <Metric label="Jumlah Kelas" value={status.classCount} compact />
        <Metric label="Total SKS" value={status.plannedSks} compact />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Kartu Rencana Studi" description="Mata kuliah yang direncanakan pada semester aktif." />
        <SimpleTable
          headers={['Kode', 'Mata Kuliah', 'Kelas', 'SKS']}
          rows={status.activeClassRows.map((row) => [row.courseCode, row.courseName, row.className, row.sks])}
          empty="Belum ada KRS pada periode aktif."
        />
      </section>
    </div>
  );
}

function KhsView({ data }: { data: PortalData }) {
  if (!data.khs.length) return <EmptyState text="Belum ada nilai terkunci untuk ditampilkan di KHS." />;

  return (
    <div className="mt-5 space-y-4">
      {data.khs.map((period) => (
        <section key={period.periodId} className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#2f941d]">Kartu Hasil Studi</p>
              <h3 className="mt-1 text-xl font-black text-slate-950">{period.periodName}</h3>
              <p className="mt-1 text-sm text-slate-500">{period.generated ? 'KHS sudah digenerate.' : 'Ditampilkan dari nilai terkunci sementara.'}</p>
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <MiniScore label="SKS" value={period.totalSks} />
              <MiniScore label="IPS" value={period.ips.toFixed(2)} />
              <MiniScore label="IPK" value={period.ipk.toFixed(2)} />
            </div>
          </div>
          <SimpleTable
            headers={['Kode', 'Mata Kuliah', 'Kelas', 'SKS', 'Nilai', 'Huruf', 'Status']}
            rows={period.rows.map((row) => [row.courseCode, row.courseName, row.className, row.sks, row.score ?? '-', row.letter, row.isLocked ? 'Terkunci' : 'Belum final'])}
            empty="Belum ada rincian nilai."
          />
        </section>
      ))}
    </div>
  );
}

function TranskripView({ data }: { data: PortalData }) {
  const rows = data.khs.flatMap((period) => period.rows
    .filter((row) => row.isLocked)
    .map((row) => [period.periodName, row.courseCode, row.courseName, row.sks, row.score ?? '-', row.letter]));

  return (
    <div className="mt-5 space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Total SKS" value={data.transcript?.totalSks ?? rows.reduce((total, row) => total + Number(row[3] || 0), 0)} compact />
        <Metric label="IPK" value={(data.transcript?.gpa ?? data.khs[0]?.ipk ?? 0).toFixed(2)} compact />
        <Metric label="Mata Kuliah" value={rows.length} compact />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Transkrip Nilai" description="Akumulasi nilai mata kuliah yang sudah final." />
        <SimpleTable
          headers={['Periode', 'Kode', 'Mata Kuliah', 'SKS', 'Nilai', 'Huruf']}
          rows={rows}
          empty="Belum ada nilai final untuk transkrip."
        />
      </section>
    </div>
  );
}

function RiwayatKeuanganView({ data }: { data: PortalData }) {
  const finance = data.finance || emptyFinance;
  const totalBill = finance.bills.reduce((total, bill) => total + bill.amount, 0);
  const totalPaid = finance.payments.reduce((total, payment) => total + payment.amount, 0);

  return (
    <div className="mt-5 space-y-4">
      <section className="grid gap-3 md:grid-cols-3">
        <Metric label="Total Tagihan" value={formatCurrency(totalBill)} compact />
        <Metric label="Total Bayar" value={formatCurrency(totalPaid)} compact />
        <Metric label="Sisa" value={formatCurrency(Math.max(totalBill - totalPaid, 0))} compact />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Tagihan Mahasiswa" description="Daftar tagihan yang tercatat pada mahasiswa." />
        <SimpleTable
          headers={['Tanggal', 'Jenis', 'Nominal', 'Status']}
          rows={finance.bills.map((bill) => [formatDate(bill.createdAt), bill.type, formatCurrency(bill.amount), bill.status])}
          empty="Belum ada tagihan."
        />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Pembayaran & Virtual Account" description="Riwayat pembayaran dan nomor VA." />
        <SimpleTable
          headers={['Tanggal', 'Metode', 'Nominal', 'Status']}
          rows={finance.payments.map((payment) => [formatDate(payment.paidAt), payment.method, formatCurrency(payment.amount), payment.status])}
          empty="Belum ada pembayaran."
        />
        <SimpleTable
          headers={['Provider', 'Nomor VA', 'Status']}
          rows={finance.virtualAccounts.map((account) => [account.provider, account.vaNumber, account.status])}
          empty="Belum ada virtual account."
        />
      </section>
    </div>
  );
}

function KonsentrasiView({ data }: { data: PortalData }) {
  const student = data.student!;
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Konsentrasi/Peminatan" description="Data akademik peminatan mahasiswa." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Info label="Program Studi" value={student.studyProgram.name} helper={student.studyProgram.code} />
        <Info label="Jenjang" value={student.studyProgram.degreeLevel} />
        <Info label="Konsentrasi/Peminatan" value="Belum ditetapkan" />
        <Info label="Status Mahasiswa" value={student.studentStatus} />
      </div>
    </section>
  );
}

function PindahTransferView({ data }: { data: PortalData }) {
  const student = data.student!;
  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Pindah/Transfer Prodi" description="Status perpindahan dan program studi mahasiswa." />
      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <Info label="Program Studi Aktif" value={student.studyProgram.name} helper={student.studyProgram.code} />
        <Info label="Fakultas" value={student.studyProgram.facultyName} helper={student.studyProgram.facultyCode} />
        <Info label="Semester" value={student.currentSemester} />
        <Info label="Status Pengajuan" value="Tidak ada pengajuan aktif" />
      </div>
    </section>
  );
}

function NilaiKonversiView({ data }: { data: PortalData }) {
  const rows = (data.mbkmActivities || []).flatMap((activity) => activity.conversions.map((conversion) => [
    activity.semester,
    activity.type,
    activity.partner,
    conversion.courseCode,
    conversion.courseName,
    conversion.sks,
    conversion.convertedScore
  ]));

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Nilai Konversi" description="Konversi nilai dari aktivitas MBKM atau kegiatan pendukung." />
      <SimpleTable
        headers={['Semester', 'Aktivitas', 'Mitra', 'Kode MK', 'Mata Kuliah', 'SKS', 'Nilai']}
        rows={rows}
        empty="Belum ada nilai konversi."
      />
    </section>
  );
}

function AktivitasPrestasiView({ data }: { data: PortalData }) {
  return (
    <div className="mt-5 space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Aktivitas & Prestasi" description="Kegiatan mahasiswa dan status tampil di SKPI." />
        <SimpleTable
          headers={['Kategori', 'Nama Kegiatan', 'Skor', 'SKPI']}
          rows={(data.activities || []).map((activity) => [activity.category, activity.name, activity.score ?? '-', activity.isShownInSkpi ? 'Ya' : 'Tidak'])}
          empty="Belum ada aktivitas atau prestasi."
        />
      </section>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <SectionTitle title="Aktivitas MBKM" description="Kegiatan Kampus Merdeka mahasiswa." />
        <SimpleTable
          headers={['Semester', 'Jenis', 'Mitra', 'Konversi']}
          rows={(data.mbkmActivities || []).map((activity) => [activity.semester, activity.type, activity.partner, activity.conversions.length])}
          empty="Belum ada aktivitas MBKM."
        />
      </section>
    </div>
  );
}

function SalinMahasiswaView({ data }: { data: PortalData }) {
  if (!data.canInspectAllStudents) return <EmptyState text="Menu salin mahasiswa tersedia untuk role admin." />;
  const student = data.student!;
  const rows = [
    ['Identitas', `${student.nim} - ${student.name}`, student.email],
    ['Akademik', student.studyProgram.name, `Semester ${student.currentSemester}`],
    ['Keluarga', `${student.parents.length} kontak`, student.parents.map((parent) => parent.name).join(', ') || '-'],
    ['Dokumen', `${data.documents?.length || 0} berkas`, data.documents?.map((document) => document.category).join(', ') || '-']
  ];

  return (
    <section className="mt-5 rounded-xl border border-slate-200 bg-white p-5">
      <SectionTitle title="Salin Mahasiswa" description="Pratinjau sumber data mahasiswa yang dipilih." />
      <SimpleTable
        headers={['Kelompok Data', 'Sumber', 'Rincian']}
        rows={rows}
        empty="Belum ada data sumber."
      />
    </section>
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

function MiniScore({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="min-w-[74px] rounded-lg bg-white px-3 py-2 shadow-sm ring-1 ring-slate-200">
      <p className="text-[11px] font-bold uppercase text-slate-500">{label}</p>
      <p className="text-lg font-black text-slate-950">{value}</p>
    </div>
  );
}

function SimpleTable({ headers, rows, empty }: { headers: string[]; rows: (string | number)[][]; empty: string }) {
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

function EmptyState({ text }: { text: string }) {
  return <p className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">{text}</p>;
}

function renderPortalTab(tab: PortalTab, data: PortalData, selectedStudentId: string, onSelect: (studentId: string) => void) {
  switch (tab) {
    case 'daftar-mahasiswa':
      return <DaftarMahasiswaView data={data} selectedStudentId={selectedStudentId} onSelect={onSelect} />;
    case 'detail-mahasiswa':
      return <DetailMahasiswaView data={data} />;
    case 'biodata':
      return <BiodataView data={data} />;
    case 'status-semester':
      return <StatusSemesterView data={data} />;
    case 'krs':
      return <KrsView data={data} />;
    case 'khs':
      return <KhsView data={data} />;
    case 'transkrip':
      return <TranskripView data={data} />;
    case 'riwayat-keuangan':
      return <RiwayatKeuanganView data={data} />;
    case 'konsentrasi-peminatan':
      return <KonsentrasiView data={data} />;
    case 'pindah-transfer-prodi':
      return <PindahTransferView data={data} />;
    case 'nilai-konversi':
      return <NilaiKonversiView data={data} />;
    case 'aktivitas-prestasi':
      return <AktivitasPrestasiView data={data} />;
    case 'salin-mahasiswa':
      return <SalinMahasiswaView data={data} />;
  }
}

function tabTitle(tab: PortalTab) {
  if (tab === 'khs') return 'Kartu Hasil Studi';
  return studentSubmenus.find((item) => item.tab === tab)?.label || 'Portal Mahasiswa';
}

function normalizePortalTab(value: string | null): PortalTab {
  const found = studentSubmenus.find((item) => item.tab === value);
  return found?.tab || 'daftar-mahasiswa';
}

function updatePortalQuery(tab: PortalTab, studentId?: string) {
  const url = new URL(window.location.href);
  url.searchParams.set('tab', tab);
  if (studentId !== undefined) {
    if (studentId) url.searchParams.set('studentId', studentId);
    else url.searchParams.delete('studentId');
  }
  window.history.replaceState(null, '', `${url.pathname}${url.search}`);
}

function buildMetrics(summary: MahasiswaSummary, portal: PortalData): MahasiswaSummary {
  const latestKhs = portal.khs[0];
  if (!portal.student) return summary;
  return {
    totalSks: portal.transcript?.totalSks ?? latestKhs?.totalSks ?? summary.totalSks,
    ips: latestKhs?.ips ?? summary.ips,
    ipk: portal.transcript?.gpa ?? latestKhs?.ipk ?? summary.ipk,
    docs: portal.documents?.length ?? portal.semesterStatus?.documentCount ?? summary.docs
  };
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}
