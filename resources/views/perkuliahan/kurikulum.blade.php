@extends('layouts.app', ['title' => 'Data Kurikulum'])

@php
    $tabLabels = [
        'tahun-kurikulum' => 'Tahun Kurikulum',
        'mata-kuliah' => 'Mata Kuliah',
        'kurikulum-prodi' => 'Kurikulum Prodi',
        'skala-nilai' => 'Skala Nilai',
        'komposisi-nilai' => 'Komposisi Nilai',
        'predikat-kelulusan' => 'Predikat Kelulusan',
        'aturan-evaluasi' => 'Aturan Evaluasi',
        'ekivalensi-mata-kuliah' => 'Ekivalensi Mata Kuliah',
        'kurikulum-konsentrasi' => 'Kurikulum Konsentrasi',
        'prasyarat-mata-kuliah' => 'Prasyarat Mata Kuliah',
        'grup-mk-wajib-pilihan' => 'Set Grup MK Wajib Pilihan',
    ];
    $tabUrl = fn (string $nextTab) => route('curriculum.index', ['tab' => $nextTab]);
    $mandatoryCourses = $courses->where('isMandatory', true);
    $optionalCourses = $courses->where('isMandatory', false);
@endphp

@section('content')
<style>
    .curriculum-layout{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:620px}
    .curriculum-side{border-right:1px solid #e5e7eb;background:#f8fafc;padding:16px}
    .side-mark{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:#dcfce7;color:#15803d;font-weight:900}
    .side-title{margin:12px 0 4px;font-size:20px;font-weight:900}
    .side-links{display:grid;gap:7px;margin-top:18px}
    .side-link{border:1px solid transparent;border-radius:12px;padding:10px 11px;color:#475569;font-size:12px;font-weight:900}
    .side-link:hover,.side-link.active{border-color:#86efac;background:#dcfce7;color:#166534}
    .curriculum-main{background:white}
    .curriculum-head{border-bottom:1px solid #e5e7eb;background:#fbfdfb;padding:18px}
    .headline{margin:3px 0 0;font-size:25px;font-weight:900}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #e5e7eb}
    .stat{padding:14px;border-right:1px solid #e5e7eb}.stat:last-child{border-right:0}
    .stat span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin-top:5px;font-size:22px}
    .pad{padding:18px}
    .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}
    .info{border:1px solid #e5e7eb;border-radius:12px;padding:14px}.info span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.info strong{display:block;margin-top:5px;font-size:18px}
    .empty{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-weight:800}
    @media(max-width:900px){.curriculum-layout,.stats,.cards{grid-template-columns:1fr}.curriculum-side{border-right:0;border-bottom:1px solid #e5e7eb}}
</style>

<div class="panel">
    <div class="curriculum-layout">
        <aside class="curriculum-side">
            <div class="side-mark">DK</div>
            <div class="side-title">Data Kurikulum</div>
            <p class="muted" style="margin:0">Pengelolaan struktur mata kuliah, nilai, prasyarat, dan ekivalensi.</p>
            <nav class="side-links">
                @foreach($tabs as $item)
                    <a class="side-link {{ $tab === $item ? 'active' : '' }}" href="{{ $tabUrl($item) }}">{{ $tabLabels[$item] ?? $item }}</a>
                @endforeach
            </nav>
        </aside>

        <main class="curriculum-main">
            <div class="curriculum-head">
                <p class="eyebrow">Perkuliahan &gt; Data Kurikulum</p>
                <h2 class="headline">{{ $tabLabels[$tab] ?? 'Data Kurikulum' }}</h2>
            </div>

            <div class="stats">
                <div class="stat"><span>Kurikulum</span><strong>{{ $stats['curricula'] }}</strong></div>
                <div class="stat"><span>Mata Kuliah</span><strong>{{ $stats['courses'] }}</strong></div>
                <div class="stat"><span>MK Kurikulum</span><strong>{{ $stats['curriculumCourses'] }}</strong></div>
                <div class="stat"><span>Skala Nilai</span><strong>{{ $stats['gradingScales'] }}</strong></div>
            </div>

            <div class="pad">
                @if($tab === 'tahun-kurikulum')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Tahun</th><th>Nama Kurikulum</th><th>Program Studi</th><th>Fakultas</th></tr></thead>
                        <tbody>
                        @forelse($curricula as $curriculum)
                            <tr><td><strong>{{ $curriculum->year }}</strong></td><td>{{ $curriculum->name }}</td><td>{{ $curriculum->studyProgramCode }} - {{ $curriculum->studyProgramName }}</td><td>{{ $curriculum->facultyName ?? '-' }}</td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada data tahun kurikulum.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'mata-kuliah')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Nilai Lulus</th><th>Jenis</th></tr></thead>
                        <tbody>
                        @forelse($courses as $course)
                            <tr><td><strong>{{ $course->code }}</strong></td><td>{{ $course->name }}</td><td>{{ $course->sks }}</td><td>{{ $course->minPassingGrade }}</td><td><span class="badge {{ $course->isMandatory ? '' : 'gray' }}">{{ $course->isMandatory ? 'Wajib' : 'Pilihan' }}</span></td></tr>
                        @empty
                            <tr><td colspan="5">Belum ada mata kuliah.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'kurikulum-prodi')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Kurikulum</th><th>Prodi</th><th>Semester</th><th>Kode MK</th><th>Mata Kuliah</th><th>SKS</th><th>Paket</th></tr></thead>
                        <tbody>
                        @forelse($curriculumCourses as $row)
                            <tr><td>{{ $row->curriculumName }} {{ $row->year }}</td><td>{{ $row->studyProgramCode }} - {{ $row->studyProgramName }}</td><td>{{ $row->semester }}</td><td>{{ $row->courseCode }}</td><td>{{ $row->courseName }}</td><td>{{ $row->sks }}</td><td>{{ $row->isPackage ? 'Ya' : 'Tidak' }}</td></tr>
                        @empty
                            <tr><td colspan="7">Belum ada kurikulum prodi.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'skala-nilai')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Huruf</th><th>Nilai Minimum</th><th>Nilai Maksimum</th><th>Bobot</th></tr></thead>
                        <tbody>
                        @forelse($gradingScales as $scale)
                            <tr><td><strong>{{ $scale->letter }}</strong></td><td>{{ $scale->minValue }}</td><td>{{ $scale->maxValue }}</td><td>{{ number_format($scale->gradePoint, 2) }}</td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada skala nilai.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'komposisi-nilai')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Komponen</th><th>Persentase</th><th>Kelas</th><th>Mata Kuliah</th></tr></thead>
                        <tbody>
                        @forelse($gradeComponents as $component)
                            <tr><td><strong>{{ $component->name }}</strong></td><td>{{ $component->percentage }}%</td><td>{{ $component->className ?? 'Global' }}</td><td>{{ $component->courseCode ? $component->courseCode.' - '.$component->courseName : '-' }}</td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada komposisi nilai.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'predikat-kelulusan')
                    <div class="cards">
                        <div class="info"><span>Dengan Pujian</span><strong>IPK 3.51 - 4.00</strong></div>
                        <div class="info"><span>Sangat Memuaskan</span><strong>IPK 3.01 - 3.50</strong></div>
                        <div class="info"><span>Memuaskan</span><strong>IPK 2.76 - 3.00</strong></div>
                    </div>
                    <div class="empty">Predikat kelulusan ditampilkan sebagai aturan akademik umum. Tambahkan tabel khusus bila kampus memiliki aturan predikat per prodi.</div>
                @elseif($tab === 'aturan-evaluasi')
                    <div class="cards">
                        <div class="info"><span>Minimal Nilai Lulus</span><strong>{{ $courses->min('minPassingGrade') ?? '-' }}</strong></div>
                        <div class="info"><span>Rata-rata SKS MK</span><strong>{{ number_format($courses->avg('sks') ?? 0, 1) }}</strong></div>
                        <div class="info"><span>Total MK Wajib</span><strong>{{ $mandatoryCourses->count() }}</strong></div>
                    </div>
                    <div class="table-wrap"><table>
                        <thead><tr><th>Kode</th><th>Mata Kuliah</th><th>SKS</th><th>Minimal Lulus</th></tr></thead>
                        <tbody>
                        @forelse($courses as $course)
                            <tr><td>{{ $course->code }}</td><td>{{ $course->name }}</td><td>{{ $course->sks }}</td><td>{{ $course->minPassingGrade }}</td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada aturan evaluasi mata kuliah.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'ekivalensi-mata-kuliah')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Mata Kuliah Lama</th><th>Setara Dengan</th></tr></thead>
                        <tbody>
                        @forelse($courseEquivalences as $row)
                            <tr><td>{{ $row->fromCode }} - {{ $row->fromName }}</td><td>{{ $row->toCode }} - {{ $row->toName }}</td></tr>
                        @empty
                            <tr><td colspan="2">Belum ada ekivalensi mata kuliah.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'kurikulum-konsentrasi')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Prodi</th><th>Kurikulum</th><th>Semester</th><th>Mata Kuliah</th><th>Jenis</th></tr></thead>
                        <tbody>
                        @forelse($curriculumCourses as $row)
                            <tr><td>{{ $row->studyProgramCode }} - {{ $row->studyProgramName }}</td><td>{{ $row->curriculumName }}</td><td>{{ $row->semester }}</td><td>{{ $row->courseCode }} - {{ $row->courseName }}</td><td>{{ $row->isMandatory ? 'Konsentrasi Utama/Wajib' : 'Peminatan/Pilihan' }}</td></tr>
                        @empty
                            <tr><td colspan="5">Belum ada kurikulum konsentrasi.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'prasyarat-mata-kuliah')
                    <div class="table-wrap"><table>
                        <thead><tr><th>Mata Kuliah</th><th>Prasyarat</th></tr></thead>
                        <tbody>
                        @forelse($coursePrerequisites as $row)
                            <tr><td>{{ $row->courseCode }} - {{ $row->courseName }}</td><td>{{ $row->prerequisiteCode }} - {{ $row->prerequisiteName }}</td></tr>
                        @empty
                            <tr><td colspan="2">Belum ada prasyarat mata kuliah.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @elseif($tab === 'grup-mk-wajib-pilihan')
                    <div class="cards">
                        <div class="info"><span>Mata Kuliah Wajib</span><strong>{{ $mandatoryCourses->count() }}</strong></div>
                        <div class="info"><span>Mata Kuliah Pilihan</span><strong>{{ $optionalCourses->count() }}</strong></div>
                        <div class="info"><span>Total SKS</span><strong>{{ $courses->sum('sks') }}</strong></div>
                    </div>
                    <div class="table-wrap"><table>
                        <thead><tr><th>Grup</th><th>Kode</th><th>Mata Kuliah</th><th>SKS</th></tr></thead>
                        <tbody>
                        @forelse($courses as $course)
                            <tr><td><span class="badge {{ $course->isMandatory ? '' : 'gray' }}">{{ $course->isMandatory ? 'Wajib' : 'Pilihan' }}</span></td><td>{{ $course->code }}</td><td>{{ $course->name }}</td><td>{{ $course->sks }}</td></tr>
                        @empty
                            <tr><td colspan="4">Belum ada grup mata kuliah.</td></tr>
                        @endforelse
                        </tbody>
                    </table></div>
                @endif
            </div>
        </main>
    </div>
</div>
@endsection
