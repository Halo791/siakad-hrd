@extends('layouts.app', ['title' => 'Daftar Dosen'])

@section('content')
<div class="card">
    <table>
        <thead><tr><th>NIDN</th><th>Nama</th><th>Email</th><th>Prodi</th></tr></thead>
        <tbody>
        @forelse($lecturers as $lecturer)
            <tr>
                <td>{{ $lecturer->nidn }}</td>
                <td>{{ $lecturer->name }}</td>
                <td>{{ $lecturer->user?->email }}</td>
                <td>{{ $lecturer->studyProgram?->code }} - {{ $lecturer->studyProgram?->name }}</td>
            </tr>
        @empty
            <tr><td colspan="4">Belum ada dosen.</td></tr>
        @endforelse
        </tbody>
    </table>
    <div style="margin-top:14px">{{ $lecturers->links() }}</div>
</div>
@endsection
