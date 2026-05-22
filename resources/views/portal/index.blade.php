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
    $attachmentsFor = fn (string $table, string $id) => $attachments->get($table.'|'.$id, collect());
@endphp

@section('content')
<style>
    .portal-grid{display:grid;grid-template-columns:250px minmax(0,1fr);min-height:560px}.portal-side{border-right:1px solid #e5e7eb;background:#f8fafc;padding:16px}.portal-mark{display:grid;width:54px;height:54px;place-items:center;border-radius:14px;background:#dcfce7;color:#15803d;font-weight:900}.portal-title{margin:12px 0 4px;font-size:20px;font-weight:900}.portal-links{display:grid;gap:8px;margin-top:18px}.portal-link{border:1px solid transparent;border-radius:12px;padding:11px 12px;color:#475569;font-size:13px;font-weight:900}.portal-link:hover,.portal-link.active{border-color:#86efac;background:#dcfce7;color:#166534}.portal-main{background:white}.portal-head{border-bottom:1px solid #e5e7eb;background:#fbfdfb;padding:18px}.headline{margin:3px 0 0;font-size:25px;font-weight:900}
    .stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));border-bottom:1px solid #e5e7eb}.stat{padding:14px;border-right:1px solid #e5e7eb}.stat:last-child{border-right:0}.stat span{display:block;color:#64748b;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}.stat strong{display:block;margin-top:5px;font-size:22px}.pad{padding:18px}.crud-card{border:1px solid #e5e7eb;border-radius:14px;padding:16px;margin-bottom:16px}.form-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;align-items:end}.action-row{display:flex;flex-wrap:wrap;gap:8px}.danger{background:#ef4444}.danger:hover{background:#dc2626}.preview-grid{display:flex;flex-wrap:wrap;gap:8px;margin-top:8px}.preview-img{width:96px;height:70px;object-fit:cover;border:1px solid #e5e7eb;border-radius:10px}.mini-form{display:grid;grid-template-columns:1fr 1fr auto;gap:8px;align-items:end;margin-top:8px}
    @media(max-width:900px){.portal-grid,.stats,.form-grid,.mini-form{grid-template-columns:1fr}.portal-side{border-right:0;border-bottom:1px solid #e5e7eb}}
</style>

@php
    $attachmentBlock = function (string $resource, string $table, string $id) use ($attachmentsFor, $previewUrl) {
        $items = $attachmentsFor($table, $id);
@endphp
        <div class="preview-grid">
            @foreach($items as $attachment)
                <span><img class="preview-img" src="{{ $previewUrl($attachment->imageUrl) }}" alt="{{ $attachment->title }}"><form method="post" action="{{ route('portal.attachments.destroy', $attachment->id) }}">@csrf @method('DELETE')<button class="badge gray" type="submit" style="border:0;margin-top:4px">Hapus</button></form></span>
            @endforeach
        </div>
        <form class="mini-form" method="post" action="{{ route('portal.attachments.store', ['resource' => $resource, 'id' => $id]) }}">
            @csrf
            <label>Judul gambar<input name="title" placeholder="Foto / tanda tangan / bukti"></label>
            <label>Link Google Drive / gambar<input name="imageUrl" placeholder="https://drive.google.com/file/d/.../view"></label>
            <button class="btn" type="submit">Upload Link</button>
        </form>
@php
    };
@endphp

<div class="panel">
    <div class="portal-grid">
        <aside class="portal-side">
            <div class="portal-mark">{{ strtoupper(substr($sectionLabel, 0, 2)) }}</div>
            <div class="portal-title">{{ $sectionLabel }}</div>
            <p class="muted" style="margin:0">CRUD tabel portal dan preview gambar via Google Drive.</p>
            <nav class="portal-links">@foreach($tabs as $item)<a class="portal-link {{ $tab === $item ? 'active' : '' }}" href="{{ $tabUrl($item) }}">{{ $tabLabels[$item] ?? $item }}</a>@endforeach</nav>
        </aside>
        <main class="portal-main">
            <div class="portal-head"><p class="eyebrow">Portal &gt; {{ $sectionLabel }}</p><h2 class="headline">{{ $tabLabels[$tab] ?? $sectionLabel }}</h2></div>
            <div class="stats"><div class="stat"><span>Dosen</span><strong>{{ $stats['lecturers'] }}</strong></div><div class="stat"><span>Pembimbing</span><strong>{{ $stats['advisors'] }}</strong></div><div class="stat"><span>Periode</span><strong>{{ $stats['periods'] }}</strong></div><div class="stat"><span>Orang Tua/Alumni</span><strong>{{ $stats['parents'] + $stats['alumni'] }}</strong></div></div>
            <div class="pad">
                @if(in_array($tab, ['daftar-pegawai','detail-pegawai','tanda-tangan'], true))
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'lecturers']) }}">@csrf
                        <label>User<select name="userId">@foreach($users as $user)<option value="{{ $user->id }}">{{ $user->name }} - {{ $user->email }}</option>@endforeach</select></label><label>Prodi<select name="studyProgramId"><option value="">-</option>@foreach($studyPrograms as $program)<option value="{{ $program->id }}">{{ $program->code }} - {{ $program->name }}</option>@endforeach</select></label><label>NIDN/NIDK/NUPN<input name="nidn" required></label><label>Nama<input name="name" required></label><button class="btn" type="submit">Tambah Pegawai</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>NIDN</th><th>Nama</th><th>User</th><th>Prodi</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($lecturers as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'lecturers', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><input name="nidn" value="{{ $row->nidn }}"></td><td><input name="name" value="{{ $row->name }}"></td><td><select name="userId">@foreach($users as $user)<option value="{{ $user->id }}" @selected($row->userId === $user->id)>{{ $user->name }}</option>@endforeach</select></td><td><select name="studyProgramId"><option value="">-</option>@foreach($studyPrograms as $program)<option value="{{ $program->id }}" @selected($row->studyProgramId === $program->id)>{{ $program->code }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'lecturers', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('lecturers', 'Lecturer', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="5">Belum ada pegawai/dosen.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'pembimbing')
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'advisors']) }}">@csrf
                        <label>Mahasiswa<select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}">{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></label><label>Dosen<select name="lecturerId">@foreach($lecturers as $lecturer)<option value="{{ $lecturer->id }}">{{ $lecturer->nidn }} - {{ $lecturer->name }}</option>@endforeach</select></label><button class="btn" type="submit">Tambah Pembimbing</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Mahasiswa</th><th>Pembimbing</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($advisors as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'advisors', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}" @selected($row->studentId === $student->id)>{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></td><td><select name="lecturerId">@foreach($lecturers as $lecturer)<option value="{{ $lecturer->id }}" @selected($row->lecturerId === $lecturer->id)>{{ $lecturer->name }}</option>@endforeach</select></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'advisors', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('advisors', 'AcademicAdvisor', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="3">Belum ada pembimbing.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'kalender-akademik')
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'periods']) }}">@csrf
                        <label>Tahun Akademik<select name="academicYearId">@foreach($academicYears as $year)<option value="{{ $year->id }}">{{ $year->code }} - {{ $year->name }}</option>@endforeach</select></label><label>Kode<input name="code"></label><label>Nama<input name="name"></label><label>Mulai<input type="date" name="startDate"></label><label>Selesai<input type="date" name="endDate"></label><label><input type="checkbox" name="isActive" value="1" style="width:auto"> Aktif</label><button class="btn" type="submit">Tambah Periode</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Kode</th><th>Nama</th><th>Mulai</th><th>Selesai</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($periods as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'periods', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><input name="code" value="{{ $row->code }}"></td><td><input name="name" value="{{ $row->name }}"></td><td><input type="date" name="startDate" value="{{ substr($row->startDate,0,10) }}"></td><td><input type="date" name="endDate" value="{{ substr($row->endDate,0,10) }}"></td><td><select name="academicYearId">@foreach($academicYears as $year)<option value="{{ $year->id }}" @selected($row->academicYearId === $year->id)>{{ $year->code }}</option>@endforeach</select><label><input type="checkbox" name="isActive" value="1" style="width:auto" @checked($row->isActive)> Aktif</label></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'periods', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('periods', 'AcademicPeriod', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="6">Belum ada periode.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'monitoring-kalender-akademik')
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'settings']) }}">@csrf
                        <label>Prodi<select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}">{{ $program->code }}</option>@endforeach</select></label><label>Periode<select name="periodId">@foreach($periods as $period)<option value="{{ $period->id }}">{{ $period->name }}</option>@endforeach</select></label><label>Pertemuan<input type="number" name="totalMeetings" value="16"></label><label>Min UTS<input type="number" name="minAttendanceUts" value="75"></label><label>Min UAS<input type="number" name="minAttendanceUas" value="75"></label><label><input type="checkbox" name="openKrs" value="1" style="width:auto"> KRS</label><button class="btn" type="submit">Tambah Setting</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Periode</th><th>Prodi</th><th>KRS</th><th>Presensi</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($studyProgramSettings as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'settings', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><select name="periodId">@foreach($periods as $period)<option value="{{ $period->id }}" @selected($row->periodId === $period->id)>{{ $period->name }}</option>@endforeach</select></td><td><select name="studyProgramId">@foreach($studyPrograms as $program)<option value="{{ $program->id }}" @selected($row->studyProgramId === $program->id)>{{ $program->code }}</option>@endforeach</select></td><td><input type="checkbox" name="openKrs" value="1" style="width:auto" @checked($row->openKrs)> Buka</td><td><input type="number" name="minAttendanceUts" value="{{ $row->minAttendanceUts }}"><input type="number" name="minAttendanceUas" value="{{ $row->minAttendanceUas }}"><input type="number" name="totalMeetings" value="{{ $row->totalMeetings }}"></td>
                        <td><input type="hidden" name="openKrsValidation" value="{{ $row->openKrsValidation }}"><input type="hidden" name="openPrintKrs" value="{{ $row->openPrintKrs }}"><input type="hidden" name="openPrintUts" value="{{ $row->openPrintUts }}"><input type="hidden" name="openPrintUas" value="{{ $row->openPrintUas }}"><input type="hidden" name="allowLecturerGenerate" value="{{ $row->allowLecturerGenerate }}"><input type="hidden" name="allowLecturerEditGrade" value="{{ $row->allowLecturerEditGrade }}"><div class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'settings', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('settings', 'StudyProgramSetting', $row->id) !!}</div></td>
                    </tr>@empty<tr><td colspan="5">Belum ada setting.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'monitoring-mahasiswa')
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'parents']) }}">@csrf
                        <label>Mahasiswa<select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}">{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></label><label>Nama Orang Tua/Wali<input name="name"></label><label>Relasi<input name="relation" value="Ayah"></label><label>Telepon<input name="phone"></label><button class="btn" type="submit">Tambah Wali</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Mahasiswa</th><th>Nama Wali</th><th>Relasi</th><th>Telepon</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($parentRows as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'parents', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}" @selected($row->studentId === $student->id)>{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></td><td><input name="name" value="{{ $row->name }}"></td><td><input name="relation" value="{{ $row->relation }}"></td><td><input name="phone" value="{{ $row->phone }}"></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'parents', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('parents', 'StudentParent', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="5">Belum ada wali.</td></tr>@endforelse</tbody></table></div>
                @elseif($tab === 'profil-alumni')
                    <form class="crud-card form-grid" method="post" action="{{ route('portal.records.store', ['resource' => 'alumni']) }}">@csrf
                        <label>Periode Yudisium<select name="graduationPeriodId">@foreach($graduationPeriods as $period)<option value="{{ $period->id }}">{{ $period->code }} - {{ $period->name }}</option>@endforeach</select></label><label>Mahasiswa<select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}">{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></label><label>Status<input name="status" value="LULUS"></label><button class="btn" type="submit">Tambah Alumni</button>
                    </form>
                    <div class="table-wrap"><table><thead><tr><th>Mahasiswa</th><th>Periode</th><th>Status</th><th>Aksi</th></tr></thead><tbody>
                    @forelse($alumniRows as $row)<tr><form method="post" action="{{ route('portal.records.update', ['resource' => 'alumni', 'id' => $row->id]) }}">@csrf @method('PATCH')
                        <td><select name="studentId">@foreach($students as $student)<option value="{{ $student->id }}" @selected($row->studentId === $student->id)>{{ $student->nim }} - {{ $student->name }}</option>@endforeach</select></td><td><select name="graduationPeriodId">@foreach($graduationPeriods as $period)<option value="{{ $period->id }}" @selected($row->graduationPeriodId === $period->id)>{{ $period->code }}</option>@endforeach</select></td><td><input name="status" value="{{ $row->status }}"></td>
                        <td class="action-row"><button class="btn" type="submit">Update</button></form><form method="post" action="{{ route('portal.records.destroy', ['resource' => 'alumni', 'id' => $row->id]) }}">@csrf @method('DELETE')<button class="btn danger" type="submit">Hapus</button></form>{!! $attachmentBlock('alumni', 'GraduationStudent', $row->id) !!}</td>
                    </tr>@empty<tr><td colspan="4">Belum ada alumni.</td></tr>@endforelse</tbody></table></div>
                @endif
            </div>
        </main>
    </div>
</div>
@endsection
