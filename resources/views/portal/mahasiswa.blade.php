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
    $tabIcons = [
        'daftar-mahasiswa' => 'DM',
        'detail-mahasiswa' => 'DT',
        'biodata' => 'BD',
        'status-semester' => 'SS',
        'krs' => 'KR',
        'khs' => 'KH',
        'transkrip' => 'TR',
        'riwayat-keuangan' => 'RK',
        'konsentrasi-peminatan' => 'KP',
        'pindah-transfer-prodi' => 'PT',
        'nilai-konversi' => 'NK',
        'aktivitas-prestasi' => 'AP',
        'salin-mahasiswa' => 'SM',
    ];
    $selectedUrl = fn (string $nextTab, ?string $studentId = null) => route('portal.mahasiswa', [
        'tab' => $nextTab,
        'studentId' => $studentId ?: $student?->id,
    ]);
    $roles = $student?->user
        ? collect([$student->user->role])->merge($student->user->userRoles->pluck('role'))->filter()->unique('code')->values()
        : collect();
    $studentStatusName = $student?->studentStatusId ? DB::table('StudentStatusRef')->where('id', $student->studentStatusId)->value('name') : null;
    $studentClassName = $student?->studentClassId ? DB::table('StudentClassRef')->where('id', $student->studentClassId)->value('name') : null;
    $studySystemName = $student?->studySystemId ? DB::table('StudySystemRef')->where('id', $student->studySystemId)->value('name') : null;
    $totalBills = collect($finance['bills'] ?? [])->sum('amount');
    $totalPayments = collect($finance['payments'] ?? [])->sum('amount');
    $remainingBills = max(0, $totalBills - $totalPayments);
@endphp

