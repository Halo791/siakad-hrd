<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class Faculty extends Model
{
    use UsesSiakadTable;

    protected $table = 'Faculty';

    public function university() { return $this->belongsTo(University::class, 'universityId'); }
    public function studyPrograms() { return $this->hasMany(StudyProgram::class, 'facultyId'); }
}
