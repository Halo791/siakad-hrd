@extends('layouts.app', ['title' => 'Data Kelas'])

@php
    $tabLabels = [
        'tahun-ajaran' => 'Tahun Ajaran',
        'kelas-kuliah' => 'Kelas Kuliah',
        'detail-kelas-kuliah' => 'Detail Kelas Kuliah',
        'dosen-pengajar' => 'Dosen Pengajar',
        'jadwal-perkuliahan' => 'Jadwal Perkuliahan',
        'peserta-kelas' => 'Peserta Kelas',
        'presensi-kelas' => 'Presensi Kelas',
        'nilai-perkuliahan' => 'Nilai Perkuliahan',
        'jadwal-presensi' => 'Jadwal & Presensi',
        'pemutihan-nilai' => 'Pemutihan Nilai',
    ];
    $tabUrl = fn (string $nextTab) => route('classes.index', ['tab' => $nextTab]);
    $classLabel = fn ($class) => trim(($class->name ?? '').' - '.($class->courseCode ?? '').' '.($class->courseName ?? ''));
    $attachmentsFor = fn (string $table, string $id) => $attachments->get($table.'|'.$id, collect());
@endphp

@section('content')
<style>
    .class-layout{display:grid;grid-template-columns:260px minmax(0,1fr);min-height:640px}
    .class-side{border-right:1px solid #e5e7eb;background:#f8fafc;padding:16px}
    .side-mark{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:#dcfce7;color:#15803d;font-weight:900}
    .side-title{margin:12px 0 4px;font-size:20px;font-weight:900}
    .side-links{display:grid;gap:7px;margin-top:18px}
    .side-link{border:1px solid transparent;border-radius:12px;padding:10px 11px;color:#475569;font-size:12px;font-weight:900}
    .side-link:hover,.side-link.active{border-color:#86efac;background:#dcfce7;color:#166534}
    .class-main{background:white}.class-head{border-bottom:1px solid #e5e7eb;background:#fbfdfb;padding:18px}.headline{margin:3px 0 0;font-size:25px;font-weight:900}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #e5e7eb}.stat{padding:14px;border-right:1px solid #e5e7eb}.stat:last-child{border-right:0}.stat span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin-top:5px;font-size:22px}
    .pad{padding:18px}.crud-card{border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}.form-grid .wide{grid-column:span 2}
    .action-row{display:flex;flex-wrap:wrap;gap:8px}.danger{background:#ef4444}.danger:hover{background:#dc2626}.preview-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.preview-img{width:96px;height:70px;object-fit:cover;border:1px solid #e5e7eb;border-radius:10px;background:#f8fafc}
    .mini-form{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-top:8px}.muted-small{color:#64748b;font-size:12px;font-weight:700}
    @media(max-width:950px){.class-layout,.stats,.form-grid,.mini-form{grid-template-columns:1fr}.class-side{border-right:0;border-bottom:1px solid #e5e7eb}.form-grid .wide{grid-column:auto}}
</style>

<div class="panel">
    <div class="class-layout">
        <aside class="class-side">
            <div class="side-mark">DK</div>
            <div class="side-title">Data Kelas</div>
            <p class="muted" style="margin:0">CRUD tabel kelas kuliah, jadwal, dosen, peserta, presensi, dan nilai.</p>
            <nav class="side-links">
                @foreach($tabs as $item)
                    <a class="side-link {{ $tab === $item ? 'active' : '' }}" href="{{ $tabUrl($item) }}">{{ $tabLabels[$item] }}</a>
                @endforeach
            </nav>
        </aside>

        <main class="class-main">
            <div class="class-head">
                <p class="eyebrow">Perkuliahan &gt; Data Kelas</p>
                <h2 class="headline">{{ $tabLabels[$tab] }}</h2>
            </div>
            <div class="stats">
                <div class="stat"><span>Periode</span><strong>{{ $stats['periods'] }}</strong></div>
                <div class="stat"><span>Kelas</span><strong>{{ $stats['classes'] }}</strong></div>
                <div class="stat"><span>Peserta</span><strong>{{ $stats['students'] }}</strong></div>
                <div class="stat"><span>Nilai</span><strong>{{ $stats['grades'] }}</strong></div>
            </div>

            <div class="pad">
                @if($tab === 'tahun-ajaran')
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'periods', 'tab' => $tab]) }}">
                        @csrf
                        <label>Tahun Akademik<select name="academicYearId">@foreach($academicYears as $year)<option value="{{ $year->id }}">{{ $year->code }} - {{ $year->name }}</option>@endforeach</select></label>
                        <label>Kode<input name="code" required></label>
                        <label>Nama<input name="name" required></label>
                        <label>Mulai<input type="date" name="startDate" required></label>
                        <label>Selesai<input type="date" name="endDate" required></label>
                        <label><input type="checkbox" name="isActive" value="1" style="width:auto"> Aktif</label>
                        <button class="btn" type="submit">Tambah Periode</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>Kode</th><th>Nama</th><th>Tahun</th><th>Mulai</th><th>Selesai</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($periods as $row)
                        <tr><form method="post" action="{{ route('classes.update', ['resource' => 'periods', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                            <td><input name="code" value="{{ $row->code }}"></td><td><input name="name" value="{{ $row->name }}"></td>
                            <td><select name="academicYearId">@foreach($academicYears as $year)<option value="{{ $year->id }}" @selected($row->academicYearId === $year->id)>{{ $year->code }}</option>@endforeach</select></td>
                            <td><input type="date" name="startDate" value="{{ substr($row->startDate, 0, 10) }}"></td><td><input type="date" name="endDate" value="{{ substr($row->endDate, 0, 10) }}"></td>
                            <td><label style="margin:0"><input type="checkbox" name="isActive" value="1" style="width:auto" @checked($row->isActive)> Aktif</label></td>
                            <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'periods', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'periods', 'table' => 'AcademicPeriod', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                        </tr>
                    @empty<tr><td colspan="7">Belum ada periode.</td></tr>@endforelse
                    </tbody></table></div>
                @elseif(in_array($tab, ['kelas-kuliah','detail-kelas-kuliah'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'classes', 'tab' => $tab]) }}">
                        @csrf
                        <label>Prodi<select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}">{{ $program->code }} - {{ $program->name }}</option>@endforeach</select></label>
                        <label>Mata Kuliah<select name="courseId">@foreach($courses as $course)<option value="{{ $course->id }}">{{ $course->code }} - {{ $course->name }}</option>@endforeach</select></label>
                        <label>Periode<select name="periodId">@foreach($periods as $period)<option value="{{ $period->id }}">{{ $period->name }}</option>@endforeach</select></label>
                        <label>Nama Kelas<input name="name" required></label><label>Kapasitas<input type="number" name="capacity" min="1" value="30"></label>
                        <button class="btn" type="submit">Tambah Kelas</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>Kelas</th><th>Prodi</th><th>MK</th><th>Periode</th><th>Kapasitas</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($classes as $row)
                        <tr><form method="post" action="{{ route('classes.update', ['resource' => 'classes', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                            <td><input name="name" value="{{ $row->name }}"></td>
                            <td><select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}" @selected($row->studyProgramId === $program->id)>{{ $program->code }}</option>@endforeach</select></td>
                            <td><select name="courseId">@foreach($courses as $course)<option value="{{ $course->id }}" @selected($row->courseId === $course->id)>{{ $course->code }}</option>@endforeach</select></td>
                            <td><select name="periodId">@foreach($periods as $period)<option value="{{ $period->id }}" @selected($row->periodId === $period->id)>{{ $period->name }}</option>@endforeach</select></td>
                            <td><input type="number" name="capacity" value="{{ $row->capacity }}"></td>
                            <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'classes', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'classes', 'table' => 'Class', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                        </tr>
                    @empty<tr><td colspan="6">Belum ada kelas.</td></tr>@endforelse
                    </tbody></table></div>
                @elseif($tab === 'dosen-pengajar')
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'lecturers', 'tab' => $tab]) }}">@csrf
                        <label>Kelas<select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}">{{ $classLabel($class) }}</option>@endforeach</select></label>
                        <label>Dosen<select name="lecturerId">@foreach($plainLecturers as $lecturer)<option value="{{ $lecturer->id }}">{{ $lecturer->nidn }} - {{ $lecturer->name }}</option>@endforeach</select></label>
                        <label><input type="checkbox" name="isPrimary" value="1" style="width:auto"> Dosen Utama</label><button class="btn" type="submit">Tambah Dosen</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>Kelas</th><th>Dosen</th><th>Utama</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($classLecturers as $row)<tr><form method="post" action="{{ route('classes.update', ['resource' => 'lecturers', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}" @selected($row->classId === $class->id)>{{ $classLabel($class) }}</option>@endforeach</select></td>
                        <td><select name="lecturerId">@foreach($plainLecturers as $lecturer)<option value="{{ $lecturer->id }}" @selected($row->lecturerId === $lecturer->id)>{{ $lecturer->name }}</option>@endforeach</select></td>
                        <td><input type="checkbox" name="isPrimary" value="1" style="width:auto" @checked($row->isPrimary)></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'lecturers', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'lecturers', 'table' => 'ClassLecturer', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                    </tr>@empty<tr><td colspan="4">Belum ada dosen pengajar.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'jadwal-perkuliahan')
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'schedules', 'tab' => $tab]) }}">@csrf
                        <label>Kelas<select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}">{{ $classLabel($class) }}</option>@endforeach</select></label><label>Hari<input type="number" name="dayOfWeek" min="1" max="7" value="1"></label><label>Ruang<input name="room"></label><label>Mulai<input name="startTime" value="08:00"></label><label>Selesai<input name="endTime" value="09:40"></label><button class="btn" type="submit">Tambah Jadwal</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>Kelas</th><th>Hari</th><th>Waktu</th><th>Ruang</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($schedules as $row)<tr><form method="post" action="{{ route('classes.update', ['resource' => 'schedules', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}" @selected($row->classId === $class->id)>{{ $classLabel($class) }}</option>@endforeach</select></td><td><input type="number" name="dayOfWeek" min="1" max="7" value="{{ $row->dayOfWeek }}"></td><td><input name="startTime" value="{{ $row->startTime }}"><input name="endTime" value="{{ $row->endTime }}"></td><td><input name="room" value="{{ $row->room }}"></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'schedules', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'schedules', 'table' => 'ClassSchedule', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                    </tr>@empty<tr><td colspan="5">Belum ada jadwal.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'peserta-kelas')
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'students', 'tab' => $tab]) }}">@csrf
                        <label>Kelas<select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}">{{ $classLabel($class) }}</option>@endforeach</select></label><label>Mahasiswa<select name="studentId">@foreach($plainStudents as $student)<option value="{{ $student->id }}">{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></label><button class="btn" type="submit">Tambah Peserta</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>Kelas</th><th>Mahasiswa</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($classStudents as $row)<tr><form method="post" action="{{ route('classes.update', ['resource' => 'students', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td><select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}" @selected($row->classId === $class->id)>{{ $classLabel($class) }}</option>@endforeach</select></td><td><select name="studentId">@foreach($plainStudents as $student)<option value="{{ $student->id }}" @selected($row->studentId === $student->id)>{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'students', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'students', 'table' => 'ClassStudent', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                    </tr>@empty<tr><td colspan="3">Belum ada peserta.</td></tr>@endforelse</tbody></table></div>
                @elseif(in_array($tab, ['presensi-kelas','jadwal-presensi'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'meetings', 'tab' => $tab]) }}">@csrf
                        <label>Kelas<select name="classId">@foreach($classes as $class)<option value="{{ $class->id }}">{{ $classLabel($class) }}</option>@endforeach</select></label><label>Pertemuan<input type="number" name="meetingNo" min="1" value="1"></label><label>Tanggal<input type="date" name="meetingDate"></label><button class="btn" type="submit">Tambah Pertemuan</button>
                    </form>
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'attendances', 'tab' => $tab]) }}">@csrf
                        <label>Pertemuan<select name="meetingId">@foreach($meetings as $meeting)<option value="{{ $meeting->id }}">{{ $meeting->courseCode }} P{{ $meeting->meetingNo }} - {{ substr($meeting->meetingDate,0,10) }}</option>@endforeach</select></label><label>Peserta<select name="classStudentId">@foreach($classStudents as $student)<option value="{{ $student->id }}">{{ $student->nim }} - {{ $student->studentName }}</option>@endforeach</select></label><label>Status<select name="status"><option value="PRESENT">Hadir</option><option value="PERMIT">Izin</option><option value="SICK">Sakit</option><option value="ABSENT">Alpha</option></select></label><button class="btn" type="submit">Tambah Presensi</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>MK</th><th>Pertemuan</th><th>Mahasiswa</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($attendances as $row)<tr><form method="post" action="{{ route('classes.update', ['resource' => 'attendances', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td>{{ $row->courseCode }} - {{ $row->courseName }}</td><td><select name="meetingId">@foreach($meetings as $meeting)<option value="{{ $meeting->id }}" @selected($row->meetingId === $meeting->id)>P{{ $meeting->meetingNo }} - {{ substr($meeting->meetingDate,0,10) }}</option>@endforeach</select></td><td><select name="classStudentId">@foreach($classStudents as $student)<option value="{{ $student->id }}" @selected($row->classStudentId === $student->id)>{{ $student->nim }} - {{ $student->studentName }}</option>@endforeach</select></td><td><select name="status">@foreach(['PRESENT','PERMIT','SICK','ABSENT'] as $status)<option value="{{ $status }}" @selected($row->status === $status)>{{ $status }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'attendances', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'attendances', 'table' => 'Attendance', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                    </tr>@empty<tr><td colspan="5">Belum ada presensi.</td></tr>@endforelse</tbody></table></div>
                @elseif(in_array($tab, ['nilai-perkuliahan','pemutihan-nilai'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('classes.store', ['resource' => 'grades', 'tab' => $tab]) }}">@csrf
                        <label>Peserta<select name="classStudentId">@foreach($classStudents as $student)<option value="{{ $student->id }}">{{ $student->courseCode }} - {{ $student->nim }} {{ $student->studentName }}</option>@endforeach</select></label><label>Nilai<input type="number" name="score" min="0" max="100" value="0"></label><label>Huruf<input name="letter" value="A"></label><label><input type="checkbox" name="isLocked" value="1" style="width:auto"> Kunci Nilai</label><button class="btn" type="submit">Tambah Nilai</button>
                    </form>
                    <div class="table-wrap" data-title="{{ $tabLabels[$tab] ?? 'Tabel Data' }}"><table><thead><tr><th>MK</th><th>Mahasiswa</th><th>Nilai</th><th>Huruf</th><th>Kunci</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($grades as $row)<tr><form method="post" action="{{ route('classes.update', ['resource' => 'grades', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('PATCH')
                        <td>{{ $row->courseCode }} - {{ $row->courseName }}</td><td><select name="classStudentId">@foreach($classStudents as $student)<option value="{{ $student->id }}" @selected($row->classStudentId === $student->id)>{{ $student->nim }} - {{ $student->studentName }}</option>@endforeach</select></td><td><input type="number" name="score" min="0" max="100" value="{{ $row->score }}"></td><td><input name="letter" value="{{ $row->letter }}"></td><td><input type="checkbox" name="isLocked" value="1" style="width:auto" @checked($row->isLocked)></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('classes.destroy', ['resource' => 'grades', 'id' => $row->id, 'tab' => $tab]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>@include('partials.record-attachments', ['resource' => 'grades', 'table' => 'Grade', 'id' => $row->id, 'storeRoute' => 'classes.attachments.store', 'destroyRoute' => 'classes.attachments.destroy', 'extraParams' => ['tab' => $tab]])</td>
                    </tr>@empty<tr><td colspan="6">Belum ada nilai.</td></tr>@endforelse</tbody></table></div>
                @endif
            </div>
        </main>
    </div>
</div>
@endsection
