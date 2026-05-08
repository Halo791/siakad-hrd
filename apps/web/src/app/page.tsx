import Link from 'next/link';

const lecturerStructures = ['Kaprodi', 'Dekan', 'Wakil Dekan', 'Sekprodi'];

export default function HomePage() {
  return (
    <main className="relative min-h-screen overflow-hidden bg-[#eef3f5] p-6 text-slate-900">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_18%,rgba(15,127,102,0.16),transparent_30%),radial-gradient(circle_at_85%_15%,rgba(245,158,11,0.20),transparent_28%)]" />
      <section className="relative mx-auto flex min-h-[calc(100vh-48px)] max-w-5xl items-center">
        <div className="w-full overflow-hidden rounded-[28px] border border-white/80 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.14)]">
          <div className="grid gap-0 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div className="p-7 sm:p-9">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#0f7f66]">Portal Akademik Kampus</p>
              <h1 className="mt-2 text-4xl font-black tracking-tight text-[#174f63]">SIAKAD Kampus</h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
                MVP Tahap 1: Auth, Master Data, Kurikulum, Kelas, KRS, Nilai, KHS, dan Transkrip dengan akses multi-role.
              </p>

              <div className="mt-7 grid gap-3 md:grid-cols-2">
                <AccessCard
                  title="Login Multi-Role"
                  desc="Masuk dan pilih role aktif sesuai akun."
                  href="/login"
                  tone="border-slate-200 bg-white text-slate-800"
                />
                <AccessCard
                  title="Dashboard Admin"
                  desc="Super Admin, admin akademik, fakultas, prodi, PMB, dan keuangan."
                  href="/admin"
                  tone="border-emerald-100 bg-[#0f7f66] text-white"
                />
                <AccessCard
                  title="Portal Mahasiswa"
                  desc="KRS, KHS, transkrip, jadwal, tagihan, dan aktivitas mahasiswa."
                  href="/mahasiswa"
                  tone="border-amber-100 bg-[#f59e0b] text-white"
                />
                <AccessCard
                  title="Portal Dosen"
                  desc="Mengajar, presensi, nilai, konsultasi PA, dan bimbingan."
                  href="/dosen"
                  tone="border-sky-100 bg-[#15566d] text-white"
                />
              </div>
            </div>

            <aside className="border-t border-slate-100 bg-slate-50 p-7 sm:p-9 lg:border-l lg:border-t-0">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400">Akses Dosen</p>
              <h2 className="mt-2 text-2xl font-black text-slate-950">Role dan Jabatan Struktural</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Role login tetap dapat berupa Dosen/Dosen PA, sedangkan jabatan struktural dibedakan sebagai atribut dosen.
              </p>

              <div className="mt-5 grid gap-3">
                <div className="rounded-2xl border border-white bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-900">Role Dosen</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-bold text-sky-700">Dosen</span>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">Dosen PA</span>
                  </div>
                </div>
                <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
                  <p className="text-sm font-black text-slate-900">Jabatan Struktural</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {lecturerStructures.map((item) => (
                      <span key={item} className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">{item}</span>
                    ))}
                  </div>
                  <p className="mt-3 text-xs leading-5 text-slate-500">
                    Contoh: akun dosen dapat login sebagai Dosen, tetapi memiliki jabatan aktif Kaprodi untuk alur approval prodi.
                  </p>
                </div>
              </div>

              <Link href="/login" className="mt-5 block rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-black text-white transition hover:bg-slate-800">
                Pilih Role Login
              </Link>
            </aside>
          </div>
        </div>
      </section>
    </main>
  );
}

function AccessCard({ title, desc, href, tone }: { title: string; desc: string; href: string; tone: string }) {
  return (
    <Link href={href} className={`rounded-2xl border p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${tone}`}>
      <span className="block text-lg font-black">{title}</span>
      <span className="mt-2 block text-sm leading-6 opacity-80">{desc}</span>
    </Link>
  );
}
