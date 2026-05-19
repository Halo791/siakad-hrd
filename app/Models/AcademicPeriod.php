<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class AcademicPeriod extends Model
{
    use UsesSiakadTable;

    protected $table = 'AcademicPeriod';
}
