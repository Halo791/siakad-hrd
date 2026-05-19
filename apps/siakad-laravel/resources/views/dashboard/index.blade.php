@extends('layouts.app', ['title' => 'Dashboard'])

@section('content')
<div class="panel pad">
    <div class="grid grid-2">
        <div>
            <p class="eyebrow">Ringkasan Akademik</p>
            <h2 class="section-title" style="font-size:24px">Selamat datang di SIAKAD</h2>
            <p class="muted" style="line-height:1.7;margin:0">Dashboard Laravel ini memakai database yang sama, dengan tampilan diselaraskan ke portal Next.js.</p>
        </div>
        <div class="grid grid-2">
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px">
                <div class="muted">User</div><strong style="font-size:26px">{{ $stats['users'] }}</strong>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px">
                <div class="muted">Mahasiswa</div><strong style="font-size:26px">{{ $stats['students'] }}</strong>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px">
                <div class="muted">Dosen</div><strong style="font-size:26px">{{ $stats['lecturers'] }}</strong>
            </div>
            <div style="border:1px solid #e5e7eb;border-radius:14px;padding:16px">
                <div class="muted">Fakultas</div><strong style="font-size:26px">{{ $stats['faculties'] }}</strong>
            </div>
        </div>
    </div>
</div>
<div class="panel pad" style="margin-top:16px">
    <p class="eyebrow">Periode Aktif</p>
    <h2 class="section-title">{{ $activePeriod?->name ?? 'Belum ada periode aktif' }}</h2>
    <p class="muted" style="margin:0">Gunakan menu hijau di atas untuk masuk ke master data, data akademik, dan pengaturan akses.</p>
</div>
@endsection
