<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class UserRole extends Model
{
    use UsesSiakadTable;

    protected $table = 'UserRole';

    public function role() { return $this->belongsTo(Role::class, 'roleId'); }
    public function user() { return $this->belongsTo(User::class, 'userId'); }
}
