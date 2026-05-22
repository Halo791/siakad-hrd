@extends('layouts.app', ['title' => 'Portal '.$sectionLabel])

@php
    $tabLabels = [
        'daftar-pegawai' => 'Daftar Pegawai/Dosen',
        'detail-pegawai' => 'Detail Pegawai',
        'pembimbing' => 'Pembimbing',
        'tanda-tangan' => 'Tanda Tangan/NIDN/NIDK/NUPN',
        'kalender-akademik' => 'Kalender Akademik',
        'monitoring-kalender-akademik' => 'Monitoring Kalender Akademik',
        'monitoring-mahasiswa' => 'Monitoring Mahasiswa',
        'profil-alumni' => 'Profil Alumni',
    ];
    $tabUrl = fn (string $nextTab) => route('portal.index', ['section' => $section, 'tab' => $nextTab] + (request('lecturerId') ? ['lecturerId' => request('lecturerId')] : []));
@endphp

@section('content')
<style>
    .portal-grid{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:560px}
    .portal-side{border-right:1px solid #e5e7eb;background:#f8fafc;padding:16px}
    .portal-mark{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:#dcfce7;color:#15803d;font-weight:900}
    .portal-title{margin:12px 0 4px;font-size:20px;font-weight:900}
    .portal-links{display:grid;gap:8px;margin-top:18px}
    .portal-link{border:1px solid transparent;border-radius:12px;padding:11px 12px;color:#475569;font-size:13px;font-weight:900}
    .portal-link:hover,.portal-link.active{border-color:#86efac;background:#dcfce7;color:#166534}
    .portal-main{background:white}
    .portal-head{display:flex;align-items:flex-end;justify-content:space-between;gap:14px;border-bottom:1px solid #e5e7eb;background:#fbfdfb;padding:18px}
    .headline{margin:3px 0 0;font-size:25px;font-weight:900}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #e5e7eb}
    .stat{padding:14px;border-right:1px solid #e5e7eb}.stat:last-child{border-right:0}
    .stat span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin-top:5px;font-size:22px}
    .pad{padding:18px}
    .cards{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .info{border:1px solid #e5e7eb;border-radius:12px;padding:14px}.info span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.info strong{display:block;margin-top:5px;font-size:18px}
    .soft-btn{display:inline-flex;align-items:center;justify-content:center;border:1px solid #dbeafe;border-radius:10px;background:#eff6ff;padding:9px 12px;color:#1d4ed8;font-size:12px;font-weight:900}
    .empty{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-weight:800}
    @media(max-width:900px){.portal-grid,.stats,.cards{grid-template-columns:1fr}.portal-side{border-right:0;border-bottom:1px solid #e5e7eb}.portal-head{align-items:flex-start;flex-direction:column}}
</style>

<div class="panel">
    <div class="portal-grid">
        <aside class="portal-side">
            <div class="portal-mark">{{ strtoupper(substr($sectionLabel, 0, 2)) }}</div>
            <div class="portal-title">{{ $sectionLabel }}</div>
            <p class="muted" style="margin:0">Submenu portal aktif dan memakai data SIAKAD yang tersedia.</p>
            <nav class="portal-links">
                @foreach($tabs as $item)
                    <a class="portal-link {{ $tab === $item ? 'active' : '' }}" href="{{ $tabUrl($item) }}">{{ $tabLabels[$item] ?? $item }}</a>
                @endforeach
            </nav>
        </aside>

        <main class="portal-main">
            <div class="portal-head">
                <div>
                    <p class="eyebrow">Portal &gt; {{ $sectionLabel }}</p>
                    <h2 class="headline">{{ $tabLabels[$tab] ?? $sectionLabel }}</h2>
                </div>
                @if($section === 'pegawai')
                    <form method="get" action="{{ route('portal.index', ['section' => 'pegawai']) }}" style="min-width:300px">
                        <input type="hidden" name="tab" value="{{ $tab }}">
                        <label style="margin-top:0">Pegawai/Dosen
                            <select name="lecturerId" onchange="this.form.submit()">
                                @foreach($lecturers as $lecturer)
                                    <option value="{{ $lecturer->id }}" @selected($selectedLecturer?->id === $lecturer->id)>{{ $lecturer->nidn }} - {{ $lecturer->name }}</option>
                                @endforeach
                            </select>
                        </label>
                    </form>
                @endif
            </div>

            <div class="stats">
                <div class="stat"><span>Dosen</span><strong>{{ $stats['lecturers'] }}</strong></div>
                <div class="stat"><span>Pembimbing</span><strong>{{ $stats['advisors'] }}</strong></div>
                <div class="stat"><span>Periode</span><strong>{{ $stats['periods'] }}</strong></div>
                <div class="stat"><span>Orang Tua/Alumni</span><strong>{{ $stats['parents'] + $stats['alumni'] }}</strong></div>
            </div>

            <div class="pad">
                @if($tab === 'daftar-pegawai')
                    <div style="margin-bottom:14px"><a class="soft-btn" href="{{ route('master.lecturers') }}">Buka Master Dosen</a></div>
                    <div class="table-wrap"><table>
                        <thead><tr><th>NIDN/NIDK/NUPN</th><th>Nama</th><th>Email</th><th>Program Studi</th><th>Status</th><th>Aksi</th></tr></thead>
                        <tbody>
                        @forelse($lecturers as $lecturer)
                            <tr>
                                <td><strong>{{ $lecturer->nidn }}</strong></td>
                                <td>{{ $lecturer->name }}</td>
                                <td>{{ $lecturer->email ?? '-' }}</td>
                                <td>{{ $lecturer->studyProgramCode }} - {{ $lecturer->studyProgramName }}</td>
                                <td><span class="badge">{{ $lecturer->userStatus ?? 'ACTIVE' }}</span></td>
                                <td><a class="badge" href="{{ route('portal.index', ['section' => 'pegawai', 'tab' => 'detail-pegawai', 'lecturerId' => $lecturer->id]) }}">Detail</a></td>
                            </tr>
                        @empty
                            <tr><td colspan="6">Belum ada data pegawai/dosen.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'detail-pegawai')
                    @if($selectedLecturer)
                        <div class="cards">
                            <div class="info"><span>NIDN/NIDK/NUPN</span><strong>{{ $selectedLecturer->nidn }}</strong></div>
                            <div class="info"><span>Nama</span><strong>{{ $selectedLecturer->name }}</strong></div>
                            <div class="info"><span>Email</span><strong>{{ $selectedLecturer->email ?? '-' }}</strong></div>
                            <div class="info"><span>Program Studi</span><strong>{{ $selectedLecturer->studyProgramCode }} - {{ $selectedLecturer->studyProgramName }}</strong></div>
                        </div>
                    @else
                        <div class="empty">Belum ada data pegawai/dosen.</div>
                    @endif
                @elseif($tab === 'pembimbing')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Pembimbing</th><th>NIDN</th><th>Mahasiswa</th><th>NIM</th><th>Prodi</th></tr></thead>
                        <tbody>
                        @forelse($advisors as $advisor)
                            <tr><td>{{ $advisor->lecturerName }}</td><td>{{ $advisor->nidn }}</td><td>{{ $advisor->studentName }}</td><td>{{ $advisor->nim }}</td><td>{{ $advisor->studyProgramCode }} - {{ $advisor->studyProgramName }}</td></tr>
                        @empty
                            <tr><td colspan="5">Belum ada data pembimbing akademik.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'tanda-tangan')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Nama Pegawai</th><th>Nomor Induk</th><th>Prodi</th><th>Status Tanda Tangan</th></tr></thead>
                        <tbody>
                        @forelse($lecturers as $lecturer)
                            <tr><td>{{ $lecturer->name }}</td><td>{{ $lecturer->nidn }}</td><td>{{ $lecturer->studyProgramCode }} - {{ $lecturer->studyProgramName }}</td><td><span class="badge gray">Belum upload</span></td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada data pegawai/dosen.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'kalender-akademik')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Kode</th><th>Periode</th><th>Mulai</th><th>Selesai</th><th>Status</th></tr></thead>
                        <tbody>
                        @forelse($periods as $period)
                            <tr><td><strong>{{ $period->code }}</strong></td><td>{{ $period->name }}</td><td>{{ $period->startDate }}</td><td>{{ $period->endDate }}</td><td><span class="badge {{ $period->isActive ? '' : 'gray' }}">{{ $period->isActive ? 'Aktif' : 'Tidak Aktif' }}</span></td></tr>
                        @empty
                            <tr><td colspan="5">Belum ada kalender akademik.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'monitoring-kalender-akademik')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Periode</th><th>Program Studi</th><th>KRS</th><th>Validasi</th><th>Cetak UTS/UAS</th><th>Pertemuan</th></tr></thead>
                        <tbody>
                        @forelse($studyProgramSettings as $setting)
                            <tr>
                                <td>{{ $setting->periodName }}</td>
                                <td>{{ $setting->studyProgramCode }} - {{ $setting->studyProgramName }}</td>
                                <td>{{ $setting->openKrs ? 'Dibuka' : 'Ditutup' }}</td>
                                <td>{{ $setting->openKrsValidation ? 'Dibuka' : 'Ditutup' }}</td>
                                <td>{{ $setting->openPrintUts ? 'UTS' : '-' }} / {{ $setting->openPrintUas ? 'UAS' : '-' }}</td>
                                <td>{{ $setting->totalMeetings }}</td>
                            </tr>
                        @empty
                            <tr><td colspan="6">Belum ada setting kalender per prodi.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'monitoring-mahasiswa')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Orang Tua/Wali</th><th>Relasi</th><th>Kontak</th><th>Mahasiswa</th><th>Status</th><th>Prodi</th></tr></thead>
                        <tbody>
                        @forelse($parentRows as $parent)
                            <tr><td>{{ $parent->name }}</td><td>{{ $parent->relation }}</td><td>{{ $parent->phone ?? '-' }}</td><td>{{ $parent->nim }} - {{ $parent->studentName }}</td><td>{{ $parent->studentStatus }}</td><td>{{ $parent->studyProgramCode }} - {{ $parent->studyProgramName }}</td></tr>
                        @empty
                            <tr><td colspan="6">Belum ada data orang tua/wali.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'profil-alumni')
                    <div class="table-wrap"><table>
                        <thead><tr><th>NIM</th><th>Nama Alumni</th><th>Prodi</th><th>Periode Yudisium</th><th>Status</th></tr></thead>
                        <tbody>
                        @forelse($alumniRows as $alumni)
                            <tr><td><strong>{{ $alumni->nim }}</strong></td><td>{{ $alumni->studentName }}</td><td>{{ $alumni->studyProgramCode }} - {{ $alumni->studyProgramName }}</td><td>{{ $alumni->graduationName ?? $alumni->graduationCode ?? '-' }}</td><td><span class="badge">{{ $alumni->status }}</span></td></tr>
                        @empty
                            <tr><td colspan="5">Belum ada data alumni/yudisium.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @endif
            </div>
        </main>
    </div>
</div>
@endsection
