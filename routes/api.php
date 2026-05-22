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
Route::get('/dashboard/dosen', [ApiController::class, 'dosenDashboard']);
Route::get('/dashboard/secure/dosen', [ApiController::class, 'dosenDashboard']);
Route::get('/dashboard/mahasiswa', [ApiController::class, 'mahasiswaDashboard']);
Route::get('/dashboard/secure/mahasiswa', [ApiController::class, 'mahasiswaDashboard']);
Route::get('/dashboard/secure/mahasiswa/portal', [ApiController::class, 'mahasiswaPortal']);
Route::get('/dashboard/secure/dosen/portal', [ApiController::class, 'dosenPortal']);

Route::get('/access/roles', [ApiController::class, 'roles']);
Route::get('/access/users', [ApiController::class, 'users']);
Route::get('/access/permissions', [ApiController::class, 'permissions']);
Route::post('/access/permissions', [ApiController::class, 'createPermission']);
Route::post('/access/users', [ApiController::class, 'createUser']);
Route::post('/access/users/assign-role', [ApiController::class, 'assignRole']);
Route::post('/access/users/set-primary-role', [ApiController::class, 'setPrimaryRole']);
Route::get('/access/role-permissions/{roleId}', [ApiController::class, 'rolePermissions']);
Route::post('/access/role-permissions', [ApiController::class, 'setRolePermission']);
Route::get('/access/audit-logs', [ApiController::class, 'auditLogs']);
Route::post('/access/permission-check/{action}', [ApiController::class, 'permissionCheck']);

Route::get('/master/universities', [ApiController::class, 'universities']);
Route::get('/master/faculties', [ApiController::class, 'faculties']);
Route::get('/master/study-programs', [ApiController::class, 'studyPrograms']);
Route::get('/master/degree-levels', [ApiController::class, 'degreeLevels']);
Route::get('/master/academic-years', [ApiController::class, 'academicYears']);
Route::get('/master/academic-periods', [ApiController::class, 'academicPeriods']);
Route::get('/master/study-systems', [ApiController::class, 'studySystems']);
Route::get('/master/student-classes', [ApiController::class, 'studentClasses']);
Route::get('/master/student-statuses', [ApiController::class, 'studentStatuses']);
Route::get('/master/lecturers', [ApiController::class, 'lecturers']);
Route::get('/master/students', [ApiController::class, 'students']);
Route::get('/master/students/{id}', [ApiController::class, 'student']);
Route::get('/master/student-parents', [ApiController::class, 'studentParents']);

Route::post('/master/{resource}', [ApiController::class, 'storeMaster']);
Route::patch('/master/{resource}/{id}', [ApiController::class, 'updateMaster']);
Route::delete('/master/{resource}/{id}', [ApiController::class, 'deleteMaster']);

Route::get('/curriculum', [ApiController::class, 'curriculums']);
Route::post('/curriculum', [ApiController::class, 'storeCurriculum']);
Route::get('/curriculum/courses', [ApiController::class, 'courses']);
Route::post('/curriculum/courses', [ApiController::class, 'storeCourse']);

Route::get('/classes', [ApiController::class, 'classes']);
Route::post('/classes', [ApiController::class, 'storeClass']);

Route::get('/krs', [ApiController::class, 'studyPlans']);
Route::post('/krs', [ApiController::class, 'storeStudyPlan']);
Route::post('/krs/{id}/items', [ApiController::class, 'storeStudyPlanItem']);
Route::post('/krs/{id}/submit', [ApiController::class, 'submitStudyPlan']);
Route::post('/krs/{id}/approve', [ApiController::class, 'approveStudyPlan']);
Route::post('/krs/approve-bulk', [ApiController::class, 'approveStudyPlansBulk']);
Route::post('/krs/{id}/reject', [ApiController::class, 'rejectStudyPlan']);
Route::post('/krs/{id}/validate', [ApiController::class, 'validateStudyPlan']);

Route::get('/grades', [ApiController::class, 'grades']);
Route::post('/grades/{id}/lock', [ApiController::class, 'lockGrade']);
Route::post('/grades/{id}/unlock', [ApiController::class, 'unlockGrade']);
Route::post('/grades/import-csv', [ApiController::class, 'importGradesCsv']);

Route::get('/khs', [ApiController::class, 'khs']);
Route::post('/khs/generate/{periodId}', [ApiController::class, 'generateKhs']);
Route::get('/transcripts', [ApiController::class, 'transcripts']);
Route::post('/transcripts/generate/{studentId}', [ApiController::class, 'generateTranscript']);

Route::get('/documents/student/{studentId}', [ApiController::class, 'studentDocuments']);
Route::post('/documents/upload', [ApiController::class, 'uploadStudentDocument']);
Route::get('/documents/{id}/download', [ApiController::class, 'downloadStudentDocument']);
Route::delete('/documents/{id}', [ApiController::class, 'deleteStudentDocument']);

Route::get('/settings/study-program', [ApiController::class, 'studyProgramSettings']);
Route::post('/settings/study-program', [ApiController::class, 'upsertStudyProgramSetting']);

Route::get('/reports/krs/{studyPlanId}.csv', [ApiController::class, 'exportKrsCsv']);
Route::get('/reports/krs/{studyPlanId}.xlsx', [ApiController::class, 'exportKrsCsv']);
Route::get('/reports/transcript/{studentId}.csv', [ApiController::class, 'exportTranscriptCsv']);
Route::get('/reports/transcript/{studentId}.xlsx', [ApiController::class, 'exportTranscriptCsv']);
Route::get('/reports/khs/{studentId}/{periodId}.pdf', [ApiController::class, 'exportKhsText']);
