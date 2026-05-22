@extends('layouts.app', ['title' => 'Portal Mahasiswa'])

@php
    $tabLabels = [
        'daftar-mahasiswa' => 'Daftar Mahasiswa',
        'detail-mahasiswa' => 'Detail Mahasiswa',
        'biodata' => 'Biodata',
        'status-semester' => 'Status Semester',
        'krs' => 'KRS',
        'khs' => 'KHS',
        'transkrip' => 'Transkrip',
        'riwayat-keuangan' => 'Riwayat Keuangan',
        'konsentrasi-peminatan' => 'Konsentrasi/Peminatan',
        'pindah-transfer-prodi' => 'Pindah/Transfer Prodi',
        'nilai-konversi' => 'Nilai Konversi',
        'aktivitas-prestasi' => 'Aktivitas & Prestasi',
        'salin-mahasiswa' => 'Salin Mahasiswa',
    ];
    $selectedUrl = fn (string $nextTab) => route('portal.mahasiswa', ['tab' => $nextTab, 'studentId' => $student?->id]);
    $roles = $student?->user
        ? collect([$student->user->role])->merge($student->user->userRoles->pluck('role'))->filter()->unique('code')->values()
        : collect();
    $studentStatusName = $student?->studentStatusId ? DB::table('StudentStatusRef')->where('id', $student->studentStatusId)->value('name') : null;
    $studentClassName = $student?->studentClassId ? DB::table('StudentClassRef')->where('id', $student->studentClassId)->value('name') : null;
    $studySystemName = $student?->studySystemId ? DB::table('StudySystemRef')->where('id', $student->studySystemId)->value('name') : null;
@endphp

