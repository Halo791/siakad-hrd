<?php

namespace App\Http\Controllers;

use App\Models\Faculty;
use App\Models\Lecturer;
use App\Models\Permission;
use App\Models\Role;
use App\Models\RolePermission;
use App\Models\Student;
use App\Models\StudentParent;
use App\Models\StudyProgram;
use App\Models\University;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class ApiController extends Controller
{
    private array $adminRoles = [
        'SUPER_ADMIN',
        'ADMIN_UNIVERSITAS',
        'ADMIN_FAKULTAS',
        'ADMIN_PRODI',
        'ADMIN_AKADEMIK',
    ];

    public function health()
    {
        return response()->json(['status' => 'ok', 'service' => 'siakad-laravel']);
    }

    public function adminDashboard()
    {
        return response()->json([
            'students' => Student::where('status', 'AKTIF')->count(),
            'classes' => $this->countTable('Class'),
            'submittedKrs' => $this->countWhere('StudyPlan', 'status', 'SUBMITTED'),
        ]);
    }

    public function dosenDashboard()
    {
        return response()->json([
            'classes' => $this->countTable('ClassLecturer'),
            'unlockedGrades' => $this->tableExists('Grade') ? DB::table('Grade')->where('isLocked', false)->count() : 0,
            'pendingKrs' => $this->countWhere('StudyPlan', 'status', 'SUBMITTED'),
        ]);
    }

    public function mahasiswaDashboard(Request $request)
    {
        $viewer = $this->userFromBearer($request);
        $student = Student::where('userId', optional($viewer['user'])->id)->first() ?: Student::orderBy('nim')->first();

        if (!$student) {
            return response()->json(['totalSks' => 0, 'ips' => 0, 'ipk' => 0, 'docs' => 0]);
        }

        $khs = $this->tableExists('Khs') ? DB::table('Khs')->where('studentId', $student->id)->orderByDesc('periodId')->first() : null;
        $transcript = $this->tableExists('Transcript') ? DB::table('Transcript')->where('studentId', $student->id)->first() : null;

        return response()->json([
            'totalSks' => (int) ($transcript->totalSks ?? 0),
            'ips' => (float) ($khs->ips ?? 0),
            'ipk' => (float) ($transcript->gpa ?? 0),
            'docs' => $this->countWhere('StudentDocument', 'studentId', $student->id),
        ]);
    }

    public function roles()
    {
        return response()->json(Role::orderBy('code')->get());
    }

    public function permissions()
    {
        return response()->json(Permission::orderBy('code')->get());
    }

    public function createPermission(Request $request)
    {
        $data = $request->validate(['code' => ['required', 'string'], 'name' => ['required', 'string']]);
        $permission = Permission::firstOrNew(['code' => $data['code']]);
        if (!$permission->exists) $permission->id = $this->newId();
        $permission->name = $data['name'];
        $permission->save();

        return response()->json($permission);
    }

    public function users()
    {
        return response()->json(User::with(['role', 'userRoles.role'])->orderBy('name')->get());
    }

    public function createUser(Request $request)
    {
        $data = $request->validate([
            'name' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8'],
            'roleId' => ['required', 'string'],
            'universityId' => ['nullable', 'string'],
        ]);

        $user = User::create([
            'id' => $this->newId(),
            'universityId' => $data['universityId'] ?? University::value('id'),
            'roleId' => $data['roleId'],
            'name' => $data['name'],
            'email' => $data['email'],
            'passwordHash' => Hash::make($data['password']),
            'status' => 'ACTIVE',
        ]);

        return response()->json($user->load('role'));
    }

    public function assignRole(Request $request)
    {
        $data = $request->validate(['userId' => ['required', 'string'], 'roleId' => ['required', 'string']]);
        $exists = DB::table('UserRole')->where('userId', $data['userId'])->where('roleId', $data['roleId'])->exists();
        if (!$exists) DB::table('UserRole')->insert(['id' => $this->newId()] + $data);

        return response()->json(['ok' => true]);
    }

    public function setPrimaryRole(Request $request)
    {
        $data = $request->validate(['userId' => ['required', 'string'], 'roleId' => ['required', 'string']]);
        User::where('id', $data['userId'])->update(['roleId' => $data['roleId']]);

        return response()->json(['ok' => true]);
    }

    public function rolePermissions(string $roleId)
    {
        return response()->json(RolePermission::with('permission')->where('roleId', $roleId)->get());
    }

    public function setRolePermission(Request $request)
    {
        $data = $request->validate([
            'roleId' => ['required', 'string'],
            'permissionId' => ['required', 'string'],
        ]);

        $flags = $request->only([
            'canRead', 'canInsert', 'canUpdate', 'canDelete', 'canValidate', 'canApprove', 'canReject',
            'canPrint', 'canExport', 'canImport', 'canGenerate', 'canLock', 'canUnlock',
        ]);

        $row = RolePermission::firstOrNew(['roleId' => $data['roleId'], 'permissionId' => $data['permissionId']]);
        if (!$row->exists) $row->id = $this->newId();
        $row->fill($flags);
        $row->save();

        return response()->json($row->load('permission'));
    }

    public function auditLogs(Request $request)
    {
        if (!$this->tableExists('AuditLog')) return response()->json([]);

        return response()->json(DB::table('AuditLog')->orderByDesc('createdAt')->limit((int) $request->query('limit', 100))->get());
    }

    public function permissionCheck(string $action)
    {
        return response()->json(['ok' => true, 'action' => $action]);
    }

    public function universities() { return response()->json(University::orderBy('code')->get()); }
    public function academicYears() { return response()->json($this->refRows('AcademicYear')); }
    public function academicPeriods() { return response()->json($this->refRows('AcademicPeriod')); }
    public function studySystems() { return response()->json($this->refRows('StudySystemRef')); }
    public function studentClasses() { return response()->json($this->refRows('StudentClassRef')); }
    public function studentStatuses() { return response()->json($this->refRows('StudentStatusRef')); }
    public function degreeLevels() { return response()->json($this->refRows('DegreeLevelRef')); }
    public function studentParents() { return response()->json(StudentParent::orderBy('name')->get()); }

    public function faculties()
    {
        $faculties = Faculty::with(['university', 'studyPrograms.students', 'studyPrograms.lecturers'])->orderBy('code')->get();

        return response()->json($faculties->map(function (Faculty $faculty) {
            $semesterCounts = [];
            $lecturers = [];

            foreach ($faculty->studyPrograms as $program) {
                foreach ($program->students as $student) {
                    $semester = (int) ($student->currentSemester ?: 1);
                    $semesterCounts[$semester] = ($semesterCounts[$semester] ?? 0) + 1;
                }
                foreach ($program->lecturers as $lecturer) {
                    $lecturers[] = [
                        'id' => $lecturer->id,
                        'nidn' => $lecturer->nidn,
                        'name' => $lecturer->name,
                        'studyProgramId' => $program->id,
                        'studyProgramCode' => $program->code,
                        'studyProgramName' => $program->name,
                    ];
                }
            }

            $payload = $faculty->toArray();
            $payload['studyPrograms'] = $faculty->studyPrograms->map(fn ($program) => array_merge(
                $program->makeHidden(['students', 'lecturers'])->toArray(),
                ['studentCount' => $program->students->count(), 'lecturerCount' => $program->lecturers->count()]
            ))->values();
            $payload['studentBodyTotal'] = array_sum($semesterCounts);
            ksort($semesterCounts);
            $payload['studentBodyBySemester'] = collect($semesterCounts)->map(fn ($count, $semester) => [
                'semester' => (int) $semester,
                'count' => $count,
            ])->values();
            $payload['lecturers'] = collect($lecturers)->sortBy(['studyProgramCode', 'name'])->values();

            return $payload;
        }));
    }

    public function studyPrograms()
    {
        return response()->json(StudyProgram::with(['faculty'])->orderBy('code')->get());
    }

    public function students()
    {
        return response()->json(Student::with([
            'user.role',
            'user.userRoles.role',
            'studyProgram.faculty',
            'parents',
        ])->orderBy('nim')->get());
    }

    public function student(string $id)
    {
        return response()->json(Student::with([
            'user.role',
            'user.userRoles.role',
            'studyProgram.faculty',
            'parents',
        ])->findOrFail($id));
    }

    public function lecturers()
    {
        return response()->json(Lecturer::with(['user', 'studyProgram.faculty'])->orderBy('name')->get());
    }

    public function storeMaster(Request $request, string $resource)
    {
        [$table, $data] = $this->masterTableAndData($resource, $request);
        $data['id'] = $this->newId();
        DB::table($table)->insert($data);

        return response()->json(DB::table($table)->where('id', $data['id'])->first());
    }

    public function updateMaster(Request $request, string $resource, string $id)
    {
        [$table, $data] = $this->masterTableAndData($resource, $request, false);
        DB::table($table)->where('id', $id)->update($data);

        return response()->json(DB::table($table)->where('id', $id)->first());
    }

    public function deleteMaster(string $resource, string $id)
    {
        [$table] = $this->masterTableAndData($resource, request(), false);
        DB::table($table)->where('id', $id)->delete();

        return response()->json(['ok' => true]);
    }

    public function mahasiswaPortal(Request $request)
    {
        $viewer = $this->userFromBearer($request);
        $role = $viewer['role'] ?? '';
        $canInspect = in_array($role, $this->adminRoles, true);
        $studentId = $canInspect ? $request->query('studentId') : null;
        $student = $this->resolveStudent($viewer['user'] ?? null, $canInspect, $studentId);

        if (!$student) {
            return response()->json($this->emptyMahasiswaPortal($role, $canInspect));
        }

        $student->load(['user.role', 'user.userRoles.role', 'studyProgram.faculty', 'parents']);
        $activePeriod = $this->activePeriod();
        $transcript = $this->tableExists('Transcript') ? DB::table('Transcript')->where('studentId', $student->id)->first() : null;

        return response()->json([
            'viewerRole' => $role,
            'canInspectAllStudents' => $canInspect,
            'students' => $canInspect ? $this->studentOptions() : [],
            'student' => [
                'id' => $student->id,
                'nim' => $student->nim,
                'name' => $student->name,
                'email' => $student->user->email,
                'status' => $student->status,
                'currentSemester' => (int) $student->currentSemester,
                'accountStatus' => $student->user->status,
                'roleNames' => $this->roleNames($student->user),
                'studyProgram' => $this->studyProgramPayload($student->studyProgram),
                'studentClass' => $this->refName('StudentClassRef', $student->studentClassId),
                'studentStatus' => $this->refName('StudentStatusRef', $student->studentStatusId) ?: $student->status,
                'studySystem' => $this->refName('StudySystemRef', $student->studySystemId),
                'parents' => $student->parents->map(fn ($parent) => $parent->only(['id', 'name', 'relation', 'phone']))->values(),
            ],
            'activePeriod' => $activePeriod,
            'semesterStatus' => $this->semesterStatus($student, $activePeriod),
            'khs' => $this->khsRows($student, $transcript),
            'transcript' => $transcript ? ['id' => $transcript->id, 'gpa' => (float) $transcript->gpa, 'totalSks' => (int) $transcript->totalSks] : null,
            'documents' => $this->rowsWhere('StudentDocument', 'studentId', $student->id),
            'finance' => $this->financeRows($student->id),
            'activities' => $this->rowsWhere('StudentActivity', 'studentId', $student->id),
            'mbkmActivities' => [],
        ]);
    }

    public function dosenPortal(Request $request)
    {
        $viewer = $this->userFromBearer($request);
        $role = $viewer['role'] ?? '';
        $canInspect = in_array($role, $this->adminRoles, true);
        $lecturerId = $canInspect ? $request->query('lecturerId') : null;
        $lecturer = $this->resolveLecturer($viewer['user'] ?? null, $canInspect, $lecturerId);

        if (!$lecturer) {
            return response()->json($this->emptyDosenPortal($role, $canInspect));
        }

        $lecturer->load(['user.role', 'user.userRoles.role', 'studyProgram.faculty']);
        $activePeriod = $this->activePeriod();
        $teachingClasses = $this->teachingClasses($lecturer->id, optional($activePeriod)->code);
        $advisorStudents = $this->advisorStudents($lecturer->id);

        return response()->json([
            'viewerRole' => $role,
            'canInspectAllLecturers' => $canInspect,
            'lecturers' => $canInspect ? $this->lecturerOptions() : [],
            'lecturer' => [
                'id' => $lecturer->id,
                'nidn' => $lecturer->nidn,
                'name' => $lecturer->name,
                'email' => $lecturer->user->email,
                'accountStatus' => $lecturer->user->status,
                'roleNames' => $this->roleNames($lecturer->user),
                'studyProgram' => $lecturer->studyProgram ? $this->studyProgramPayload($lecturer->studyProgram) : null,
                'structuralPositions' => $this->structuralPositions($lecturer->id),
            ],
            'activePeriod' => $activePeriod,
            'teaching' => [
                'classes' => $teachingClasses,
                'activeClassCount' => count($teachingClasses),
                'totalSks' => collect($teachingClasses)->sum('sks'),
                'studentCount' => collect($teachingClasses)->sum('participantCount'),
            ],
            'advisories' => [
                'students' => $advisorStudents,
                'consultationCount' => $this->countWhere('Consultation', 'lecturerId', $lecturer->id),
                'consultations' => $this->consultations($lecturer->id),
            ],
            'identity' => [
                'nidn' => $lecturer->nidn,
                'nidk' => null,
                'nupn' => null,
                'signatureStatus' => 'Aktif',
            ],
        ]);
    }

    private function userFromBearer(Request $request): array
    {
        $token = Str::after($request->header('Authorization', ''), 'Bearer ');
        $user = $token ? User::with('role')->where('refreshToken', $token)->first() : null;
        $role = optional($user?->role)->code;

        if ($token && str_contains(base64_decode($token, true) ?: '', '|')) {
            $parts = explode('|', base64_decode($token));
            $role = $parts[1] ?? $role;
        }

        return ['user' => $user, 'role' => $role];
    }

    private function countTable(string $table): int
    {
        return $this->tableExists($table) ? DB::table($table)->count() : 0;
    }

    private function countWhere(string $table, string $column, mixed $value): int
    {
        return $this->tableExists($table) ? DB::table($table)->where($column, $value)->count() : 0;
    }

    private function rowsWhere(string $table, string $column, mixed $value)
    {
        return $this->tableExists($table) ? DB::table($table)->where($column, $value)->get() : [];
    }

    private function tableExists(string $table): bool
    {
        try {
            DB::table($table)->limit(1)->get();
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function refRows(string $table)
    {
        return $this->tableExists($table) ? DB::table($table)->orderBy('code')->get() : [];
    }

    private function refName(string $table, ?string $id): string
    {
        if (!$id || !$this->tableExists($table)) return '-';

        return DB::table($table)->where('id', $id)->value('name') ?: '-';
    }

    private function newId(): string
    {
        return 'cl'.Str::lower(Str::random(23));
    }

    private function activePeriod()
    {
        if (!$this->tableExists('AcademicPeriod')) return null;

        return DB::table('AcademicPeriod')->where('isActive', true)->orderByDesc('endDate')->first()
            ?: DB::table('AcademicPeriod')->orderByDesc('endDate')->first();
    }

    private function roleNames(User $user)
    {
        return collect([$user->role])
            ->merge($user->userRoles->pluck('role'))
            ->filter()
            ->pluck('name')
            ->values();
    }

    private function studyProgramPayload(?StudyProgram $program): array
    {
        return [
            'code' => $program?->code ?? '-',
            'name' => $program?->name ?? '-',
            'degreeLevel' => $this->refName('DegreeLevelRef', $program?->degreeLevelId) ?: ($program?->degreeLevel ?? '-'),
            'facultyCode' => $program?->faculty?->code ?? '-',
            'facultyName' => $program?->faculty?->name ?? '-',
        ];
    }

    private function resolveStudent(?User $user, bool $canInspect, ?string $studentId): ?Student
    {
        if ($canInspect) {
            return ($studentId ? Student::find($studentId) : null) ?: Student::orderBy('nim')->first();
        }

        return $user ? Student::where('userId', $user->id)->first() : null;
    }

    private function resolveLecturer(?User $user, bool $canInspect, ?string $lecturerId): ?Lecturer
    {
        if ($canInspect) {
            return ($lecturerId ? Lecturer::find($lecturerId) : null) ?: Lecturer::orderBy('name')->first();
        }

        return $user ? Lecturer::where('userId', $user->id)->first() : null;
    }

    private function studentOptions()
    {
        return Student::with('studyProgram')->orderBy('nim')->get()->map(fn ($student) => [
            'id' => $student->id,
            'nim' => $student->nim,
            'name' => $student->name,
            'currentSemester' => (int) $student->currentSemester,
            'studyProgram' => [
                'code' => $student->studyProgram?->code ?? '-',
                'name' => $student->studyProgram?->name ?? '-',
            ],
        ])->values();
    }

    private function lecturerOptions()
    {
        return Lecturer::with('studyProgram')->orderBy('name')->get()->map(fn ($lecturer) => [
            'id' => $lecturer->id,
            'nidn' => $lecturer->nidn,
            'name' => $lecturer->name,
            'studyProgram' => $lecturer->studyProgram ? [
                'code' => $lecturer->studyProgram->code,
                'name' => $lecturer->studyProgram->name,
            ] : null,
        ])->values();
    }

    private function semesterStatus(Student $student, $activePeriod): array
    {
        $plan = $activePeriod && $this->tableExists('StudyPlan')
            ? DB::table('StudyPlan')->where('studentId', $student->id)->where('periodId', $activePeriod->id)->first()
            : null;
        $items = $plan && $this->tableExists('StudyPlanItem')
            ? DB::table('StudyPlanItem')->where('studyPlanId', $plan->id)->get()
            : collect();

        return [
            'periodId' => $plan->periodId ?? $activePeriod->id ?? null,
            'periodName' => $activePeriod->name ?? '-',
            'krsStatus' => $plan->status ?? 'DRAFT',
            'krsLabel' => $this->studyPlanStatusLabel($plan->status ?? 'DRAFT'),
            'plannedSks' => 0,
            'classCount' => $items->count(),
            'gradedSks' => 0,
            'lockedGradeCount' => 0,
            'documentCount' => $this->countWhere('StudentDocument', 'studentId', $student->id),
            'activeClassRows' => [],
        ];
    }

    private function khsRows(Student $student, $transcript)
    {
        if (!$this->tableExists('Khs')) return [];

        return DB::table('Khs')
            ->leftJoin('AcademicPeriod', 'Khs.periodId', '=', 'AcademicPeriod.id')
            ->where('Khs.studentId', $student->id)
            ->orderByDesc('AcademicPeriod.code')
            ->select('Khs.*', 'AcademicPeriod.code as periodCode', 'AcademicPeriod.name as periodName')
            ->get()
            ->map(fn ($row) => [
                'periodId' => $row->periodId,
                'periodCode' => $row->periodCode ?? '-',
                'periodName' => $row->periodName ?? '-',
                'totalSks' => (int) ($row->totalSks ?? 0),
                'ips' => (float) ($row->ips ?? 0),
                'ipk' => (float) ($row->ipk ?? $transcript->gpa ?? 0),
                'generated' => true,
                'rows' => [],
            ]);
    }

    private function financeRows(string $studentId): array
    {
        $bills = $this->rowsWhere('Bill', 'studentId', $studentId);
        $billIds = collect($bills)->pluck('id');

        return [
            'bills' => $bills,
            'payments' => $this->tableExists('Payment') && $billIds->isNotEmpty()
                ? DB::table('Payment')->whereIn('billId', $billIds)->get()
                : [],
            'virtualAccounts' => $this->tableExists('VirtualAccount') && $billIds->isNotEmpty()
                ? DB::table('VirtualAccount')->whereIn('billId', $billIds)->get()
                : [],
        ];
    }

    private function teachingClasses(string $lecturerId, ?string $activePeriodCode)
    {
        if (!$this->tableExists('ClassLecturer')) return [];

        $rows = DB::table('ClassLecturer')
            ->join('Class', 'ClassLecturer.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->join('AcademicPeriod', 'Class.periodId', '=', 'AcademicPeriod.id')
            ->where('ClassLecturer.lecturerId', $lecturerId)
            ->select(
                'ClassLecturer.id as classLecturerId',
                'ClassLecturer.isPrimary',
                'Class.id',
                'Class.name',
                'Class.capacity',
                'AcademicPeriod.code as periodCode',
                'AcademicPeriod.name as periodName',
                'Course.code as courseCode',
                'Course.name as courseName',
                'Course.sks'
            )
            ->orderByDesc('AcademicPeriod.code')
            ->get();

        return $rows->filter(fn ($row) => !$activePeriodCode || $row->periodCode === $activePeriodCode)->map(function ($row) {
            return [
                'id' => $row->id,
                'classLecturerId' => $row->classLecturerId,
                'isPrimary' => (bool) $row->isPrimary,
                'name' => $row->name,
                'periodCode' => $row->periodCode,
                'periodName' => $row->periodName,
                'courseCode' => $row->courseCode,
                'courseName' => $row->courseName,
                'sks' => (int) $row->sks,
                'capacity' => (int) $row->capacity,
                'participantCount' => $this->countWhere('ClassStudent', 'classId', $row->id),
                'schedules' => $this->rowsWhere('ClassSchedule', 'classId', $row->id),
            ];
        })->values();
    }

    private function advisorStudents(string $lecturerId)
    {
        if (!$this->tableExists('AcademicAdvisor')) return [];

        $studentIds = DB::table('AcademicAdvisor')->where('lecturerId', $lecturerId)->pluck('studentId');

        return Student::with('studyProgram')->whereIn('id', $studentIds)->orderBy('nim')->get()->map(fn ($student) => [
            'id' => $student->id,
            'studentId' => $student->id,
            'nim' => $student->nim,
            'name' => $student->name,
            'currentSemester' => (int) $student->currentSemester,
            'status' => $student->status,
            'studyProgram' => [
                'code' => $student->studyProgram?->code ?? '-',
                'name' => $student->studyProgram?->name ?? '-',
            ],
        ])->values();
    }

    private function consultations(string $lecturerId)
    {
        if (!$this->tableExists('Consultation')) return [];

        return DB::table('Consultation')
            ->leftJoin('Student', 'Consultation.studentId', '=', 'Student.id')
            ->where('Consultation.lecturerId', $lecturerId)
            ->orderByDesc('Consultation.createdAt')
            ->select('Consultation.*', 'Student.nim as studentNim', 'Student.name as studentName')
            ->get();
    }

    private function structuralPositions(string $lecturerId)
    {
        if (!$this->tableExists('LecturerStructuralPosition')) return [];

        return DB::table('LecturerStructuralPosition')
            ->join('StructuralPosition', 'LecturerStructuralPosition.positionId', '=', 'StructuralPosition.id')
            ->leftJoin('Faculty', 'LecturerStructuralPosition.facultyId', '=', 'Faculty.id')
            ->leftJoin('StudyProgram', 'LecturerStructuralPosition.studyProgramId', '=', 'StudyProgram.id')
            ->where('LecturerStructuralPosition.lecturerId', $lecturerId)
            ->select(
                'LecturerStructuralPosition.id',
                'StructuralPosition.code',
                'StructuralPosition.name',
                'StructuralPosition.level',
                'LecturerStructuralPosition.decreeNumber',
                'LecturerStructuralPosition.startDate',
                'LecturerStructuralPosition.endDate',
                'LecturerStructuralPosition.isActive',
                'Faculty.name as facultyName',
                'StudyProgram.name as studyProgramName'
            )
            ->orderByDesc('LecturerStructuralPosition.isActive')
            ->get();
    }

    private function studyPlanStatusLabel(string $status): string
    {
        return [
            'DRAFT' => 'Draft',
            'SUBMITTED' => 'Diajukan',
            'APPROVED' => 'Disetujui PA',
            'REJECTED' => 'Ditolak',
            'CANCELED' => 'Dibatalkan',
        ][$status] ?? 'Draft';
    }

    private function emptyMahasiswaPortal(string $role, bool $canInspect): array
    {
        return [
            'viewerRole' => $role,
            'canInspectAllStudents' => $canInspect,
            'students' => [],
            'student' => null,
            'activePeriod' => null,
            'semesterStatus' => null,
            'khs' => [],
            'transcript' => null,
            'documents' => [],
            'finance' => ['bills' => [], 'payments' => [], 'virtualAccounts' => []],
            'activities' => [],
            'mbkmActivities' => [],
        ];
    }

    private function emptyDosenPortal(string $role, bool $canInspect): array
    {
        return [
            'viewerRole' => $role,
            'canInspectAllLecturers' => $canInspect,
            'lecturers' => [],
            'lecturer' => null,
            'activePeriod' => null,
            'teaching' => ['classes' => [], 'activeClassCount' => 0, 'totalSks' => 0, 'studentCount' => 0],
            'advisories' => ['students' => [], 'consultationCount' => 0, 'consultations' => []],
            'identity' => ['nidn' => null, 'nidk' => null, 'nupn' => null, 'signatureStatus' => 'Belum tercatat'],
        ];
    }

    private function masterTableAndData(string $resource, Request $request, bool $creating = true): array
    {
        $map = [
            'universities' => ['University', ['code', 'name']],
            'faculties' => ['Faculty', ['universityId', 'code', 'name', 'accreditation', 'leaderName', 'leaderPhone']],
            'study-programs' => ['StudyProgram', ['facultyId', 'code', 'name', 'degreeLevel', 'degreeLevelId']],
            'academic-years' => ['AcademicYear', ['code', 'name']],
            'academic-periods' => ['AcademicPeriod', ['academicYearId', 'code', 'name', 'startDate', 'endDate', 'isActive']],
            'study-systems' => ['StudySystemRef', ['code', 'name']],
            'student-classes' => ['StudentClassRef', ['code', 'name']],
            'student-statuses' => ['StudentStatusRef', ['code', 'name']],
            'degree-levels' => ['DegreeLevelRef', ['code', 'name']],
            'student-parents' => ['StudentParent', ['studentId', 'name', 'relation', 'phone']],
        ];

        if ($resource === 'students') return ['Student', $this->studentData($request, $creating)];
        if ($resource === 'lecturers') return ['Lecturer', $this->lecturerData($request, $creating)];
        abort_unless(isset($map[$resource]), 404);

        [$table, $fields] = $map[$resource];
        return [$table, collect($request->only($fields))->filter(fn ($value) => $value !== '')->all()];
    }

    private function studentData(Request $request, bool $creating): array
    {
        if ($creating) {
            $role = Role::where('code', $request->input('roleCode', 'MAHASISWA'))->firstOrFail();
            $userId = $this->newId();
            User::create([
                'id' => $userId,
                'universityId' => $request->input('universityId') ?: University::value('id'),
                'roleId' => $role->id,
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'passwordHash' => Hash::make($request->input('password', 'Admin@12345')),
                'status' => 'ACTIVE',
            ]);
        }

        return collect($request->only([
            'userId', 'studyProgramId', 'studentClassId', 'studentStatusId', 'studySystemId',
            'nim', 'name', 'status', 'currentSemester',
        ]))->filter(fn ($value) => $value !== '')->all() + ($creating ? ['userId' => $userId] : []);
    }

    private function lecturerData(Request $request, bool $creating): array
    {
        if ($creating) {
            $role = Role::where('code', $request->input('roleCode', 'DOSEN'))->firstOrFail();
            $userId = $this->newId();
            User::create([
                'id' => $userId,
                'universityId' => $request->input('universityId') ?: University::value('id'),
                'roleId' => $role->id,
                'name' => $request->input('name'),
                'email' => $request->input('email'),
                'passwordHash' => Hash::make($request->input('password', 'Admin@12345')),
                'status' => 'ACTIVE',
            ]);
        }

        return collect($request->only(['userId', 'studyProgramId', 'nidn', 'name']))
            ->filter(fn ($value) => $value !== '')
            ->all() + ($creating ? ['userId' => $userId] : []);
    }
}
