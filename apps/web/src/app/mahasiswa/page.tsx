'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { clearSession, getSecureJson, getToken } from '../../lib/api';

type MahasiswaSummary = { totalSks: number; ips: number; ipk: number; docs: number };

export default function MahasiswaPage() {
  const [summary, setSummary] = useState<MahasiswaSummary>({ totalSks: 0, ips: 0, ipk: 0, docs: 0 });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getSecureJson<MahasiswaSummary>('/dashboard/secure/mahasiswa', summary).then(setSummary);
  }, []);

  const loggedIn = Boolean(getToken());

  return (
    <DashboardShell title="Portal Mahasiswa" menus={["KRS", "Jadwal", "KHS", "Transkrip", "Tagihan", "Kuesioner"]}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Selamat Datang</h2>
        {loggedIn ? <button onClick={() => { clearSession(); location.href = '/login'; }} className="rounded-lg border px-3 py-1 text-sm">Logout</button> : null}
      </div>
      <p className="mt-2 text-slate-600">Pantau progres studi, nilai, dokumen, dan status administrasi dalam satu dashboard.</p>

      {!loggedIn ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Silakan <Link href="/login" className="underline">login</Link> untuk melihat data dashboard.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card label="Total SKS Tempuh" value={String(summary.totalSks)} />
            <Card label="IPS Terakhir" value={summary.ips.toFixed(2)} />
            <Card label="IPK Sementara" value={summary.ipk.toFixed(2)} />
          </div>

          <section className="mt-6 rounded-xl border bg-amber-50 p-4">
            <h3 className="text-lg font-semibold">Status Akademik Semester Aktif</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <StatusItem title="KRS" status="Sudah Divalidasi PA" />
              <StatusItem title="Presensi" status="Memenuhi Syarat UTS/UAS" />
              <StatusItem title="Kuesioner" status="Belum Diisi" />
              <StatusItem title="Dokumen" status={`${summary.docs} berkas terunggah`} />
            </div>
          </section>
        </>
      )}
    </DashboardShell>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border p-4"><p className="text-sm text-slate-500">{label}</p><p className="text-2xl font-bold">{value}</p></div>;
}

function StatusItem({ title, status }: { title: string; status: string }) {
  return <div className="rounded-lg border bg-white p-3"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-600">{status}</p></div>;
}
