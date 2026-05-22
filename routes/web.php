<?php

use App\Http\Controllers\AccessController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClassDataController;
use App\Http\Controllers\CurriculumController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\MasterController;
use App\Http\Controllers\PortalController;
use App\Http\Controllers\StudentPortalController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
});

Route::middleware('guest')->group(function () {
    Route::get('/login', [AuthController::class, 'showLogin'])->name('login');
    Route::post('/login', [AuthController::class, 'login'])->name('login.post');
});

Route::post('/logout', [AuthController::class, 'logout'])->name('logout');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/portal/mahasiswa', [StudentPortalController::class, 'index'])->name('portal.mahasiswa');
    Route::get('/portal/{section}', [PortalController::class, 'index'])->whereIn('section', ['pegawai', 'kegiatan', 'orang-tua', 'alumni'])->name('portal.index');
    Route::get('/perkuliahan/data-kurikulum', [CurriculumController::class, 'index'])->name('curriculum.index');
    Route::get('/perkuliahan/data-kelas', [ClassDataController::class, 'index'])->name('classes.index');
    Route::post('/perkuliahan/data-kelas/attachments/{resource}/{id}', [ClassDataController::class, 'storeAttachment'])->name('classes.attachments.store');
    Route::delete('/perkuliahan/data-kelas/attachments/{id}', [ClassDataController::class, 'destroyAttachment'])->name('classes.attachments.destroy');
    Route::post('/perkuliahan/data-kelas/{resource}', [ClassDataController::class, 'store'])->name('classes.store');
    Route::patch('/perkuliahan/data-kelas/{resource}/{id}', [ClassDataController::class, 'update'])->name('classes.update');
    Route::delete('/perkuliahan/data-kelas/{resource}/{id}', [ClassDataController::class, 'destroy'])->name('classes.destroy');
    Route::get('/master/mahasiswa', [MasterController::class, 'students'])->name('master.students');
    Route::get('/master/dosen', [MasterController::class, 'lecturers'])->name('master.lecturers');
    Route::get('/master/fakultas-prodi', [MasterController::class, 'faculties'])->name('master.faculties');
    Route::get('/access', [AccessController::class, 'index'])->name('access.index');
    Route::post('/access/users', [AccessController::class, 'storeUser'])->name('access.users.store');
});
