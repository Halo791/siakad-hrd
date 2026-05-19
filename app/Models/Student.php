<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class Student extends Model
{
    use UsesSiakadTable;

    protected $table = 'Student';

    public function user() { return $this->belongsTo(User::class, 'userId'); }
    public function studyProgram() { return $this->belongsTo(StudyProgram::class, 'studyProgramId'); }
    public function parents() { return $this->hasMany(StudentParent::class, 'studentId'); }
}
