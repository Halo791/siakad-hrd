@extends('layouts.app', ['title' => 'Daftar Dosen'])

@section('content')
<div class="panel">
    <div class="panel pad" style="box-shadow:none;border-radius:0;border-bottom:1px solid #edf2f7">
        <p class="eyebrow">Master Data</p>
        <h2 class="section-title">Daftar Dosen</h2>
        <p class="muted" style="margin:0">Data dosen dan program studi asal.</p>
    </div>
    <div class="table-wrap" data-title="Daftar Dosen"><table>
        <thead><tr><th>NIDN</th><th>Nama</th><th>Email</th><th>Prodi</th></tr></thead>
        <tbody>
        @forelse($lecturers as $lecturer)
            <tr>
                <td><strong>{{ $lecturer->nidn }}</strong></td>
                <td><strong>{{ $lecturer->name }}</strong></td>
                <td>{{ $lecturer->user?->email }}</td>
                <td><span class="badge gray">{{ $lecturer->studyProgram?->code }}</span> {{ $lecturer->studyProgram?->name }}</td>
            </tr>
        @empty
            <tr><td colspan="4">Belum ada dosen.</td></tr>
        @endforelse
        </tbody>
    </table></div>
    <div class="pager">{{ $lecturers->links('partials.pagination') }}</div>
</div>
@endsection
