<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class StudentParent extends Model
{
    use UsesSiakadTable;

    protected $table = 'StudentParent';
}
