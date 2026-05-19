<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'SIAKAD' }}</title>
    <style>
        :root{--green:#42b429;--green-dark:#2f941d;--ink:#111827;--muted:#64748b;--line:#e5e7eb;--soft:#f5f5f5}
        *{box-sizing:border-box}body{margin:0;background:var(--soft);color:var(--ink);font-family:Inter,Arial,sans-serif}a{text-decoration:none;color:inherit}
        .app{min-height:100vh}.wrap{max-width:1120px;margin:0 auto;padding:12px 16px 28px}.topnav{position:relative;z-index:20;border-radius:12px;background:var(--green);padding:10px 14px;box-shadow:0 18px 35px rgba(66,180,41,.18)}
        .navrow{display:flex;align-items:center;gap:18px}.avatar{display:flex;height:58px;width:58px;align-items:center;justify-content:center;border:2px solid rgba(255,255,255,.7);border-radius:999px;background:rgba(255,255,255,.16);color:white;font-weight:900;box-shadow:inset 0 0 0 1px rgba(255,255,255,.15)}
        .menus{display:flex;flex:1;flex-wrap:wrap;justify-content:center;gap:4px;margin:0;padding:0;list-style:none}.menu{position:relative}.menu-btn{display:flex;min-width:78px;flex-direction:column;align-items:center;gap:4px;border:0;border-radius:8px;background:transparent;padding:7px 8px;color:white;cursor:pointer}
        .menu:hover .menu-btn,.menu:focus-within .menu-btn{background:rgba(255,255,255,.2)}.menu-icon{display:grid;height:18px;width:18px;place-items:center;border:1px solid rgba(255,255,255,.72);border-radius:5px;font-size:10px;line-height:1}.menu-label{max-width:112px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:11px;line-height:16px}
        .dropdown{position:absolute;left:50%;top:100%;display:none;width:310px;transform:translateX(-50%);padding-top:8px}.menu:hover .dropdown,.menu:focus-within .dropdown{display:block}.dropdown-inner{border:1px solid #f1f5f9;border-radius:12px;background:white;padding:8px;box-shadow:0 22px 60px rgba(0,0,0,.18)}
        .drop-head{margin-bottom:8px;border-radius:8px;background:#f6f6f6;padding:10px 12px}.drop-title{font-size:12px;font-weight:900}.drop-desc{margin-top:2px;color:var(--muted);font-size:11px}.drop-link{display:flex;align-items:center;justify-content:space-between;border-radius:8px;padding:8px 9px;color:#475569;font-size:12px;font-weight:700}.drop-link:hover,.drop-link.active{background:#f0fbea;color:var(--green-dark);font-weight:900}.drop-link span:last-child{color:#0d8178}
        .metrics{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:24px;margin-top:44px}.metric{position:relative;min-height:114px;overflow:hidden;border-radius:16px;padding:24px;color:white;box-shadow:0 10px 22px rgba(0,0,0,.08)}.metric:before{content:"";position:absolute;right:-34px;top:-34px;height:112px;width:112px;transform:rotate(45deg);border-radius:24px;background:rgba(255,255,255,.1)}.metric:after{content:"";position:absolute;right:16px;bottom:-40px;height:96px;width:96px;border-radius:24px;background:rgba(0,0,0,.05)}
        .metric-content{position:relative;display:flex;align-items:center;gap:16px}.metric-icon{display:grid;height:48px;width:48px;place-items:center;border-radius:999px;background:rgba(255,255,255,.25);font-weight:900}.metric-value{display:block;font-size:30px;font-weight:900;line-height:1}.metric-label{display:block;margin-top:8px;font-size:14px}
        .hero{margin-top:24px}.page-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:14px}.eyebrow{margin:0;color:var(--green);font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase}.page-title{margin:3px 0 0;color:#111;font-size:24px;font-weight:900}.chips{display:flex;flex-wrap:wrap;gap:8px}.chip{border-radius:999px;background:white;padding:8px 14px;color:#64748b;font-size:12px;font-weight:800;box-shadow:0 1px 8px rgba(15,23,42,.05)}.chip.green{background:#e9f8e6;color:var(--green-dark)}
        .panel{overflow:hidden;border-radius:16px;background:white;box-shadow:0 12px 32px rgba(0,0,0,.07)}.panel.pad{padding:18px}.grid{display:grid;gap:16px}.grid-2{grid-template-columns:repeat(2,minmax(0,1fr))}.grid-form{grid-template-columns:340px 1fr}.muted{color:var(--muted)}.section-title{margin:0 0 12px;font-size:18px;font-weight:900}
        .table-wrap{overflow:auto}table{width:100%;border-collapse:collapse;background:white}th,td{border-bottom:1px solid #edf2f7;padding:13px 14px;text-align:left;font-size:14px;vertical-align:top}th{background:#f1f5f9;color:#64748b;font-size:12px;font-weight:900;letter-spacing:.12em;text-transform:uppercase}tbody tr:hover{background:#fbfdfb}.badge{display:inline-flex;border-radius:999px;background:#dcfce7;padding:5px 10px;color:#047857;font-size:12px;font-weight:900}.badge.gray{background:#f1f5f9;color:#475569}
        label{display:block;margin-top:12px;color:#334155;font-size:13px;font-weight:800}input,select{width:100%;margin-top:6px;border:1px solid #cbd5e1;border-radius:10px;background:white;padding:11px 12px;font:inherit;outline:none}input:focus,select:focus{border-color:#42b429;box-shadow:0 0 0 4px #e9f8e6}.btn{display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:10px;background:var(--green);padding:11px 15px;color:white;font-weight:900;cursor:pointer}.btn:hover{background:var(--green-dark)}
        .alert{border-radius:10px;padding:12px 14px;margin-bottom:14px;font-weight:700}.ok{border:1px solid #86efac;background:#dcfce7;color:#166534}.err{border:1px solid #fecaca;background:#fee2e2;color:#991b1b}.pager{padding:14px}
        @media(max-width:900px){.wrap{padding:10px 12px 22px}.navrow{align-items:flex-start}.avatar{height:46px;width:46px}.menus{justify-content:flex-start}.metrics,.grid-2,.grid-form{grid-template-columns:1fr}.page-head{align-items:flex-start;flex-direction:column}.dropdown{left:0;transform:none;width:min(310px,calc(100vw - 32px))}}
    </style>
</head>
<body>
<div class="app">
    <div class="wrap">
        <nav class="topnav">
            <div class="navrow">
                <a class="avatar" href="{{ route('dashboard') }}" aria-label="Dashboard">UM</a>
                <ul class="menus">
                    <li class="menu">
                        <button class="menu-btn" type="button"><span class="menu-icon">M</span><span class="menu-label">Master Data</span></button>
                        <div class="dropdown"><div class="dropdown-inner">
                            <div class="drop-head"><div class="drop-title">Master Data</div><div class="drop-desc">Data referensi akademik</div></div>
                            <a class="drop-link {{ request()->routeIs('master.students') ? 'active' : '' }}" href="{{ route('master.students') }}">Mahasiswa <span>&gt;</span></a>
                            <a class="drop-link {{ request()->routeIs('master.lecturers') ? 'active' : '' }}" href="{{ route('master.lecturers') }}">Dosen <span>&gt;</span></a>
                            <a class="drop-link {{ request()->routeIs('master.faculties') ? 'active' : '' }}" href="{{ route('master.faculties') }}">Fakultas & Prodi <span>&gt;</span></a>
                        </div></div>
                    </li>
                    <li class="menu">
                        <button class="menu-btn" type="button"><span class="menu-icon">A</span><span class="menu-label">Akademik</span></button>
                        <div class="dropdown"><div class="dropdown-inner">
                            <div class="drop-head"><div class="drop-title">Akademik</div><div class="drop-desc">KRS, nilai, dan laporan</div></div>
                            <a class="drop-link" href="{{ route('dashboard') }}">Dashboard Akademik <span>&gt;</span></a>
                            <a class="drop-link" href="{{ route('master.students') }}">Daftar Mahasiswa <span>&gt;</span></a>
                            <a class="drop-link" href="{{ route('master.lecturers') }}">Daftar Dosen <span>&gt;</span></a>
                        </div></div>
                    </li>
                    <li class="menu">
                        <button class="menu-btn" type="button"><span class="menu-icon">U</span><span class="menu-label">User</span></button>
                        <div class="dropdown"><div class="dropdown-inner">
                            <div class="drop-head"><div class="drop-title">Setting</div><div class="drop-desc">Konfigurasi sistem</div></div>
                            <a class="drop-link {{ request()->routeIs('access.index') ? 'active' : '' }}" href="{{ route('access.index') }}">Hak Akses User <span>&gt;</span></a>
                            @if(session('siakad_user_id'))
                                <form method="post" action="{{ route('logout') }}">@csrf<button class="drop-link" style="border:0;width:100%;background:transparent;cursor:pointer" type="submit">Logout <span>&gt;</span></button></form>
                            @endif
                        </div></div>
                    </li>
                </ul>
            </div>
        </nav>

        <section class="metrics">
            <article class="metric" style="background:#ffa752"><div class="metric-content"><span class="metric-icon">D</span><span><span class="metric-value">{{ $stats['users'] ?? '2478' }}</span><span class="metric-label">Total Data Akademik</span></span></div></article>
            <article class="metric" style="background:#5bdd5a"><div class="metric-content"><span class="metric-icon">V</span><span><span class="metric-value">{{ $stats['students'] ?? '983' }}</span><span class="metric-label">Data Tervalidasi</span></span></div></article>
            <article class="metric" style="background:#b58ad8"><div class="metric-content"><span class="metric-icon">R</span><span><span class="metric-value">{{ $stats['lecturers'] ?? '1256' }}</span><span class="metric-label">Perlu Review</span></span></div></article>
            <article class="metric" style="background:#70a1bb"><div class="metric-content"><span class="metric-icon">L</span><span><span class="metric-value">{{ $stats['faculties'] ?? '652' }}</span><span class="metric-label">Laporan Tersedia</span></span></div></article>
        </section>

        <section class="hero">
            <div class="page-head">
                <div>
                    <p class="eyebrow">Sistem Informasi Akademik</p>
                    <h1 class="page-title">{{ $title ?? 'Dashboard' }}</h1>
                </div>
                <div class="chips">
                    <span class="chip">Universitas Contoh Nusantara</span>
                    <span class="chip green">Ganjil 2026/2027</span>
                    @if(session('siakad_role'))<span class="chip">Role: {{ session('siakad_role') }}</span>@endif
                </div>
            </div>
            @if(session('success'))<div class="alert ok">{{ session('success') }}</div>@endif
            @if($errors->any())<div class="alert err">{{ $errors->first() }}</div>@endif
            @yield('content')
        </section>
    </div>
</div>
</body>
</html>