@section('content')
<style>
    .tabs{display:flex;flex-wrap:wrap;gap:8px;border-bottom:1px solid #e5e7eb;padding:14px;background:#fbfdfb}
    .tab{border:1px solid #e5e7eb;border-radius:999px;background:white;padding:8px 12px;color:#64748b;font-size:12px;font-weight:900}
    .tab.active{border-color:#42b429;background:#e9f8e6;color:#2f941d}
    .student-switch{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:14px;border-bottom:1px solid #edf2f7;background:white;padding:16px}
    .info-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-top:1px solid #edf2f7}
    .info-cell{border-right:1px solid #edf2f7;padding:14px}.info-cell:last-child{border-right:0}
    .info-label{color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.info-value{margin-top:4px;font-weight:900}
    .cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}.card{border:1px solid #e5e7eb;border-radius:14px;background:white;padding:14px}.card strong{display:block;margin-top:4px;font-size:24px}
    @media(max-width:900px){.info-grid,.cards{grid-template-columns:1fr}.info-cell{border-right:0;border-bottom:1px solid #edf2f7}}
</style>

<div class="panel">
    <div class="student-switch">
        <div>
            <p class="eyebrow">Portal &gt; Mahasiswa</p>
            <h2 class="section-title" style="font-size:24px">{{ $tabLabels[$tab] ?? 'Portal Mahasiswa' }}</h2>
            <p class="muted" style="margin:0">Fungsi portal mahasiswa diselaraskan dengan SIAKAD Next.js dan membaca database akademik yang sama.</p>
        </div>
        <form method="get" action="{{ route('portal.mahasiswa') }}" style="min-width:320px">
            <input type="hidden" name="tab" value="{{ $tab }}">
            <label style="margin-top:0">Mahasiswa
                <select name="studentId" onchange="this.form.submit()">
                    @foreach($students as $option)
                        <option value="{{ $option->id }}" @selected($student?->id === $option->id)>{{ $option->nim }} - {{ $option->name }} ({{ $option->studyProgram?->code ?? '-' }})</option>
                    @endforeach
                </select>
            </label>
        </form>
    </div>

    <div class="tabs">
        @foreach($tabLabels as $key => $label)
            <a class="tab {{ $tab === $key ? 'active' : '' }}" href="{{ $selectedUrl($key) }}">{{ $label }}</a>
        @endforeach
    </div>

    @if(!$student)
        <div class="panel pad" style="box-shadow:none;border-radius:0">Belum ada data mahasiswa.</div>
    @else
        <div style="background:linear-gradient(90deg,#0f766e,#42b429);padding:18px;color:white">
            <div style="font-family:monospace">{{ $student->nim }}</div>
            <h2 style="margin:4px 0 10px;font-size:30px">{{ $student->name }}</h2>
            <div class="chips">
                <span class="chip">Semester {{ $student->currentSemester }}</span>
                <span class="chip">{{ $student->status }}</span>
                @foreach($roles as $role)<span class="chip">{{ $role->name }}</span>@endforeach
            </div>
        </div>
        <div class="info-grid">
            <div class="info-cell"><div class="info-label">Fakultas</div><div class="info-value">{{ $student->studyProgram?->faculty?->name ?? '-' }}</div></div>
            <div class="info-cell"><div class="info-label">Program Studi</div><div class="info-value">{{ $student->studyProgram?->code }} - {{ $student->studyProgram?->name }}</div></div>
            <div class="info-cell"><div class="info-label">Status Mahasiswa</div><div class="info-value">{{ $studentStatusName ?? $student->status }}</div></div>
            <div class="info-cell"><div class="info-label">Periode Aktif</div><div class="info-value">{{ $activePeriod->name ?? '-' }}</div></div>
        </div>

        <div class="panel pad" style="box-shadow:none;border-radius:0">
            @if($tab === 'daftar-mahasiswa')
                <div class="table-wrap"><table>
                    <thead><tr><th>NIM</th><th>Nama</th><th>Email</th><th>Prodi</th><th>Semester</th><th>Aksi</th></tr></thead>
                    <tbody>
                    @foreach($students as $row)
                        <tr>
                            <td><strong>{{ $row->nim }}</strong></td>
                            <td>{{ $row->name }}</td>
                            <td>{{ $row->user?->email }}</td>
                            <td>{{ $row->studyProgram?->code }} - {{ $row->studyProgram?->name }}</td>
                            <td>{{ $row->currentSemester }}</td>
                            <td><a class="badge" href="{{ route('portal.mahasiswa', ['tab' => 'detail-mahasiswa', 'studentId' => $row->id]) }}">Buka Detail</a></td>
                        </tr>
                    @endforeach
                    </tbody>
                </table></div>
            @elseif(in_array($tab, ['detail-mahasiswa','biodata'], true))
                <div class="grid grid-2">
                    <div class="card"><div class="info-label">NIM</div><strong>{{ $student->nim }}</strong></div>
                    <div class="card"><div class="info-label">Nama Mahasiswa</div><strong>{{ $student->name }}</strong></div>
                    <div class="card"><div class="info-label">Email Login</div><strong style="font-size:18px">{{ $student->user?->email ?? '-' }}</strong></div>
                    <div class="card"><div class="info-label">Status Akun</div><strong>{{ $student->user?->status ?? 'ACTIVE' }}</strong></div>
                    <div class="card"><div class="info-label">Kelas</div><strong>{{ $studentClassName ?? '-' }}</strong></div>
                    <div class="card"><div class="info-label">Sistem Kuliah</div><strong>{{ $studySystemName ?? '-' }}</strong></div>
                </div>
                <h3 class="section-title" style="margin-top:16px">Orang Tua / Wali</h3>
                <div class="table-wrap"><table>
                    <thead><tr><th>Nama</th><th>Relasi</th><th>Nomor HP</th></tr></thead>
                    <tbody>
                    @forelse($student->parents as $parent)
                        <tr><td>{{ $parent->name }}</td><td>{{ $parent->relation }}</td><td>{{ $parent->phone ?? '-' }}</td></tr>
                    @empty
                        <tr><td colspan="3">Belum ada data orang tua/wali.</td></tr>
                    @endforelse
                    </tbody>
                </table></div>
            @elseif($tab === 'status-semester')
                <div class="cards">
                    <div class="card"><div class="info-label">Periode</div><strong>{{ $semesterStatus['periodName'] ?? '-' }}</strong></div>
                    <div class="card"><div class="info-label">Status KRS</div><strong>{{ $semesterStatus['status'] ?? 'DRAFT' }}</strong></div>
                    <div class="card"><div class="info-label">Kelas KRS</div><strong>{{ $semesterStatus['classCount'] ?? 0 }}</strong></div>
                    <div class="card"><div class="info-label">SKS Rencana</div><strong>{{ $semesterStatus['plannedSks'] ?? 0 }}</strong></div>
                </div>
            @elseif($tab === 'krs')
                <div class="table-wrap"><table>
                    <thead><tr><th>Periode</th><th>Status</th><th>Jumlah Kelas</th><th>SKS</th><th>Mata Kuliah</th></tr></thead>
                    <tbody>
                    @forelse($studyPlans as $plan)
                        <tr>
                            <td>{{ $plan->periodName ?? '-' }}</td>
                            <td><span class="badge">{{ $plan->status }}</span></td>
                            <td>{{ $plan->items->count() }}</td>
                            <td>{{ $plan->plannedSks }}</td>
                            <td>{{ $plan->items->map(fn($item) => $item->courseCode.' '.$item->courseName.' ('.$item->className.')')->join(', ') ?: '-' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="5">Belum ada KRS.</td></tr>
                    @endforelse
                    </tbody>
                </table></div>
            @elseif($tab === 'khs')
                <div class="table-wrap"><table>
                    <thead><tr><th>Periode</th><th>Total SKS</th><th>IPS</th><th>IPK</th></tr></thead>
                    <tbody>
                    @forelse($khsRows as $row)
                        <tr><td>{{ $row->periodName ?? '-' }}</td><td>{{ $row->totalSks ?? 0 }}</td><td>{{ number_format($row->ips ?? 0, 2) }}</td><td>{{ number_format($row->ipk ?? 0, 2) }}</td></tr>
                    @empty
                        <tr><td colspan="4">Belum ada KHS.</td></tr>
                    @endforelse
                    </tbody>
                </table></div>
            @elseif($tab === 'transkrip')
                <div class="cards">
                    <div class="card"><div class="info-label">IPK</div><strong>{{ number_format($transcript->gpa ?? 0, 2) }}</strong></div>
                    <div class="card"><div class="info-label">Total SKS</div><strong>{{ $transcript->totalSks ?? 0 }}</strong></div>
                    <div class="card"><div class="info-label">Dokumen</div><strong>{{ $documents->count() }}</strong></div>
                    <div class="card"><div class="info-label">Status</div><strong>{{ $transcript ? 'Tersedia' : 'Belum dibuat' }}</strong></div>
                </div>
            @elseif($tab === 'riwayat-keuangan')
                <div class="grid grid-2">
                    <div>
                        <h3 class="section-title">Tagihan</h3>
                        <div class="table-wrap"><table><thead><tr><th>Jenis</th><th>Nominal</th><th>Status</th></tr></thead><tbody>
                        @forelse($finance['bills'] as $bill)<tr><td>{{ $bill->type }}</td><td>Rp {{ number_format($bill->amount, 0, ',', '.') }}</td><td>{{ $bill->status }}</td></tr>@empty<tr><td colspan="3">Belum ada tagihan.</td></tr>@endforelse
                        </tbody></table></div>
                    </div>
                    <div>
                        <h3 class="section-title">Pembayaran</h3>
                        <div class="table-wrap"><table><thead><tr><th>Metode</th><th>Nominal</th><th>Status</th></tr></thead><tbody>
                        @forelse($finance['payments'] as $payment)<tr><td>{{ $payment->method }}</td><td>Rp {{ number_format($payment->amount, 0, ',', '.') }}</td><td>{{ $payment->status }}</td></tr>@empty<tr><td colspan="3">Belum ada pembayaran.</td></tr>@endforelse
                        </tbody></table></div>
                    </div>
                </div>
            @elseif($tab === 'aktivitas-prestasi')
                <div class="table-wrap"><table>
                    <thead><tr><th>Aktivitas</th><th>Kategori</th><th>Skor</th><th>SKPI</th></tr></thead>
                    <tbody>
                    @forelse($activities as $activity)
                        <tr><td>{{ $activity->name }}</td><td>{{ $activity->category }}</td><td>{{ $activity->score ?? '-' }}</td><td>{{ !empty($activity->isShownInSkpi) ? 'Ya' : 'Tidak' }}</td></tr>
                    @empty
                        <tr><td colspan="4">Belum ada aktivitas/prestasi.</td></tr>
                    @endforelse
                    </tbody>
                </table></div>
            @elseif($tab === 'nilai-konversi')
                <div class="table-wrap"><table>
                    <thead><tr><th>Kegiatan</th><th>Mitra</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai Konversi</th></tr></thead>
                    <tbody>
                    @forelse($conversionRows as $row)
                        <tr><td>{{ $row->type }}</td><td>{{ $row->partner }}</td><td>{{ $row->courseCode }} - {{ $row->courseName }}</td><td>{{ $row->sks ?? 0 }}</td><td>{{ $row->convertedScore }}</td></tr>
                    @empty
                        <tr><td colspan="5">Belum ada nilai konversi MBKM.</td></tr>
                    @endforelse
                    </tbody>
                </table></div>
            @else
                <div class="alert ok" style="margin:0">
                    Modul {{ $tabLabels[$tab] ?? $tab }} sudah terhubung ke Portal Mahasiswa. Data dasar mahasiswa, prodi, KRS, KHS, transkrip, keuangan, aktivitas, dan konversi memakai database SIAKAD yang sama.
                </div>
            @endif
        </div>
    @endif
</div>
@endsection
