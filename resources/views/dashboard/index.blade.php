@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<div class="grid grid-4">
    <div class="card"><div class="muted">User</div><h2>{{ $stats['users'] }}</h2></div>
    <div class="card"><div class="muted">Mahasiswa</div><h2>{{ $stats['students'] }}</h2></div>
    <div class="card"><div class="muted">Dosen</div><h2>{{ $stats['lecturers'] }}</h2></div>
    <div class="card"><div class="muted">Fakultas</div><h2>{{ $stats['faculties'] }}</h2></div>
</div>
<div class="card" style="margin-top:16px">
    <h2>Periode Aktif</h2>
    <p>{{ $activePeriod?->name ?? 'Belum ada periode aktif' }}</p>
</div>
@endsection
