@extends('layouts.app', ['title' => 'Daftar Mahasiswa'])

@section('content')
<div class="panel">
    <div class="panel pad" style="box-shadow:none;border-radius:0;border-bottom:1px solid #edf2f7">
        <p class="eyebrow">Master Data</p>
        <h2 class="section-title">Daftar Mahasiswa</h2>
        <p class="muted" style="margin:0">Data mahasiswa aktif dari tabel akademik utama.</p>
    </div>
    <div class="table-wrap" data-title="Daftar Mahasiswa"><table>
        <thead><tr><th>NIM</th><th>Nama</th><th>Email</th><th>Prodi</th><th>Semester</th><th>Status</th></tr></thead>
        <tbody>
        @forelse($students as $student)
            <tr>
                <td><strong>{{ $student->nim }}</strong></td>
                <td><strong>{{ $student->name }}</strong></td>
                <td>{{ $student->user?->email }}</td>
                <td>{{ $student->studyProgram?->code }} - {{ $student->studyProgram?->name }}</td>
                <td>{{ $student->currentSemester }}</td>
                <td><span class="badge">{{ $student->status }}</span></td>
            </tr>
        @empty
            <tr><td colspan="6">Belum ada mahasiswa.</td></tr>
        @endforelse
        </tbody>
    </table></div>
    <div class="pager">{{ $students->links('partials.pagination') }}</div>
</div>
@endsection
