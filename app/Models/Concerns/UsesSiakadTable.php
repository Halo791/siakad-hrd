<?php

namespace App\Models\Concerns;

trait UsesSiakadTable
{
    public function initializeUsesSiakadTable(): void
    {
        $this->incrementing = false;
        $this->keyType = 'string';
        $this->timestamps = false;
        $this->guarded = [];
    }
}
