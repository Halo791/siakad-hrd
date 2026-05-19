<?php

namespace App\Http\Controllers;

use App\Models\AcademicPeriod;
use App\Models\Faculty;
use App\Models\Lecturer;
use App\Models\Student;
use App\Models\User;

class DashboardController extends Controller
{
    public function index()
    {
        return view('dashboard.index', [
            'stats' => [
                'users' => User::count(),
                'students' => Student::count(),
                'lecturers' => Lecturer::count(),
                'faculties' => Faculty::count(),
            ],
            'activePeriod' => AcademicPeriod::where('isActive', 1)->orderByDesc('endDate')->first(),
        ]);
    }
}
