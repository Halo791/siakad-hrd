<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Lecturer;
use App\Models\Student;
use App\Models\StudyProgram;

class MasterController extends Controller
{
    public function students()
    {
        return view('master.students', [
            'students' => Student::with(['user', 'studyProgram.faculty'])->orderBy('nim')->paginate(25),
        ]);
    }

    public function lecturers()
    {
        return view('master.lecturers', [
            'lecturers' => Lecturer::with(['user', 'studyProgram'])->orderBy('name')->paginate(25),
        ]);
    }

    public function faculties()
    {
        return view('master.faculties', [
            'faculties' => Faculty::with('studyPrograms')->orderBy('code')->get(),
            'studyPrograms' => StudyProgram::with('faculty')->orderBy('code')->get(),
        ]);
    }
}
