<?php

namespace App\Models\Concerns;

trait UsesSiakadTable
{
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;
    protected $guarded = [];
}
