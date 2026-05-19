@extends('layouts.app', ['title' => 'Fakultas & Program Studi'])

@section('content')
<div class="grid" style="grid-template-columns:1fr 1fr">
    <div class="card">
        <h2>Fakultas</h2>
        <table><thead><tr><th>Kode</th><th>Nama</th><th>Akreditasi</th></tr></thead><tbody>
        @foreach($faculties as $faculty)
            <tr><td>{{ $faculty->code }}</td><td>{{ $faculty->name }}</td><td>{{ $faculty->accreditation ?? '-' }}</td></tr>
        @endforeach
        </tbody></table>
    </div>
    <div class="card">
        <h2>Program Studi</h2>
        <table><thead><tr><th>Kode</th><th>Nama</th><th>Fakultas</th></tr></thead><tbody>
        @foreach($studyPrograms as $program)
            <tr><td>{{ $program->code }}</td><td>{{ $program->name }}</td><td>{{ $program->faculty?->code }}</td></tr>
        @endforeach
        </tbody></table>
    </div>
</div>
@endsection
