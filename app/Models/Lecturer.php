<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class Lecturer extends Model
{
    use UsesSiakadTable;

    protected $table = 'Lecturer';

    public function user() { return $this->belongsTo(User::class, 'userId'); }
    public function studyProgram() { return $this->belongsTo(StudyProgram::class, 'studyProgramId'); }
}
