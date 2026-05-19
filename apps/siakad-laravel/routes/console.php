<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('siakad:health', function () {
    $this->info('SIAKAD Laravel OK');
});
