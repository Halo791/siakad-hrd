<?php

use App\Http\Controllers\ApiController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/', [ApiController::class, 'health']);
Route::post('/auth/login', [AuthController::class, 'apiLogin']);
Route::post('/auth/refresh', [AuthController::class, 'apiProfile']);
Route::get('/auth/profile', [AuthController::class, 'apiProfile']);

Route::get('/dashboard/admin', [ApiController::class, 'adminDashboard']);
Route::get('/dashboard/secure/admin', [ApiController::class, 'adminDashboard']);
Route::get('/access/roles', [ApiController::class, 'roles']);
Route::get('/access/users', [ApiController::class, 'users']);
