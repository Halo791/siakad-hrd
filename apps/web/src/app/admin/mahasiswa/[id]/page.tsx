'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { secureGet } from '../../../../lib/api';

type RefItem = { id: string; code: string; name: string };
type Faculty = RefItem & { accreditation?: string | null; leaderName?: string | null; leaderPhone?: string | null };
type StudyProgram = RefItem & {
  degreeLevel?: string | null;
  faculty?: Faculty | null;
  degreeLevelRef?: RefItem | null;
};
type ParentRow = { id: string; name: string; relation: string; phone?: string | null };
type StudentDetail = {
  id: string;
  nim: string;
  name: string;
  status: string;
  currentSemester?: number;
  user?: {
    id: string;
    name: string;
    email: string;
    status?: string;
    role?: RefItem | null;
    userRoles?: Array<{ role?: RefItem | null }>;
  } | null;
  studyProgram?: StudyProgram | null;
  studentClass?: RefItem | null;
  studentStatus?: RefItem | null;
  studySystem?: RefItem | null;
  parents?: ParentRow[];
};

export default function StudentDetailPage() {
  const params = useParams<{ id: string }>();
  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError('');
    secureGet<StudentDetail>(`/master/students/${params.id}`)
      .then((payload) => {
        if (active) setStudent(payload);
      })
      .catch((e) => {
        if (active) setError(e instanceof Error ? e.message : 'Gagal memuat detail mahasiswa');
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [params.id]);

  const roles = useMemo(() => {
    if (!student?.user) return [];
    return [student.user.role, ...(student.user.userRoles || []).map((item) => item.role)]
      .filter(Boolean)
      .map((role) => role?.name)
      .filter((value, index, array) => value && array.indexOf(value) === index) as string[];
  }, [student]);

  return (
    <main className="min-h-screen bg-[#f5faf8] px-4 py-6 text-slate-900 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-teal-700">Portal &gt; Mahasiswa &gt; Detail Mahasiswa</p>
            <h1 className="mt-2 text-2xl font-bold text-slate-950">Detail Mahasiswa</h1>
            <p className="mt-1 text-sm text-slate-500">Profil akademik, akun login, prodi, status semester, dan kontak orang tua/wali.</p>
          </div>
          <Link href="/admin" className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Kembali ke Daftar
          </Link>
        </div>

        {loading ? <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">Memuat detail mahasiswa...</p> : null}
        {error ? <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</p> : null}

        {student ? (
          <div className="space-y-4">
            <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
              <div className="bg-gradient-to-r from-teal-700 to-emerald-500 p-5 text-white">
                <p className="font-mono text-sm text-teal-50">{student.nim}</p>
                <h2 className="mt-1 text-3xl font-bold">{student.name}</h2>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Badge tone="light">Semester {student.currentSemester || 1}</Badge>
                  <Badge tone="light">{student.status}</Badge>
                  {roles.map((role) => <Badge key={role} tone="light">{role}</Badge>)}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-0 md:grid-cols-4">
                <InfoBlock label="Fakultas" value={student.studyProgram?.faculty?.name || '-'} />
                <InfoBlock label="Program Studi" value={student.studyProgram?.name || '-'} helper={student.studyProgram?.code} />
                <InfoBlock label="Jenjang" value={student.studyProgram?.degreeLevelRef?.name || student.studyProgram?.degreeLevel || '-'} />
                <InfoBlock label="Status Mahasiswa" value={student.studentStatus?.name || student.status || '-'} helper={student.studentStatus?.code} />
              </div>
            </section>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200 lg:col-span-2">
                <SectionTitle title="Biodata Akademik" description="Data utama mahasiswa yang digunakan di KRS, KHS, transkrip, dan laporan akademik." />
                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                  <DetailItem label="NIM" value={student.nim} />
                  <DetailItem label="Nama Mahasiswa" value={student.name} />
                  <DetailItem label="Email Login" value={student.user?.email || '-'} />
                  <DetailItem label="Status Akun" value={student.user?.status || 'ACTIVE'} />
                  <DetailItem label="Kelas Mahasiswa" value={student.studentClass?.name || '-'} />
                  <DetailItem label="Sistem Kuliah" value={student.studySystem?.name || '-'} />
                  <DetailItem label="Akreditasi Fakultas" value={student.studyProgram?.faculty?.accreditation || '-'} />
                  <DetailItem label="Pimpinan Fakultas" value={student.studyProgram?.faculty?.leaderName || '-'} />
                </div>
              </section>

              <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                <SectionTitle title="Role & Akses" description="Role aktif yang melekat pada akun mahasiswa." />
                <div className="mt-4 flex flex-wrap gap-2">
                  {roles.length ? roles.map((role) => <Badge key={role}>{role}</Badge>) : <span className="text-sm text-slate-500">Belum ada role.</span>}
                </div>
              </section>
            </div>

            <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
              <SectionTitle title="Orang Tua / Wali" description="Kontak keluarga untuk monitoring akademik, keuangan, dan layanan orang tua." />
              <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full text-left text-sm">
                  <thead className="bg-slate-100 text-xs uppercase tracking-[0.08em] text-slate-600">
                    <tr>
                      <th className="px-3 py-3">No</th>
                      <th className="px-3 py-3">Nama</th>
                      <th className="px-3 py-3">Relasi</th>
                      <th className="px-3 py-3">Nomor HP</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {(student.parents || []).map((parent, index) => (
                      <tr key={parent.id}>
                        <td className="px-3 py-3 text-slate-500">{index + 1}</td>
                        <td className="px-3 py-3 font-semibold text-slate-900">{parent.name}</td>
                        <td className="px-3 py-3">{parent.relation}</td>
                        <td className="px-3 py-3">{parent.phone || '-'}</td>
                      </tr>
                    ))}
                    {!student.parents?.length ? (
                      <tr>
                        <td colSpan={4} className="px-3 py-6 text-center text-slate-500">Belum ada data orang tua/wali.</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        ) : null}
      </div>
    </main>
  );
}

function SectionTitle({ title, description }: { title: string; description: string }) {
  return (
    <div>
      <h3 className="text-lg font-bold text-slate-950">{title}</h3>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  );
}

function InfoBlock({ label, value, helper }: { label: string; value: string; helper?: string | null }) {
  return (
    <div className="border-t border-slate-100 p-4 md:border-r md:last:border-r-0">
      <p className="text-xs font-semibold uppercase tracking-[0.1em] text-slate-500">{label}</p>
      <p className="mt-1 font-bold text-slate-950">{value}</p>
      {helper ? <p className="text-xs text-slate-500">{helper}</p> : null}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">{label}</p>
      <p className="mt-1 font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Badge({ children, tone = 'solid' }: { children: ReactNode; tone?: 'solid' | 'light' }) {
  const className = tone === 'light'
    ? 'bg-white/15 text-white ring-1 ring-white/30'
    : 'bg-teal-50 text-teal-800 ring-1 ring-teal-100';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{children}</span>;
}
