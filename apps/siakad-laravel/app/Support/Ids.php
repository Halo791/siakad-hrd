<?php

namespace App\Support;

use Illuminate\Support\Str;

class Ids
{
    public static function make(string $prefix = ''): string
    {
        return $prefix.Str::lower(Str::random(24));
    }
}
