@extends('layouts.app', ['title' => 'Hak Akses User'])

@section('content')
<div class="grid grid-form">
    <div class="panel pad">
        <p class="eyebrow">Register User Baru</p>
        <h2 class="section-title">Buat akun login</h2>
        <p class="muted" style="margin-top:-4px;line-height:1.6">Role awal diperlukan oleh sistem. Role bisa diatur lagi dari data user.</p>
        <form method="post" action="{{ route('access.users.store') }}">
            @csrf
            <label>Nama Lengkap</label><input name="name" placeholder="Nama user" required>
            <label>Email Login</label><input name="email" type="email" placeholder="nama@kampus.ac.id" required>
            <label>Password</label><input name="password" value="Admin@12345" required>
            <label>Role Utama</label>
            <select name="roleId" required>
                @foreach($roles as $role)<option value="{{ $role->id }}">{{ $role->name }}</option>@endforeach
            </select>
            <button class="btn" type="submit" style="margin-top:12px">Buat User</button>
        </form>
    </div>
    <div class="panel">
        <div class="panel pad" style="box-shadow:none;border-radius:0;border-bottom:1px solid #edf2f7">
            <p class="eyebrow">Alur Super Admin</p>
            <h2 class="section-title">Register lalu atur role</h2>
            <p class="muted" style="margin:0">Setelah user dibuat, gunakan konfigurasi role untuk menyesuaikan hak akses.</p>
        </div>
        <div class="table-wrap" data-title="Tabel Data"><table><thead><tr><th>User Terbaru</th><th>Role Utama</th><th>Jumlah Role</th></tr></thead><tbody>
        @foreach($users as $user)
            <tr>
                <td><strong>{{ $user->name }}</strong><br><span class="muted">{{ $user->email }}</span></td>
                <td><span class="badge">{{ $user->role?->name }}</span></td>
                <td><strong>{{ $user->userRoles->count() }}</strong></td>
            </tr>
        @endforeach
        </tbody></table></div>
    </div>
</div>
@endsection
