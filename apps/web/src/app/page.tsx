import Link from 'next/link';

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 p-6">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-8 shadow-lg">
        <h1 className="text-3xl font-bold text-secondary">SIAKAD Kampus</h1>
        <p className="mt-2 text-slate-600">MVP Tahap 1: Auth, Master Data, Kurikulum, Kelas, KRS, Nilai, KHS, Transkrip.</p>
        <div className="mt-6 grid grid-cols-1 gap-3 md:grid-cols-3">
          <Link className="rounded-xl border border-slate-300 px-4 py-3 text-center text-slate-700" href="/login">Login</Link>
          <Link className="rounded-xl bg-primary px-4 py-3 text-center text-white" href="/admin">Dashboard Admin</Link>
          <Link className="rounded-xl bg-secondary px-4 py-3 text-center text-white" href="/dosen">Dashboard Dosen</Link>
          <Link className="rounded-xl bg-accent px-4 py-3 text-center text-white" href="/mahasiswa">Dashboard Mahasiswa</Link>
        </div>
      </div>
    </main>
  );
}
