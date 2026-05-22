<?php

namespace App\Http\Controllers;

use App\Models\Student;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class StudentPortalController extends Controller
{
    private array $tabs = [
        'daftar-mahasiswa',
        'detail-mahasiswa',
        'biodata',
        'status-semester',
        'krs',
        'khs',
        'transkrip',
        'riwayat-keuangan',
        'konsentrasi-peminatan',
        'pindah-transfer-prodi',
        'nilai-konversi',
        'aktivitas-prestasi',
        'salin-mahasiswa',
    ];

    public function index(Request $request)
    {
        $tab = in_array($request->query('tab'), $this->tabs, true) ? $request->query('tab') : 'daftar-mahasiswa';
        $students = Student::with(['user.role', 'user.userRoles.role', 'studyProgram.faculty', 'parents'])
            ->orderBy('nim')
            ->get();
        $selectedStudent = $this->selectedStudent($request, $students);

        return view('portal.mahasiswa', [
            'tab' => $tab,
            'tabs' => $this->tabs,
            'students' => $students,
            'student' => $selectedStudent,
            'activePeriod' => $this->activePeriod(),
            'studyPlans' => $selectedStudent ? $this->studyPlans($selectedStudent->id) : collect(),
            'khsRows' => $selectedStudent ? $this->khsRows($selectedStudent->id) : collect(),
            'transcript' => $selectedStudent && $this->tableExists('Transcript')
                ? DB::table('Transcript')->where('studentId', $selectedStudent->id)->first()
                : null,
            'documents' => $selectedStudent ? $this->rowsWhere('StudentDocument', 'studentId', $selectedStudent->id) : collect(),
            'finance' => $selectedStudent ? $this->financeRows($selectedStudent->id) : ['bills' => collect(), 'payments' => collect(), 'virtualAccounts' => collect()],
            'activities' => $selectedStudent ? $this->rowsWhere('StudentActivity', 'studentId', $selectedStudent->id) : collect(),
            'mbkmActivities' => $selectedStudent ? $this->mbkmRows($selectedStudent->id) : collect(),
            'conversionRows' => $selectedStudent ? $this->conversionRows($selectedStudent->id) : collect(),
            'semesterStatus' => $selectedStudent ? $this->semesterStatus($selectedStudent->id) : null,
        ]);
    }

    private function selectedStudent(Request $request, $students): ?Student
    {
        if ($request->query('studentId')) {
            $student = $students->firstWhere('id', $request->query('studentId'));
            if ($student) return $student;
        }

        $userId = session('siakad_user_id');
        $student = $userId ? $students->firstWhere('userId', $userId) : null;

        return $student ?: $students->first();
    }

    private function activePeriod()
    {
        if (!$this->tableExists('AcademicPeriod')) return null;

        return DB::table('AcademicPeriod')->where('isActive', true)->orderByDesc('endDate')->first()
            ?: DB::table('AcademicPeriod')->orderByDesc('endDate')->first();
    }

    private function studyPlans(string $studentId)
    {
        if (!$this->tableExists('StudyPlan')) return collect();

        $plans = DB::table('StudyPlan')
            ->leftJoin('AcademicPeriod', 'StudyPlan.periodId', '=', 'AcademicPeriod.id')
            ->where('StudyPlan.studentId', $studentId)
            ->select('StudyPlan.*', 'AcademicPeriod.code as periodCode', 'AcademicPeriod.name as periodName')
            ->orderByDesc('AcademicPeriod.code')
            ->get();

        $planIds = $plans->pluck('id');
        $items = $planIds->isNotEmpty() && $this->tableExists('StudyPlanItem')
            ? DB::table('StudyPlanItem')
                ->join('Class', 'StudyPlanItem.classId', '=', 'Class.id')
                ->join('Course', 'Class.courseId', '=', 'Course.id')
                ->whereIn('StudyPlanItem.studyPlanId', $planIds)
                ->select('StudyPlanItem.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName', 'Course.sks')
                ->get()
                ->groupBy('studyPlanId')
            : collect();

        return $plans->map(function ($plan) use ($items) {
            $plan->items = $items->get($plan->id, collect());
            $plan->plannedSks = $plan->items->sum('sks');
            return $plan;
        });
    }

    private function khsRows(string $studentId)
    {
        if (!$this->tableExists('Khs')) return collect();

        return DB::table('Khs')
            ->leftJoin('AcademicPeriod', 'Khs.periodId', '=', 'AcademicPeriod.id')
            ->where('Khs.studentId', $studentId)
            ->select('Khs.*', 'AcademicPeriod.code as periodCode', 'AcademicPeriod.name as periodName')
            ->orderByDesc('AcademicPeriod.code')
            ->get();
    }

    private function semesterStatus(string $studentId)
    {
        $period = $this->activePeriod();
        if (!$period || !$this->tableExists('StudyPlan')) return null;

        $plan = DB::table('StudyPlan')->where('studentId', $studentId)->where('periodId', $period->id)->first();
        $items = $plan && $this->tableExists('StudyPlanItem')
            ? DB::table('StudyPlanItem')
                ->join('Class', 'StudyPlanItem.classId', '=', 'Class.id')
                ->join('Course', 'Class.courseId', '=', 'Course.id')
                ->where('StudyPlanItem.studyPlanId', $plan->id)
                ->select('Course.sks')
                ->get()
            : collect();

        return [
            'periodName' => $period->name,
            'status' => $plan->status ?? 'DRAFT',
            'classCount' => $items->count(),
            'plannedSks' => $items->sum('sks'),
            'documentCount' => $this->rowsWhere('StudentDocument', 'studentId', $studentId)->count(),
        ];
    }

    private function financeRows(string $studentId): array
    {
        $bills = $this->rowsWhere('Bill', 'studentId', $studentId);
        $billIds = $bills->pluck('id');

        return [
            'bills' => $bills,
            'payments' => $this->tableExists('Payment') && $billIds->isNotEmpty() ? DB::table('Payment')->whereIn('billId', $billIds)->get() : collect(),
            'virtualAccounts' => $this->tableExists('VirtualAccount') && $billIds->isNotEmpty() ? DB::table('VirtualAccount')->whereIn('billId', $billIds)->get() : collect(),
        ];
    }

    private function mbkmRows(string $studentId)
    {
        return $this->rowsWhere('MbkmActivity', 'studentId', $studentId);
    }

    private function conversionRows(string $studentId)
    {
        if (!$this->tableExists('MbkmActivity') || !$this->tableExists('MbkmConversion')) return collect();

        return DB::table('MbkmConversion')
            ->join('MbkmActivity', 'MbkmConversion.mbkmActivityId', '=', 'MbkmActivity.id')
            ->leftJoin('Course', 'MbkmConversion.courseId', '=', 'Course.id')
            ->where('MbkmActivity.studentId', $studentId)
            ->select('MbkmConversion.*', 'MbkmActivity.type', 'MbkmActivity.partner', 'Course.code as courseCode', 'Course.name as courseName', 'Course.sks')
            ->get();
    }

    private function rowsWhere(string $table, string $column, mixed $value)
    {
        return $this->tableExists($table) ? DB::table($table)->where($column, $value)->get() : collect();
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
}
