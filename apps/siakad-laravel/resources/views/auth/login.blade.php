<!doctype html>
<html lang="id">
<head>
    <meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Login SIAKAD Laravel</title>
    <style>body{margin:0;display:grid;place-items:center;min-height:100vh;background:#f4f7f4;font-family:Arial,sans-serif}.card{width:min(420px,calc(100% - 32px));background:white;border-radius:16px;padding:28px;box-shadow:0 20px 60px rgba(15,23,42,.12)}input{width:100%;box-sizing:border-box;padding:12px;border:1px solid #cbd5e1;border-radius:10px;margin:6px 0 14px}.btn{width:100%;border:0;border-radius:10px;background:#1f8f2e;color:white;font-weight:900;padding:12px}.err{background:#fee2e2;color:#991b1b;padding:10px;border-radius:8px;margin-bottom:12px}</style>
</head>
<body>
<form class="card" method="post" action="{{ route('login.post') }}">
    @csrf
    <h1>SIAKAD Laravel</h1>
    <p>Masuk dengan akun demo atau akun kampus.</p>
    @if($errors->any())<div class="err">{{ $errors->first() }}</div>@endif
    <label>Email</label>
    <input name="email" type="email" value="{{ old('email', 'superadmin@siakad.local') }}" required>
    <label>Password</label>
    <input name="password" type="password" value="Admin@12345" required>
    <button class="btn" type="submit">Login</button>
</form>
</body>
</html>
