'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { DashboardShell } from '../../components/dashboard-shell';
import { clearSession, getSecureJson, getToken } from '../../lib/api';

type DosenSummary = { classes: number; unlockedGrades: number; pendingKrs: number };

export default function DosenPage() {
  const [summary, setSummary] = useState<DosenSummary>({ classes: 0, unlockedGrades: 0, pendingKrs: 0 });

  useEffect(() => {
    const token = getToken();
    if (!token) return;
    getSecureJson<DosenSummary>('/dashboard/secure/dosen', summary).then(setSummary);
  }, []);

  const loggedIn = Boolean(getToken());

  return (
    <DashboardShell title="Dashboard Dosen" menus={["Jadwal Mengajar", "Presensi", "Nilai", "Konsultasi PA"]}>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Aktivitas Dosen</h2>
        {loggedIn ? <button onClick={() => { clearSession(); location.href = '/login'; }} className="rounded-lg border px-3 py-1 text-sm">Logout</button> : null}
      </div>
      <p className="mt-2 text-slate-600">Kelola perkuliahan, nilai, dan konsultasi akademik mahasiswa secara terintegrasi.</p>

      {!loggedIn ? (
        <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm">Silakan <Link href="/login" className="underline">login</Link> untuk melihat data dashboard.</p>
      ) : (
        <>
          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            <Card label="Kelas Diampu" value={String(summary.classes)} />
            <Card label="KRS Menunggu Validasi" value={String(summary.pendingKrs)} />
            <Card label="Nilai Belum Lock" value={String(summary.unlockedGrades)} />
          </div>

          <section className="mt-6 rounded-xl border bg-slate-50 p-4">
            <h3 className="text-lg font-semibold">Workflow Dosen</h3>
            <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
              <FlowItem title="1. Presensi Pertemuan" desc="Input status hadir/izin/sakit/alfa berdasarkan kelas dan pertemuan." />
              <FlowItem title="2. Input Nilai" desc="Isi komponen nilai lalu review hasil konversi huruf." />
              <FlowItem title="3. Lock Nilai" desc="Kunci nilai final agar masuk proses generate KHS dan transkrip." />
              <FlowItem title="4. Konsultasi PA" desc="Tanggapi konsultasi dan validasi KRS mahasiswa bimbingan." />
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

function FlowItem({ title, desc }: { title: string; desc: string }) {
  return <div className="rounded-lg border bg-white p-3"><p className="font-semibold">{title}</p><p className="mt-1 text-sm text-slate-600">{desc}</p></div>;
}
