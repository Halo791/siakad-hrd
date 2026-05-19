<?php

namespace App\Models;

use App\Models\Concerns\UsesSiakadTable;
use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    use UsesSiakadTable;

    protected $table = 'User';
    protected $hidden = ['passwordHash', 'refreshToken'];

    public function role() { return $this->belongsTo(Role::class, 'roleId'); }
    public function userRoles() { return $this->hasMany(UserRole::class, 'userId'); }
    public function university() { return $this->belongsTo(University::class, 'universityId'); }
    public function student() { return $this->hasOne(Student::class, 'userId'); }
    public function lecturer() { return $this->hasOne(Lecturer::class, 'userId'); }
}
