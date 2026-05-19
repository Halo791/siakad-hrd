<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login SIAKAD</title>
    <style>
        *{box-sizing:border-box}body{margin:0;min-height:100vh;background:#edf3ec;color:#0f172a;font-family:Inter,Arial,sans-serif}.page{position:relative;min-height:100vh;overflow:hidden;padding:24px}
        .page:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 12% 12%,rgba(241,196,15,.3),transparent 26%),radial-gradient(circle at 88% 20%,rgba(20,184,166,.22),transparent 30%),linear-gradient(135deg,rgba(15,23,42,.08),transparent 35%)}.page:after{content:"";position:absolute;inset:0;opacity:.13;background-image:linear-gradient(135deg,#0f172a 1px,transparent 1px);background-size:7px 7px}
        .shell{position:relative;z-index:1;display:flex;align-items:center;max-width:1152px;min-height:calc(100vh - 48px);margin:0 auto}.card{width:100%;overflow:hidden;border:1px solid rgba(255,255,255,.7);border-radius:28px;background:rgba(255,255,255,.86);box-shadow:0 30px 90px rgba(15,23,42,.18);backdrop-filter:blur(12px)}
        .head{position:relative;overflow:hidden;background:#d7a916;padding:22px 30px;color:white}.head:before{content:"";position:absolute;inset:0;background:radial-gradient(circle at 20% 20%,rgba(255,255,255,.28),transparent 24%),linear-gradient(90deg,rgba(11,95,66,.3),transparent)}.head-row{position:relative;display:flex;align-items:center;justify-content:space-between;gap:16px}.brand{display:flex;align-items:center;gap:16px}.mark{display:grid;height:56px;width:56px;place-items:center;border:1px solid rgba(255,255,255,.6);border-radius:18px;background:rgba(255,255,255,.2);font-weight:900;box-shadow:inset 0 0 0 1px rgba(255,255,255,.18)}.eyebrow{margin:0;color:rgba(255,255,255,.78);font-size:12px;font-weight:900;letter-spacing:.24em;text-transform:uppercase}.title{margin:3px 0;color:white;font-size:30px;font-weight:900;line-height:1.15}.sub{margin:0;color:rgba(255,255,255,.86);font-size:14px}.home{border:1px solid rgba(255,255,255,.4);border-radius:999px;background:rgba(255,255,255,.18);padding:9px 15px;color:white;text-decoration:none;font-size:14px;font-weight:800}
        .body{display:grid;grid-template-columns:minmax(0,1fr) 430px}.left{display:grid;grid-template-columns:220px minmax(0,1fr);gap:24px;padding:30px}.module-title{margin:0;color:#0f172a;font-size:20px;font-weight:900}.hint{margin:4px 0 12px;color:#64748b;font-size:12px}.module{position:relative;min-height:234px;overflow:hidden;border-radius:24px;background:#1f3b93;padding:20px;color:white;box-shadow:0 18px 45px rgba(31,59,147,.24)}.module:before{content:"";position:absolute;right:-32px;bottom:20px;width:112px;height:112px;transform:rotate(45deg);border-radius:26px;background:rgba(255,255,255,.1)}.module:after{content:"";position:absolute;right:30px;bottom:-40px;width:128px;height:128px;border-radius:999px;background:rgba(60,98,214,.4)}.sim{position:relative;display:grid;width:64px;height:64px;margin-top:42px;place-items:center;border-radius:18px;background:rgba(255,255,255,.12);font-weight:900}.loginbox{border:1px solid #f1f5f9;border-radius:24px;background:white;padding:22px;box-shadow:0 1px 8px rgba(15,23,42,.04)}.loginbox h2{margin:4px 0;color:#020617;font-size:26px;font-weight:900}.loginbox p{margin:0 0 16px;color:#64748b;font-size:14px;line-height:1.6}
        label{display:block;margin-top:14px;color:#334155;font-size:14px;font-weight:800}input{width:100%;margin-top:7px;border:1px solid #e2e8f0;border-radius:16px;background:#f8fafc;padding:13px 14px;font:inherit;outline:none}input:focus{border-color:#10b981;background:white;box-shadow:0 0 0 4px #d1fae5}.quick{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-top:16px}.quick button{border:1px solid #e2e8f0;border-radius:16px;background:white;padding:10px;text-align:left;color:#0f172a;cursor:pointer}.quick strong{display:block;font-size:12px}.quick span{display:block;margin-top:2px;color:#64748b;font-size:11px;line-height:1.35}.quick button:hover{border-color:#86efac;background:#ecfdf5}.submit{width:100%;margin-top:16px;border:0;border-radius:16px;background:#0f7f66;padding:14px;color:white;font-weight:900;cursor:pointer;box-shadow:0 14px 28px rgba(15,127,102,.24)}.submit:hover{background:#0a6f59}.err{border:1px solid #fecaca;border-radius:16px;background:#fee2e2;padding:12px;color:#991b1b;font-size:14px;font-weight:800}
        .right{border-left:1px solid #f1f5f9;background:rgba(248,250,252,.82);padding:30px}.role-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:16px}.role-head h2{margin:0;font-size:20px;font-weight:900}.tag{border-radius:999px;background:#fef3c7;padding:6px 10px;color:#b45309;font-size:12px;font-weight:900}.roles{display:grid;gap:12px}.role{border:1px solid #e2e8f0;border-radius:18px;background:rgba(255,255,255,.75);padding:15px}.role.active{border-color:#10b981;background:white;box-shadow:0 14px 30px rgba(15,127,102,.13)}.role strong{display:block;color:#0f172a;font-size:14px}.role small{color:#64748b}.role p{margin:10px 0 0;color:#64748b;font-size:12px;line-height:1.55}.active-role{margin-top:16px;border:1px solid #e2e8f0;border-radius:18px;background:white;padding:15px}.active-role .label{color:#94a3b8;font-size:12px;font-weight:900;letter-spacing:.16em;text-transform:uppercase}.active-role h3{margin:6px 0 4px;font-size:20px}
        @media(max-width:960px){.body,.left{grid-template-columns:1fr}.right{border-left:0;border-top:1px solid #f1f5f9}.quick{grid-template-columns:1fr}.head-row{align-items:flex-start;flex-direction:column}.page{padding:14px}.shell{min-height:calc(100vh - 28px)}}
    </style>
</head>
<body>
<main class="page">
    <section class="shell">
        <div class="card">
            <header class="head">
                <div class="head-row">
                    <div class="brand">
                        <div class="mark">UM</div>
                        <div>
                            <p class="eyebrow">Sistem Informasi Akademik</p>
                            <h1 class="title">Portal Login Multi-Role</h1>
                            <p class="sub">Pilih modul dan role aktif sebelum masuk ke dashboard.</p>
                        </div>
                    </div>
                    <a class="home" href="{{ url('/') }}">Kembali</a>
                </div>
            </header>
            <div class="body">
                <section class="left">
                    <div>
                        <h2 class="module-title">Daftar Modul</h2>
                        <p class="hint">Modul akademik aktif</p>
                        <div class="module">
                            <strong>SIM Akademik</strong>
                            <div class="sim">SIM</div>
                            <p style="position:relative;margin:16px 0 0;color:#dbeafe;font-size:12px;line-height:1.5">Akademik, portal, KRS, nilai, laporan.</p>
                        </div>
                    </div>
                    <div class="loginbox">
                        <p style="color:#047857;font-size:12px;font-weight:900;letter-spacing:.18em;text-transform:uppercase">Akses Cepat</p>
                        <h2>Masuk dengan akun kampus</h2>
                        <p>Untuk akun yang punya lebih dari satu role, sistem akan menyiapkan sesi sesuai role utama pengguna.</p>
                        @if($errors->any())<div class="err">{{ $errors->first() }}</div>@endif
                        <form method="post" action="{{ route('login.post') }}">
                            @csrf
                            <label>Email</label>
                            <input id="email" name="email" type="email" value="{{ old('email', 'superadmin@siakad.local') }}" required>
                            <label>Password</label>
                            <input id="password" name="password" type="password" value="Admin@12345" required>
                            <div class="quick">
                                <button type="button" data-email="superadmin@siakad.local"><strong>Super Admin</strong><span>akses penuh admin</span></button>
                                <button type="button" data-email="dosen1@siakad.local"><strong>Dosen Multi-role</strong><span>dosen dan pembimbing</span></button>
                                <button type="button" data-email="mhs1@siakad.local"><strong>Mahasiswa</strong><span>portal mahasiswa</span></button>
                            </div>
                            <button class="submit" type="submit">Masuk</button>
                        </form>
                    </div>
                </section>
                <aside class="right">
                    <div class="role-head">
                        <div><h2>Daftar Role</h2><p class="hint">Role tersedia setelah login valid</p></div>
                        <span class="tag">SIM Akademik</span>
                    </div>
                    <div class="roles">
                        <div class="role active"><strong>Super Admin</strong><small>SUPER ADMIN</small><p>Akses seluruh modul dan konfigurasi sistem.</p></div>
                        <div class="role"><strong>Admin Akademik</strong><small>ADMIN AKADEMIK</small><p>Operasional akademik, KRS, nilai, KHS, dan laporan.</p></div>
                        <div class="role"><strong>Dosen</strong><small>DOSEN</small><p>Perkuliahan, presensi, nilai, dan kelas.</p></div>
                        <div class="role"><strong>Mahasiswa</strong><small>MAHASISWA</small><p>KRS, KHS, jadwal, tagihan, dan aktivitas akademik.</p></div>
                    </div>
                    <div class="active-role">
                        <div class="label">Role aktif</div>
                        <h3>Dipilih setelah login</h3>
                        <p class="hint">Sesi Laravel akan mengikuti role utama pada akun.</p>
                    </div>
                </aside>
            </div>
        </div>
    </section>
</main>
<script>
document.querySelectorAll('[data-email]').forEach(function(button){
    button.addEventListener('click', function(){
        document.getElementById('email').value = button.getAttribute('data-email');
        document.getElementById('password').value = 'Admin@12345';
    });
});
</script>
</body>
</html>
