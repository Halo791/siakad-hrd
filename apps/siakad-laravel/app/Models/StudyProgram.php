<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class StudyProgram extends Model
{
    use UsesSiakadTable;

    protected $table = 'StudyProgram';

    public function faculty() { return $this->belongsTo(Faculty::class, 'facultyId'); }
    public function students() { return $this->hasMany(Student::class, 'studyProgramId'); }
    public function lecturers() { return $this->hasMany(Lecturer::class, 'studyProgramId'); }
}
