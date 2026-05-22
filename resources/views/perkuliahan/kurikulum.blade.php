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
    $attachmentsFor = fn (string $table, string $id) => $attachments->get($table.'|'.$id, collect());
@endphp

@section('content')
<style>
    .curriculum-layout{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:620px}
    .curriculum-side{border-right:1px solid #e5e7eb;background:#f8fafc;padding:16px}
    .side-mark{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:#dcfce7;color:#15803d;font-weight:900}
    .side-title{margin:12px 0 4px;font-size:20px;font-weight:900}.side-links{display:grid;gap:7px;margin-top:18px}
    .side-link{border:1px solid transparent;border-radius:12px;padding:10px 11px;color:#475569;font-size:12px;font-weight:900}.side-link:hover,.side-link.active{border-color:#86efac;background:#dcfce7;color:#166534}
    .curriculum-main{background:white}.curriculum-head{border-bottom:1px solid #e5e7eb;background:#fbfdfb;padding:18px}.headline{margin:3px 0 0;font-size:25px;font-weight:900}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #e5e7eb}.stat{padding:14px;border-right:1px solid #e5e7eb}.stat:last-child{border-right:0}.stat span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin-top:5px;font-size:22px}
    .pad{padding:18px}.crud-card{border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}
    .cards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-bottom:14px}.info{border:1px solid #e5e7eb;border-radius:12px;padding:14px}.info span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.info strong{display:block;margin-top:5px;font-size:18px}
    .action-row{display:flex;flex-wrap:wrap;gap:8px}.danger{background:#ef4444}.danger:hover{background:#dc2626}.preview-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.preview-img{width:96px;height:70px;object-fit:cover;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc}
    .mini-form{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-top:8px}.empty{border:1px dashed #cbd5e1;border-radius:12px;background:#f8fafc;padding:20px;text-align:center;color:#64748b;font-weight:800}
    @media(max-width:950px){.curriculum-layout,.stats,.cards,.form-grid,.mini-form{grid-template-columns:1fr}.curriculum-side{border-right:0;border-bottom:1px solid #e5e7eb}}
</style>

@php
    $attachmentBlock = function (string $resource, string $table, string $id) use ($attachmentsFor, $previewUrl, $tab) {
        $items = $attachmentsFor($table, $id);
@endphp
        <div class="preview-grid">
            @foreach($items as $attachment)
                <span>
                    <img class="preview-img" src="{{ $previewUrl($attachment->imageUrl) }}" alt="{{ $attachment->title }}">
                    <form method="post" action="{{ route('curriculum.attachments.destroy', $attachment->id) }}">
                        @csrf
                        @method('DELETE')
                        <button class="badge gray" type="submit" style="border:0;margin-top:4px">Hapus</button>
                    </form>
                </span>
            @endforeach
        </div>
        <form class="mini-form" method="post" action="{{ route('curriculum.attachments.store', ['resource' => $resource, 'id' => $id, 'tab' => $tab]) }}">
            @csrf
            <label>Judul gambar<input name="title" placeholder="Preview / dokumen"></label>
            <label>Link Google Drive / gambar<input name="imageUrl" placeholder="https://drive.google.com/file/d/.../view"></label>
            <button class="btn" type="submit">Upload Link</button>
        </form>
@php
    };
@endphp

<div class="panel">
    <div class="curriculum-layout">
        <aside class="curriculum-side">
            <div class="side-mark">DK</div>
            <div class="side-title">Data Kurikulum</div>
            <p class="muted" style="margin:0">CRUD tabel kurikulum, mata kuliah, nilai, prasyarat, dan ekivalensi.</p>
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
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'curricula', 'tab' => $tab]) }}">
                        @csrf
                        <label>Program Studi<select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}">{{ $program->code }} - {{ $program->name }}</option>@endforeach</select></label>
                        <label>Tahun<input type="number" name="year" value="{{ date('Y') }}"></label>
                        <label>Nama Kurikulum<input name="name" required></label>
                        <button class="btn" type="submit">Tambah Kurikulum</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Tahun</th><th>Nama</th><th>Program Studi</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($curricula as $row)
                        <tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'curricula', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                            <td><input type="number" name="year" value="{{ $row->year }}"></td><td><input name="name" value="{{ $row->name }}"></td>
                            <td><select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}" @selected($row->studyProgramId === $program->id)>{{ $program->code }} - {{ $program->name }}</option>@endforeach</select></td>
                            <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'curricula', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('curricula', 'Curriculum', $row->id) !!}</td>
                        </tr>
                    @empty<tr><td colspan="4">Belum ada kurikulum.</td></tr>@endforelse
                    </tbody></table></div>
                @elseif(in_array($tab, ['mata-kuliah','aturan-evaluasi','grup-mk-wajib-pilihan'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'courses', 'tab' => $tab]) }}">
                        @csrf
                        <label>Kode<input name="code" required></label><label>Nama MK<input name="name" required></label><label>SKS<input type="number" name="sks" value="3" min="1"></label><label>Nilai Lulus<input name="minPassingGrade" value="C"></label><label><input type="checkbox" name="isMandatory" value="1" style="width:auto" checked> Wajib</label><button class="btn" type="submit">Tambah MK</button>
                    </form>
                    <div class="cards">
                        <div class="info"><span>MK Wajib</span><strong>{{ $mandatoryCourses->count() }}</strong></div><div class="info"><span>MK Pilihan</span><strong>{{ $optionalCourses->count() }}</strong></div><div class="info"><span>Total SKS</span><strong>{{ $courses->sum('sks') }}</strong></div>
                    </div>
                    <div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama</th><th>SKS</th><th>Lulus</th><th>Jenis</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($courses as $row)
                        <tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'courses', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                            <td><input name="code" value="{{ $row->code }}"></td><td><input name="name" value="{{ $row->name }}"></td><td><input type="number" name="sks" value="{{ $row->sks }}"></td><td><input name="minPassingGrade" value="{{ $row->minPassingGrade }}"></td><td><input type="checkbox" name="isMandatory" value="1" style="width:auto" @checked($row->isMandatory)> Wajib</td>
                            <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'courses', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('courses', 'Course', $row->id) !!}</td>
                        </tr>
                    @empty<tr><td colspan="6">Belum ada mata kuliah.</td></tr>@endforelse
                    </tbody></table></div>
                @elseif(in_array($tab, ['kurikulum-prodi','kurikulum-konsentrasi'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'curriculum-courses', 'tab' => $tab]) }}">
                        @csrf
                        <label>Kurikulum<select name="curriculumId">@foreach($plainCurricula as $curriculum)<option value="{{ $curriculum->id }}">{{ $curriculum->year }} - {{ $curriculum->name }}</option>@endforeach</select></label>
                        <label>Mata Kuliah<select name="courseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label>
                        <label>Semester<input type="number" name="semester" min="1" value="1"></label><label><input type="checkbox" name="isPackage" value="1" style="width:auto"> Paket</label><button class="btn" type="submit">Tambah MK Kurikulum</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Kurikulum</th><th>MK</th><th>Semester</th><th>Paket</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($curriculumCourses as $row)
                        <tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'curriculum-courses', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                            <td><select name="curriculumId">@foreach($plainCurricula as $curriculum)<option value="{{ $curriculum->id }}" @selected($row->curriculumId === $curriculum->id)>{{ $curriculum->year }} - {{ $curriculum->name }}</option>@endforeach</select></td>
                            <td><select name="courseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}" @selected($row->courseId === $course->id)>{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></td>
                            <td><input type="number" name="semester" value="{{ $row->semester }}"></td><td><input type="checkbox" name="isPackage" value="1" style="width:auto" @checked($row->isPackage)> Paket</td>
                            <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'curriculum-courses', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('curriculum-courses', 'CurriculumCourse', $row->id) !!}</td>
                        </tr>
                    @empty<tr><td colspan="5">Belum ada kurikulum prodi.</td></tr>@endforelse
                    </tbody></table></div>
                @elseif($tab === 'skala-nilai')
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'grading-scales', 'tab' => $tab]) }}">@csrf
                        <label>Huruf<input name="letter" value="A"></label><label>Min<input type="number" step="0.01" name="minValue" value="80"></label><label>Max<input type="number" step="0.01" name="maxValue" value="100"></label><label>Bobot<input type="number" step="0.01" name="gradePoint" value="4"></label><button class="btn" type="submit">Tambah Skala</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Huruf</th><th>Min</th><th>Max</th><th>Bobot</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($gradingScales as $row)<tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'grading-scales', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><input name="letter" value="{{ $row->letter }}"></td><td><input type="number" step="0.01" name="minValue" value="{{ $row->minValue }}"></td><td><input type="number" step="0.01" name="maxValue" value="{{ $row->maxValue }}"></td><td><input type="number" step="0.01" name="gradePoint" value="{{ $row->gradePoint }}"></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'grading-scales', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('grading-scales', 'GradingScale', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="5">Belum ada skala nilai.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'komposisi-nilai')
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'grade-components', 'tab' => $tab]) }}">@csrf
                        <label>Nama Komponen<input name="name" required></label><label>Persentase<input type="number" step="0.01" name="percentage" value="10"></label><label>Kelas<select name="classId"><option value="">Global</option>@foreach($plainClasses as $class)<option value="{{ $class->id }}">{{ $class->name }}</option>@endforeach</select></label><button class="btn" type="submit">Tambah Komponen</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Komponen</th><th>Persentase</th><th>Kelas</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($gradeComponents as $row)<tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'grade-components', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><input name="name" value="{{ $row->name }}"></td><td><input type="number" step="0.01" name="percentage" value="{{ $row->percentage }}"></td><td><select name="classId"><option value="">Global</option>@foreach($plainClasses as $class)<option value="{{ $class->id }}" @selected($row->classId === $class->id)>{{ $class->name }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'grade-components', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('grade-components', 'GradeComponent', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="4">Belum ada komposisi nilai.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'ekivalensi-mata-kuliah')
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'equivalences', 'tab' => $tab]) }}">@csrf
                        <label>MK Lama<select name="fromCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label><label>Setara Dengan<select name="toCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label><button class="btn" type="submit">Tambah Ekivalensi</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>MK Lama</th><th>MK Baru</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($courseEquivalences as $row)<tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'equivalences', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><select name="fromCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}" @selected($row->fromCourseId === $course->id)>{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></td><td><select name="toCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}" @selected($row->toCourseId === $course->id)>{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'equivalences', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('equivalences', 'CourseEquivalence', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="3">Belum ada ekivalensi.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'prasyarat-mata-kuliah')
                    <form class="crud-card form-grid" method="post" action="{{ route('curriculum.store', ['resource' => 'prerequisites', 'tab' => $tab]) }}">@csrf
                        <label>Mata Kuliah<select name="courseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label><label>Prasyarat<select name="prerequisiteCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label><button class="btn" type="submit">Tambah Prasyarat</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Mata Kuliah</th><th>Prasyarat</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($coursePrerequisites as $row)<tr><form method="post" action="{{ route('curriculum.update', ['resource' => 'prerequisites', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><select name="courseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}" @selected($row->courseId === $course->id)>{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></td><td><select name="prerequisiteCourseId">@foreach($plainCourses as $course)<option value="{{ $course->id }}" @selected($row->prerequisiteCourseId === $course->id)>{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('curriculum.destroy', ['resource' => 'prerequisites', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('prerequisites', 'CoursePrerequisite', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="3">Belum ada prasyarat.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'predikat-kelulusan')
                    <div class="cards"><div class="info"><span>Dengan Pujian</span><strong>IPK 3.51 - 4.00</strong></div><div class="info"><span>Sangat Memuaskan</span><strong>IPK 3.01 - 3.50</strong></div><div class="info"><span>Memuaskan</span><strong>IPK 2.76 - 3.00</strong></div></div>
                    <div class="empty">Belum ada tabel khusus predikat kelulusan di database saat ini. Jika tabelnya ditambahkan, submenu ini bisa saya hubungkan menjadi CRUD tabel tersebut.</div>
                @endif
            </div>
        </main>
    </div>
</div>
@endsection
