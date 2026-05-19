@extends('layouts.app', ['title' => 'Hak Akses User'])

@section('content')
<div class="grid" style="grid-template-columns:340px 1fr">
    <div class="card">
        <h2>Register User</h2>
        <form method="post" action="{{ route('access.users.store') }}">
            @csrf
            <label>Nama</label><input name="name" required>
            <label>Email</label><input name="email" type="email" required>
            <label>Password</label><input name="password" value="Admin@12345" required>
            <label>Role</label>
            <select name="roleId" required>
                @foreach($roles as $role)<option value="{{ $role->id }}">{{ $role->name }}</option>@endforeach
            </select>
            <button class="btn" type="submit" style="margin-top:12px">Buat User</button>
        </form>
    </div>
    <div class="card">
        <h2>User Terbaru</h2>
        <table><thead><tr><th>Nama</th><th>Email</th><th>Role Utama</th><th>Jumlah Role</th></tr></thead><tbody>
        @foreach($users as $user)
            <tr><td>{{ $user->name }}</td><td>{{ $user->email }}</td><td>{{ $user->role?->name }}</td><td>{{ $user->userRoles->count() }}</td></tr>
        @endforeach
        </tbody></table>
    </div>
</div>
@endsection
