<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function showLogin()
    {
        return view('auth.login');
    }

    public function login(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::with(['role', 'userRoles.role'])
            ->where('email', $credentials['email'])
            ->where('status', 'ACTIVE')
            ->first();

        if (!$user || !Hash::check($credentials['password'], $user->passwordHash)) {
            return back()->withErrors(['email' => 'Email atau password tidak valid.'])->onlyInput('email');
        }

        $request->session()->regenerate();
        $request->session()->put('siakad_user_id', $user->id);
        $request->session()->put('siakad_role', optional($user->role)->code);
        $request->session()->put('siakad_name', $user->name);

        return redirect()->route('dashboard');
    }

    public function logout(Request $request)
    {
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()->route('login');
    }

    public function apiLogin(Request $request)
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'roleCode' => ['nullable', 'string'],
        ]);

        $user = User::with(['role', 'userRoles.role', 'lecturer'])
            ->where('email', $data['email'])
            ->where('status', 'ACTIVE')
            ->first();

        if (!$user || !Hash::check($data['password'], $user->passwordHash)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        $roles = collect([$user->role])->merge($user->userRoles->pluck('role'))->filter()->unique('code')->values();
        $selectedRole = isset($data['roleCode'])
            ? $roles->firstWhere('code', $data['roleCode'])
            : $user->role;

        if (!$selectedRole) {
            return response()->json(['message' => 'Role is not assigned to this user'], 401);
        }

        $token = base64_encode($user->id.'|'.$selectedRole->code.'|'.Str::random(48));
        $user->refreshToken = $token;
        $user->save();

        return response()->json([
            'accessToken' => $token,
            'refreshToken' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => ['code' => $selectedRole->code, 'name' => $selectedRole->name],
                'structuralPositions' => [],
            ],
            'availableRoles' => $roles->map(function ($role) {
                return ['code' => $role->code, 'name' => $role->name];
            })->values(),
        ]);
    }

    public function apiProfile(Request $request)
    {
        $user = $this->userFromBearer($request);
        if (!$user) return response()->json(['message' => 'Unauthorized'], 401);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role,
        ]);
    }

    private function userFromBearer(Request $request): ?User
    {
        $token = Str::after($request->header('Authorization', ''), 'Bearer ');
        if (!$token) return null;

        return User::with('role')->where('refreshToken', $token)->first();
    }
}
