<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Student;
use App\Models\User;

class ApiController extends Controller
{
    public function health()
    {
        return response()->json(['status' => 'ok', 'service' => 'siakad-laravel']);
    }

    public function adminDashboard()
    {
        return response()->json([
            'totalUsers' => User::count(),
            'totalStudents' => Student::count(),
            'submittedKrs' => 0,
        ]);
    }

    public function roles()
    {
        return response()->json(Role::orderBy('code')->get());
    }

    public function users()
    {
        return response()->json(User::with(['role', 'userRoles.role'])->orderBy('name')->get());
    }
}
