<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class University extends Model
{
    use UsesSiakadTable;

    protected $table = 'University';
}
