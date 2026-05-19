<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $title ?? 'SIAKAD Laravel' }}</title>
    <style>
        body{margin:0;font-family:Inter,Arial,sans-serif;background:#f5f7fb;color:#0f172a}
        a{text-decoration:none;color:inherit}.shell{display:grid;grid-template-columns:260px 1fr;min-height:100vh}
        aside{background:#1f8f2e;color:white;padding:24px}.brand{font-size:22px;font-weight:900;margin-bottom:28px}
        nav a{display:block;padding:10px 12px;border-radius:8px;margin-bottom:6px;color:#eaffea}
        nav a:hover,.active{background:rgba(255,255,255,.16)}main{padding:28px}.top{display:flex;justify-content:space-between;align-items:center;margin-bottom:22px}
        .card{background:white;border:1px solid #e2e8f0;border-radius:12px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.05)}
        .grid{display:grid;gap:16px}.grid-4{grid-template-columns:repeat(4,minmax(0,1fr))}.muted{color:#64748b}
        table{width:100%;border-collapse:collapse;background:white}th,td{border-bottom:1px solid #e2e8f0;padding:12px;text-align:left;font-size:14px}th{background:#f1f5f9;font-size:12px;text-transform:uppercase;letter-spacing:.08em}
        input,select{width:100%;box-sizing:border-box;border:1px solid #cbd5e1;border-radius:8px;padding:10px;margin-top:6px}
        label{font-size:13px;font-weight:700}.btn{border:0;border-radius:8px;padding:10px 14px;font-weight:800;background:#1f8f2e;color:white;cursor:pointer}
        .alert{border-radius:8px;padding:12px;margin-bottom:14px}.ok{background:#dcfce7;color:#166534}.err{background:#fee2e2;color:#991b1b}
        @media(max-width:860px){.shell{grid-template-columns:1fr}aside{position:static}.grid-4{grid-template-columns:1fr}}
    </style>
</head>
<body>
<div class="shell">
    <aside>
        <div class="brand">SIAKAD Laravel</div>
        <nav>
            <a href="{{ route('dashboard') }}" @class(['active'=>request()->routeIs('dashboard')])>Dashboard</a>
            <a href="{{ route('master.students') }}" @class(['active'=>request()->routeIs('master.students')])>Mahasiswa</a>
            <a href="{{ route('master.lecturers') }}" @class(['active'=>request()->routeIs('master.lecturers')])>Dosen</a>
            <a href="{{ route('master.faculties') }}" @class(['active'=>request()->routeIs('master.faculties')])>Fakultas & Prodi</a>
            <a href="{{ route('access.index') }}" @class(['active'=>request()->routeIs('access.index')])>Hak Akses</a>
        </nav>
    </aside>
    <main>
        <div class="top">
            <div>
                <div class="muted">Sistem Informasi Akademik</div>
                <h1 style="margin:4px 0 0">{{ $title ?? 'Dashboard' }}</h1>
            </div>
            @if(session('siakad_user_id'))
                <form method="post" action="{{ route('logout') }}">@csrf<button class="btn" type="submit">Logout</button></form>
            @endif
        </div>
        @if(session('success'))<div class="alert ok">{{ session('success') }}</div>@endif
        @if($errors->any())<div class="alert err">{{ $errors->first() }}</div>@endif
        @yield('content')
    </main>
</div>
</body>
</html>
