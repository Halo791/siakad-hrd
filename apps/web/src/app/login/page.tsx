'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';
import { login, saveSession, type LoginResponse, type RoleOption, type StructuralPositionOption } from '../../lib/api';

const demoRoles: RoleOption[] = [
  { code: 'SUPER_ADMIN', name: 'Super Admin' },
  { code: 'ADMIN_AKADEMIK', name: 'Admin Akademik' },
  { code: 'DOSEN', name: 'Dosen' },
  { code: 'DOSEN_PA', name: 'Dosen PA' },
  { code: 'MAHASISWA', name: 'Mahasiswa' }
];

const quickAccounts = [
  { label: 'Super Admin', email: 'superadmin@siakad.local', hint: 'akses penuh admin' },
  { label: 'Dosen Multi-role', email: 'dosen1@siakad.local', hint: 'Dosen + Dosen PA' },
  { label: 'Mahasiswa', email: 'mhs1@siakad.local', hint: 'portal mahasiswa' }
];

function dashboardForRole(roleCode: string) {
  if (roleCode === 'MAHASISWA') return '/mahasiswa';
  if (['DOSEN', 'DOSEN_PA'].includes(roleCode)) return '/dosen';
  return '/admin';
}

function roleDescription(roleCode: string) {
  const descriptions: Record<string, string> = {
    SUPER_ADMIN: 'Akses seluruh modul dan konfigurasi.',
    ADMIN_UNIVERSITAS: 'Kelola data universitas dan lintas unit.',
    ADMIN_FAKULTAS: 'Kelola data fakultas dan monitoring prodi.',
    ADMIN_PRODI: 'Kelola prodi, kurikulum, kelas, dan KRS.',
    ADMIN_AKADEMIK: 'Operasional akademik, KRS, nilai, KHS.',
    ADMIN_PMB: 'Pendaftaran mahasiswa baru.',
    ADMIN_KEUANGAN: 'Tagihan, pembayaran, dan validasi keuangan.',
    DOSEN: 'Perkuliahan, presensi, nilai, dan kelas.',
    DOSEN_PA: 'Validasi KRS dan konsultasi akademik.',
    KAPRODI: 'Validasi akademik dan monitoring prodi.',
    DEKAN: 'Monitoring fakultas dan approval akademik.',
    MAHASISWA: 'KRS, KHS, jadwal, tagihan, dan aktivitas.',
    ORANG_TUA: 'Monitoring akademik dan keuangan mahasiswa.',
    ALUMNI: 'Profil alumni dan tracer study.'
  };
  return descriptions[roleCode] || 'Akses sesuai hak role pengguna.';
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('superadmin@siakad.local');
  const [password, setPassword] = useState('Admin@12345');
  const [roleOptions, setRoleOptions] = useState<RoleOption[]>([]);
  const [structuralPositions, setStructuralPositions] = useState<StructuralPositionOption[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState('');
  const [pendingRoleSelection, setPendingRoleSelection] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const displayedRoles = roleOptions.length ? roleOptions : demoRoles;
  const selectedRole = displayedRoles.find((role) => role.code === selectedRoleCode) || displayedRoles[0];

  function resetRoles() {
    setRoleOptions([]);
    setStructuralPositions([]);
    setSelectedRoleCode('');
    setPendingRoleSelection(false);
  }

  function finishLogin(result: LoginResponse) {
    saveSession(result);
    router.push(dashboardForRole(result.user.role.code));
  }

  async function submitWithRole(roleCode?: string) {
    setLoading(true);
    setError('');
    try {
      const result = await login(email, password, roleCode);
      const roles = result.availableRoles || [];
      setStructuralPositions(result.user.structuralPositions || []);
      if (!roleCode && roles.length > 1) {
        setRoleOptions(roles);
        setSelectedRoleCode(result.user.role.code);
        setPendingRoleSelection(true);
        return;
      }
      finishLogin(result);
    } catch {
      setError('Email, password, atau role tidak valid');
    } finally {
      setLoading(false);
    }
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await submitWithRole(pendingRoleSelection ? selectedRoleCode : undefined);
  }

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#edf3ec] p-4 text-slate-900 sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_12%,rgba(241,196,15,0.30),transparent_26%),radial-gradient(circle_at_88%_20%,rgba(20,184,166,0.22),transparent_30%),linear-gradient(135deg,rgba(15,23,42,0.08),transparent_35%)]" />
      <div className="absolute inset-0 opacity-[0.13] [background-image:linear-gradient(135deg,#0f172a_1px,transparent_1px)] [background-size:7px_7px]" />

      <section className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-6xl items-center">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/70 bg-white/85 shadow-[0_30px_90px_rgba(15,23,42,0.18)] backdrop-blur">
          <header className="relative overflow-hidden bg-[#d7a916] px-6 py-5 text-white sm:px-8">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,255,255,0.28),transparent_24%),linear-gradient(90deg,rgba(11,95,66,0.30),transparent)]" />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/60 bg-white/20 text-lg font-black shadow-inner">UM</div>
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.24em] text-white/80">Sistem Informasi Akademik</p>
                  <h1 className="text-2xl font-black leading-tight sm:text-3xl">Portal Login Multi-Role</h1>
                  <p className="text-sm text-white/85">Pilih modul dan role aktif sebelum masuk ke dashboard.</p>
                </div>
              </div>
              <Link href="/" className="rounded-full bg-white/18 px-4 py-2 text-sm font-bold text-white ring-1 ring-white/40 hover:bg-white/25">
                Kembali
              </Link>
            </div>
          </header>

          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_430px]">
            <section className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[220px_minmax(0,1fr)]">
              <div>
                <div className="mb-3 flex items-end justify-between gap-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900">Daftar Modul</h2>
                    <p className="text-xs text-slate-500">Modul akademik aktif</p>
                  </div>
                </div>
                <div className="group relative overflow-hidden rounded-3xl bg-[#1f3b93] p-5 text-white shadow-[0_18px_45px_rgba(31,59,147,0.24)]">
                  <div className="absolute -right-8 bottom-5 h-28 w-28 rotate-45 rounded-3xl bg-white/10" />
                  <div className="absolute -bottom-10 right-8 h-32 w-32 rounded-full bg-[#3c62d6]/40" />
                  <p className="relative text-sm font-bold">SIM Akademik</p>
                  <div className="relative mt-10 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/12 text-xl font-black">SIM</div>
                  <p className="relative mt-4 text-xs text-blue-100">Akademik, portal, KRS, nilai, laporan.</p>
                </div>
              </div>

              <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Akses Cepat</p>
                <h3 className="mt-1 text-2xl font-black text-slate-950">Masuk dengan akun kampus</h3>
                <p className="mt-2 max-w-xl text-sm leading-6 text-slate-500">
                  Untuk akun yang punya lebih dari satu role, sistem akan menampilkan panel pilihan role setelah email dan password valid.
                </p>

                <form onSubmit={onSubmit} className="mt-5 grid gap-4">
                  <label className="text-sm font-bold text-slate-700">
                    Email
                    <input
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); resetRoles(); }}
                    />
                  </label>
                  <label className="text-sm font-bold text-slate-700">
                    Password
                    <input
                      type="password"
                      className="mt-1 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-100"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); resetRoles(); }}
                    />
                  </label>

                  <div className="grid gap-2 sm:grid-cols-3">
                    {quickAccounts.map((account) => (
                      <button
                        key={account.email}
                        type="button"
                        onClick={() => {
                          setEmail(account.email);
                          setPassword('Admin@12345');
                          resetRoles();
                        }}
                        className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left text-xs transition hover:border-emerald-300 hover:bg-emerald-50"
                      >
                        <span className="block font-black text-slate-800">{account.label}</span>
                        <span className="text-slate-500">{account.hint}</span>
                      </button>
                    ))}
                  </div>

                  {error ? <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">{error}</p> : null}
                  {pendingRoleSelection ? (
                    <p className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                      Akun ini punya multi-role. Pilih role di panel kanan, lalu lanjutkan masuk.
                    </p>
                  ) : null}

                  <button disabled={loading} className="rounded-2xl bg-[#0f7f66] px-5 py-3 text-sm font-black text-white shadow-[0_14px_28px_rgba(15,127,102,0.24)] transition hover:bg-[#0a6f59] disabled:opacity-60">
                    {loading ? 'Memproses...' : pendingRoleSelection ? 'Masuk dengan role dipilih' : 'Masuk'}
                  </button>
                </form>
              </div>
            </section>

            <aside className="border-t border-slate-100 bg-slate-50/80 p-6 sm:p-8 lg:border-l lg:border-t-0">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-black text-slate-900">Daftar Role</h2>
                  <p className="text-xs text-slate-500">{roleOptions.length ? 'Role tersedia untuk akun ini' : 'Muncul setelah login valid'}</p>
                </div>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-black text-amber-700">SIM Akademik</span>
              </div>

              <div className="grid gap-3">
                {displayedRoles.map((role) => {
                  const selected = role.code === selectedRoleCode;
                  const locked = !roleOptions.length;
                  return (
                    <button
                      key={role.code}
                      type="button"
                      disabled={locked}
                      onClick={() => setSelectedRoleCode(role.code)}
                      className={`rounded-2xl border p-4 text-left transition ${selected ? 'border-emerald-500 bg-white shadow-[0_14px_30px_rgba(15,127,102,0.13)]' : 'border-slate-200 bg-white/70 hover:bg-white'} ${locked ? 'cursor-default opacity-75' : ''}`}
                    >
                      <span className="flex items-center justify-between gap-3">
                        <span>
                          <span className={`block text-sm font-black ${selected ? 'text-emerald-700' : 'text-slate-900'}`}>{role.name}</span>
                          <span className="text-xs text-slate-500">{role.code.replaceAll('_', ' ')}</span>
                        </span>
                        <span className={`h-4 w-4 rounded-full border ${selected ? 'border-emerald-600 bg-emerald-500' : 'border-slate-300 bg-white'}`} />
                      </span>
                      <span className="mt-3 block text-xs leading-5 text-slate-500">{roleDescription(role.code)}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">Role aktif</p>
                <p className="mt-1 text-lg font-black text-slate-900">{selectedRole?.name || 'Belum dipilih'}</p>
                <p className="mt-1 text-xs text-slate-500">
                  {roleOptions.length ? 'Token JWT akan dibuat sesuai role yang dipilih.' : 'Masukkan kredensial valid untuk memuat role asli akun.'}
                </p>
              </div>

              <div className="mt-5 rounded-2xl border border-emerald-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-700">Jabatan struktural dosen</p>
                    <p className="mt-1 text-xs text-slate-500">Dipakai untuk membedakan Dosen sebagai Kaprodi, Dekan, dan jabatan lain.</p>
                  </div>
                  <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-black text-emerald-700">{structuralPositions.length}</span>
                </div>
                <div className="mt-3 grid gap-2">
                  {structuralPositions.length ? structuralPositions.map((position) => (
                    <div key={position.id} className="rounded-xl border border-emerald-100 bg-emerald-50/70 p-3">
                      <p className="text-sm font-black text-emerald-900">{position.name}</p>
                      <p className="mt-1 text-xs text-emerald-700">{position.level} | {position.studyProgramName || position.facultyName || 'Lingkup institusi'}</p>
                    </div>
                  )) : (
                    <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-3 text-xs text-slate-500">
                      Jabatan akan tampil setelah akun dosen berhasil divalidasi. Contoh seed: Dosen Satu sebagai Ketua Program Studi Informatika.
                    </p>
                  )}
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}
