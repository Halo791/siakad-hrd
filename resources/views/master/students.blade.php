@extends('layouts.app', ['title' => 'Daftar Mahasiswa'])

@section('content')
<div class="card">
    <table>
        <thead><tr><th>NIM</th><th>Nama</th><th>Email</th><th>Prodi</th><th>Semester</th><th>Status</th></tr></thead>
        <tbody>
        @forelse($students as $student)
            <tr>
                <td>{{ $student->nim }}</td>
                <td>{{ $student->name }}</td>
                <td>{{ $student->user?->email }}</td>
                <td>{{ $student->studyProgram?->code }} - {{ $student->studyProgram?->name }}</td>
                <td>{{ $student->currentSemester }}</td>
                <td>{{ $student->status }}</td>
            </tr>
        @empty
            <tr><td colspan="6">Belum ada mahasiswa.</td></tr>
        @endforelse
        </tbody>
    </table>
    <div style="margin-top:14px">{{ $students->links() }}</div>
</div>
@endsection
