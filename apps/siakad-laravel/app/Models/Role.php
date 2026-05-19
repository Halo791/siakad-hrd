<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use UsesSiakadTable;

    protected $table = 'Role';

    public function permissions() { return $this->hasMany(RolePermission::class, 'roleId'); }
}
