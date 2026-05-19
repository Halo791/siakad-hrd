<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use App\Support\Ids;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AccessController extends Controller
{
    public function index()
    {
        return view('access.index', [
            'users' => User::with(['role', 'userRoles.role'])->latest('createdAt')->limit(50)->get(),
            'roles' => Role::orderBy('code')->get(),
        ]);
    }

    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string', 'max:191'],
            'email' => ['required', 'email', 'max:191'],
            'password' => ['required', 'string', 'min:8'],
            'roleId' => ['required', 'string'],
        ]);

        if (User::where('email', $data['email'])->exists()) {
            return back()->withErrors(['email' => 'Email sudah terdaftar.'])->withInput();
        }

        User::create([
            'id' => Ids::make('user_'),
            'universityId' => 'univ01',
            'roleId' => $data['roleId'],
            'name' => $data['name'],
            'email' => $data['email'],
            'passwordHash' => Hash::make($data['password']),
            'status' => 'ACTIVE',
        ]);

        return back()->with('success', 'User baru berhasil dibuat.');
    }
}
