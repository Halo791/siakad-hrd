<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class RolePermission extends Model
{
    use UsesSiakadTable;

    protected $table = 'RolePermission';

    public function role() { return $this->belongsTo(Role::class, 'roleId'); }
    public function permission() { return $this->belongsTo(Permission::class, 'permissionId'); }
}
