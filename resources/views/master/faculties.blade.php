@extends('layouts.app', ['title' => 'Fakultas & Program Studi'])

@section('content')
<div class="grid grid-2">
    <div class="panel pad">
        <p class="eyebrow">Struktur Akademik</p>
        <h2 class="section-title">Fakultas</h2>
        <div class="table-wrap" data-title="Daftar Fakultas"><table><thead><tr><th>Kode</th><th>Nama</th><th>Akreditasi</th></tr></thead><tbody>
        @foreach($faculties as $faculty)
            <tr><td><span class="badge gray">{{ $faculty->code }}</span></td><td><strong>{{ $faculty->name }}</strong></td><td>{{ $faculty->accreditation ?? '-' }}</td></tr>
        @endforeach
        </tbody></table></div>
    </div>
    <div class="panel pad">
        <p class="eyebrow">Struktur Akademik</p>
        <h2 class="section-title">Program Studi</h2>
        <div class="table-wrap" data-title="Daftar Program Studi"><table><thead><tr><th>Kode</th><th>Nama</th><th>Fakultas</th></tr></thead><tbody>
        @foreach($studyPrograms as $program)
            <tr><td><span class="badge">{{ $program->code }}</span></td><td><strong>{{ $program->name }}</strong></td><td>{{ $program->faculty?->code }}</td></tr>
        @endforeach
        </tbody></table></div>
    </div>
</div>
@endsection