@section('content')
<style>
    .portal-shell{display:grid;grid-template-columns:280px minmax(0,1fr);gap:0;min-height:620px}
    .portal-side{border-right:1px solid #e5e7eb;background:#f8fafc}
    .student-card{padding:18px;border-bottom:1px solid #e5e7eb;background:white}
    .student-photo{display:grid;width:58px;height:58px;place-items:center;border-radius:16px;background:#dcfce7;color:#15803d;font-weight:900}
    .student-name{margin:12px 0 4px;font-size:18px;font-weight:900;line-height:1.2}
    .student-nim{font-family:monospace;color:#64748b}
    .portal-tabs{display:grid;gap:6px;padding:12px}
    .portal-tab{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:10px;border:1px solid transparent;border-radius:12px;padding:9px;color:#475569;font-size:12px;font-weight:900}
    .portal-tab:hover{background:white;border-color:#e5e7eb;color:#166534}
    .portal-tab.active{background:#dcfce7;border-color:#86efac;color:#166534}
    .portal-tab-icon{display:grid;height:30px;width:30px;place-items:center;border-radius:9px;background:white;color:#16a34a;font-size:10px;font-weight:900}
    .portal-main{background:white}
    .portal-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;padding:18px;border-bottom:1px solid #e5e7eb;background:#fbfdfb}
    .portal-title{margin:2px 0 6px;font-size:24px;font-weight:900}
    .student-select{min-width:320px}
    .hero-strip{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:16px;padding:18px;background:linear-gradient(135deg,#0f766e,#42b429);color:white}
    .hero-strip .chips .chip{background:rgba(255,255,255,.17);color:white;box-shadow:none}
    .quick-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:0;border-bottom:1px solid #e5e7eb}
    .quick-stat{padding:14px 16px;border-right:1px solid #e5e7eb}
    .quick-stat:last-child{border-right:0}
    .stat-label{font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;color:#64748b}
    .stat-value{margin-top:5px;font-size:18px;font-weight:900}
    .content-pad{padding:18px}
    .cards{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .mini-card{border:1px solid #e5e7eb;border-radius:12px;background:white;padding:14px}
    .mini-card strong{display:block;margin-top:5px;font-size:24px}
    .profile-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
    .field-card{border:1px solid #e5e7eb;border-radius:12px;padding:13px;background:#fff}
    .field-card .value{margin-top:4px;font-weight:900}
    .toolbar-actions{display:flex;flex-wrap:wrap;gap:8px;margin-bottom:14px}
    .soft-btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;padding:9px 12px;color:#1d4ed8;font-size:12px;font-weight:900}
    .empty-state{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:22px;text-align:center;color:#64748b;font-weight:800}
    .form-preview{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
    @media(max-width:980px){.portal-shell{grid-template-columns:1fr}.portal-side{border-right:0;border-bottom:1px solid #e5e7eb}.portal-tabs{grid-template-columns:repeat(2,minmax(0,1fr))}.quick-stats,.cards,.profile-grid,.form-preview{grid-template-columns:1fr}.portal-toolbar,.hero-strip{grid-template-columns:1fr;display:grid}.student-select{min-width:0}}
</style>

<div class="panel">
    <div class="portal-shell">
        <aside class="portal-side">
            <div class="student-card">
                <div class="student-photo">{{ strtoupper(substr($student?->name ?? 'M', 0, 2)) }}</div>
                <div class="student-name">{{ $student?->name ?? 'Belum ada mahasiswa' }}</div>
                <div class="student-nim">{{ $student?->nim ?? '-' }}</div>
                <div class="chips" style="margin-top:12px">
                    <span class="chip green">{{ $studentStatusName ?? $student?->status ?? 'ACTIVE' }}</span>
                    @if($student)<span class="chip">Semester {{ $student->currentSemester }}</span>@endif
                </div>
            </div>
            <nav class="portal-tabs">
                @foreach($tabLabels as $key => $label)
                    <a class="portal-tab {{ $tab === $key ? 'active' : '' }}" href="{{ $selectedUrl($key) }}">
                        <span class="portal-tab-icon">{{ $tabIcons[$key] }}</span>
                        <span>{{ $label }}</span>
                    </a>
                @endforeach
            </nav>
        </aside>

        <main class="portal-main">
            <div class="portal-toolbar">
                <div>
                    <p class="eyebrow">Portal &gt; Mahasiswa</p>
                    <h2 class="portal-title">{{ $tabLabels[$tab] ?? 'Portal Mahasiswa' }}</h2>
                    <p class="muted" style="margin:0">Data mengikuti struktur akademik Laravel dari database SIAKAD.</p>
                </div>
                <form method="get" action="{{ route('portal.mahasiswa') }}" class="student-select">
                    <input type="hidden" name="tab" value="{{ $tab }}">
                    <label style="margin-top:0">Mahasiswa
                        <select name="studentId" onchange="this.form.submit()">
                            @foreach($students as $option)
                                <option value="{{ $option->id }}" @selected($student?->id === $option->id)>{{ $option->nim }} - {{ $option->name }}</option>
                            @endforeach
                        </select>
                    </label>
                </form>
            </div>

            @if(!$student)
                <div class="content-pad"><div class="empty-state">Belum ada data mahasiswa.</div></div>
            @else
                <div class="hero-strip">
                    <div>
                        <div style="font-family:monospace">{{ $student->nim }}</div>
                        <h2 style="margin:4px 0 10px;font-size:30px">{{ $student->name }}</h2>
                        <div class="chips">
                            <span class="chip">{{ $student->studyProgram?->code }} - {{ $student->studyProgram?->name }}</span>
                            <span class="chip">{{ $student->studyProgram?->faculty?->name ?? 'Fakultas belum diset' }}</span>
                            @foreach($roles as $role)<span class="chip">{{ $role->name }}</span>@endforeach
                        </div>
                    </div>
                    <div style="text-align:right">
                        <div style="font-size:12px;opacity:.84">Periode Aktif</div>
                        <div style="font-size:20px;font-weight:900">{{ $activePeriod->name ?? '-' }}</div>
                    </div>
                </div>

                <div class="quick-stats">
                    <div class="quick-stat"><div class="stat-label">KRS</div><div class="stat-value">{{ $studyPlans->count() }} periode</div></div>
                    <div class="quick-stat"><div class="stat-label">KHS</div><div class="stat-value">{{ $khsRows->count() }} periode</div></div>
                    <div class="quick-stat"><div class="stat-label">IPK</div><div class="stat-value">{{ number_format($transcript->gpa ?? 0, 2) }}</div></div>
                    <div class="quick-stat"><div class="stat-label">Sisa Tagihan</div><div class="stat-value">Rp {{ number_format($remainingBills, 0, ',', '.') }}</div></div>
                </div>

                <div class="content-pad">
                    @if($tab === 'daftar-mahasiswa')
                        <div class="toolbar-actions">
                            <a class="soft-btn" href="{{ route('master.students') }}">Master Mahasiswa</a>
                            <a class="soft-btn" href="{{ $selectedUrl('salin-mahasiswa') }}">Salin Data</a>
                        </div>
                        <div class="table-wrap"><table>
                            <thead><tr><th>NIM</th><th>Nama</th><th>Email</th><th>Prodi</th><th>Status</th><th>Aksi</th></tr></thead>
                            <tbody>
                            @foreach($students as $row)
                                <tr>
                                    <td><strong>{{ $row->nim }}</strong></td>
                                    <td>{{ $row->name }}</td>
                                    <td>{{ $row->user?->email ?? '-' }}</td>
                                    <td>{{ $row->studyProgram?->code }} - {{ $row->studyProgram?->name }}</td>
                                    <td><span class="badge">{{ $row->status }}</span></td>
                                    <td><a class="badge" href="{{ $selectedUrl('detail-mahasiswa', $row->id) }}">Buka Detail</a></td>
                                </tr>
                            @endforeach
                            </tbody>
                        </table></div>
                    @elseif($tab === 'detail-mahasiswa')
                        <div class="cards">
                            <div class="mini-card"><div class="stat-label">NIM</div><strong>{{ $student->nim }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Semester</div><strong>{{ $student->currentSemester }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Kelas</div><strong>{{ $studentClassName ?? '-' }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Sistem</div><strong>{{ $studySystemName ?? '-' }}</strong></div>
                        </div>
                        <div class="profile-grid">
                            <div class="field-card"><div class="stat-label">Nama</div><div class="value">{{ $student->name }}</div></div>
                            <div class="field-card"><div class="stat-label">Email Login</div><div class="value">{{ $student->user?->email ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Fakultas</div><div class="value">{{ $student->studyProgram?->faculty?->name ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Program Studi</div><div class="value">{{ $student->studyProgram?->name ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Status Mahasiswa</div><div class="value">{{ $studentStatusName ?? $student->status }}</div></div>
                            <div class="field-card"><div class="stat-label">Status Akun</div><div class="value">{{ $student->user?->status ?? 'ACTIVE' }}</div></div>
                        </div>
                    @elseif($tab === 'biodata')
                        <div class="profile-grid">
                            <div class="field-card"><div class="stat-label">NIM</div><div class="value">{{ $student->nim }}</div></div>
                            <div class="field-card"><div class="stat-label">Nama Lengkap</div><div class="value">{{ $student->name }}</div></div>
                            <div class="field-card"><div class="stat-label">Email</div><div class="value">{{ $student->user?->email ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Role</div><div class="value">{{ $roles->pluck('name')->join(', ') ?: '-' }}</div></div>
                        </div>
                        <h3 class="section-title" style="margin-top:18px">Orang Tua / Wali</h3>
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
                            <div class="mini-card"><div class="stat-label">Periode</div><strong>{{ $semesterStatus['periodName'] ?? '-' }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Status KRS</div><strong>{{ $semesterStatus['status'] ?? 'DRAFT' }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Kelas</div><strong>{{ $semesterStatus['classCount'] ?? 0 }}</strong></div>
                            <div class="mini-card"><div class="stat-label">SKS</div><strong>{{ $semesterStatus['plannedSks'] ?? 0 }}</strong></div>
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
                                    <td>{{ $plan->items->map(fn($item) => trim($item->courseCode.' '.$item->courseName.' ('.$item->className.')'))->join(', ') ?: '-' }}</td>
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
                            <div class="mini-card"><div class="stat-label">IPK</div><strong>{{ number_format($transcript->gpa ?? 0, 2) }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Total SKS</div><strong>{{ $transcript->totalSks ?? 0 }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Dokumen</div><strong>{{ $documents->count() }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Status</div><strong>{{ $transcript ? 'Tersedia' : 'Belum dibuat' }}</strong></div>
                        </div>
                        <div class="table-wrap"><table>
                            <thead><tr><th>Dokumen</th><th>File</th><th>Tanggal</th></tr></thead>
                            <tbody>
                            @forelse($documents as $document)
                                <tr><td>{{ $document->name ?? $document->type ?? 'Dokumen' }}</td><td>{{ $document->filePath ?? $document->fileUrl ?? '-' }}</td><td>{{ $document->createdAt ?? '-' }}</td></tr>
                            @empty
                                <tr><td colspan="3">Belum ada dokumen mahasiswa.</td></tr>
                            @endforelse
                            </tbody>
                        </table></div>
                    @elseif($tab === 'riwayat-keuangan')
                        <div class="cards">
                            <div class="mini-card"><div class="stat-label">Total Tagihan</div><strong>Rp {{ number_format($totalBills, 0, ',', '.') }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Terbayar</div><strong>Rp {{ number_format($totalPayments, 0, ',', '.') }}</strong></div>
                            <div class="mini-card"><div class="stat-label">Sisa</div><strong>Rp {{ number_format($remainingBills, 0, ',', '.') }}</strong></div>
                            <div class="mini-card"><div class="stat-label">VA</div><strong>{{ collect($finance['virtualAccounts'] ?? [])->count() }}</strong></div>
                        </div>
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
                    @elseif($tab === 'konsentrasi-peminatan')
                        <div class="profile-grid">
                            <div class="field-card"><div class="stat-label">Program Studi</div><div class="value">{{ $student->studyProgram?->name ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Kode Prodi</div><div class="value">{{ $student->studyProgram?->code ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Fakultas</div><div class="value">{{ $student->studyProgram?->faculty?->name ?? '-' }}</div></div>
                            <div class="field-card"><div class="stat-label">Konsentrasi</div><div class="value">{{ $student->concentration ?? $student->interest ?? 'Reguler' }}</div></div>
                        </div>
                        <h3 class="section-title" style="margin-top:18px">Referensi Prodi</h3>
                        <div class="table-wrap"><table><thead><tr><th>Kode</th><th>Program Studi</th><th>Fakultas</th></tr></thead><tbody>
                            @forelse($studyPrograms as $program)
                                <tr><td>{{ $program->code }}</td><td>{{ $program->name }}</td><td>{{ $program->facultyName ?? '-' }}</td></tr>
                            @empty
                                <tr><td colspan="3">Belum ada referensi program studi.</td></tr>
                            @endforelse
                        </tbody></table></div>
                    @elseif($tab === 'pindah-transfer-prodi')
                        <div class="form-preview">
                            <div class="field-card"><div class="stat-label">Prodi Asal</div><div class="value">{{ $student->studyProgram?->code }} - {{ $student->studyProgram?->name }}</div></div>
                            <div class="field-card"><div class="stat-label">Status Mahasiswa</div><div class="value">{{ $studentStatusName ?? $student->status }}</div></div>
                            <label>Prodi Tujuan
                                <select>
                                    @foreach($studyPrograms as $program)
                                        <option @selected($student->studyProgramId === $program->id)>{{ $program->code }} - {{ $program->name }}</option>
                                    @endforeach
                                </select>
                            </label>
                            <label>Jenis Perpindahan
                                <select><option>Pindah Prodi Internal</option><option>Transfer Masuk</option><option>Alih Jenjang</option></select>
                            </label>
                        </div>
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
                        <h3 class="section-title" style="margin-top:18px">Aktivitas MBKM</h3>
                        <div class="table-wrap"><table><thead><tr><th>Tipe</th><th>Mitra</th><th>Semester</th></tr></thead><tbody>
                            @forelse($mbkmActivities as $activity)
                                <tr><td>{{ $activity->type }}</td><td>{{ $activity->partner }}</td><td>{{ $activity->semester }}</td></tr>
                            @empty
                                <tr><td colspan="3">Belum ada aktivitas MBKM.</td></tr>
                            @endforelse
                        </tbody></table></div>
                    @elseif($tab === 'salin-mahasiswa')
                        <div class="form-preview">
                            <label>NIM Baru<input value="{{ $student->nim }}-COPY"></label>
                            <label>Nama Mahasiswa<input value="{{ $student->name }}"></label>
                            <label>Email Baru<input value="copy.{{ $student->user?->email }}"></label>
                            <label>Program Studi
                                <select>
                                    @foreach($studyPrograms as $program)
                                        <option @selected($student->studyProgramId === $program->id)>{{ $program->code }} - {{ $program->name }}</option>
                                    @endforeach
                                </select>
                            </label>
                            <label>Semester Awal<input value="{{ $student->currentSemester }}"></label>
                            <label>Status<input value="{{ $studentStatusName ?? $student->status }}"></label>
                        </div>
                    @endif
                </div>
            @endif
        </main>
    </div>
</div>
@endsection
