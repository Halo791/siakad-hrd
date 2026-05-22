<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PortalController extends Controller
{
    private array $sections = [
        'pegawai' => [
            'label' => 'Pegawai',
            'tabs' => ['daftar-pegawai', 'detail-pegawai', 'pembimbing', 'tanda-tangan'],
        ],
        'kegiatan' => [
            'label' => 'Kegiatan',
            'tabs' => ['kalender-akademik', 'monitoring-kalender-akademik'],
        ],
        'orang-tua' => [
            'label' => 'Orang Tua',
            'tabs' => ['monitoring-mahasiswa'],
        ],
        'alumni' => [
            'label' => 'Alumni',
            'tabs' => ['profil-alumni'],
        ],
    ];

    public function index(Request $request, string $section)
    {
        abort_unless(isset($this->sections[$section]), 404);

        $tabs = $this->sections[$section]['tabs'];
        $tab = in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : $tabs[0];

        return view('portal.index', [
            'section' => $section,
            'sectionLabel' => $this->sections[$section]['label'],
            'tab' => $tab,
            'tabs' => $tabs,
            'lecturers' => $this->lecturers(),
            'selectedLecturer' => $this->selectedLecturer($request),
            'advisors' => $this->advisors(),
            'periods' => $this->academicPeriods(),
            'studyProgramSettings' => $this->studyProgramSettings(),
            'parentRows' => $this->parentRows(),
            'alumniRows' => $this->alumniRows(),
            'stats' => $this->stats(),
        ]);
    }

    private function lecturers()
    {
        if (!$this->tableExists('Lecturer')) return collect();

        return DB::table('Lecturer')
            ->leftJoin('User', 'Lecturer.userId', '=', 'User.id')
            ->leftJoin('StudyProgram', 'Lecturer.studyProgramId', '=', 'StudyProgram.id')
            ->select('Lecturer.*', 'User.email', 'User.status as userStatus', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderBy('Lecturer.name')
            ->get();
    }

    private function selectedLecturer(Request $request)
    {
        $lecturers = $this->lecturers();
        if ($request->query('lecturerId')) {
            return $lecturers->firstWhere('id', $request->query('lecturerId')) ?: $lecturers->first();
        }

        return $lecturers->first();
    }

    private function advisors()
    {
        if (!$this->tableExists('AcademicAdvisor')) return collect();

        return DB::table('AcademicAdvisor')
            ->join('Student', 'AcademicAdvisor.studentId', '=', 'Student.id')
            ->join('Lecturer', 'AcademicAdvisor.lecturerId', '=', 'Lecturer.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select(
                'AcademicAdvisor.*',
                'Student.nim',
                'Student.name as studentName',
                'Lecturer.nidn',
                'Lecturer.name as lecturerName',
                'StudyProgram.code as studyProgramCode',
                'StudyProgram.name as studyProgramName'
            )
            ->orderBy('Lecturer.name')
            ->orderBy('Student.nim')
            ->get();
    }

    private function academicPeriods()
    {
        if (!$this->tableExists('AcademicPeriod')) return collect();

        return DB::table('AcademicPeriod')
            ->orderByDesc('code')
            ->get();
    }

    private function studyProgramSettings()
    {
        if (!$this->tableExists('StudyProgramSetting')) return collect();

        return DB::table('StudyProgramSetting')
            ->join('StudyProgram', 'StudyProgramSetting.studyProgramId', '=', 'StudyProgram.id')
            ->join('AcademicPeriod', 'StudyProgramSetting.periodId', '=', 'AcademicPeriod.id')
            ->select('StudyProgramSetting.*', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName', 'AcademicPeriod.name as periodName')
            ->orderByDesc('AcademicPeriod.code')
            ->orderBy('StudyProgram.code')
            ->get();
    }

    private function parentRows()
    {
        if (!$this->tableExists('StudentParent')) return collect();

        return DB::table('StudentParent')
            ->join('Student', 'StudentParent.studentId', '=', 'Student.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select('StudentParent.*', 'Student.nim', 'Student.name as studentName', 'Student.status as studentStatus', 'Student.currentSemester', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderBy('Student.nim')
            ->get();
    }

    private function alumniRows()
    {
        if (!$this->tableExists('GraduationStudent')) return collect();

        return DB::table('GraduationStudent')
            ->join('Student', 'GraduationStudent.studentId', '=', 'Student.id')
            ->leftJoin('GraduationPeriod', 'GraduationStudent.graduationPeriodId', '=', 'GraduationPeriod.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select('GraduationStudent.*', 'Student.nim', 'Student.name as studentName', 'Student.currentSemester', 'GraduationPeriod.code as graduationCode', 'GraduationPeriod.name as graduationName', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderByDesc('GraduationPeriod.code')
            ->orderBy('Student.nim')
            ->get();
    }

    private function stats(): array
    {
        return [
            'lecturers' => $this->tableExists('Lecturer') ? DB::table('Lecturer')->count() : 0,
            'advisors' => $this->tableExists('AcademicAdvisor') ? DB::table('AcademicAdvisor')->count() : 0,
            'periods' => $this->tableExists('AcademicPeriod') ? DB::table('AcademicPeriod')->count() : 0,
            'parents' => $this->tableExists('StudentParent') ? DB::table('StudentParent')->count() : 0,
            'alumni' => $this->tableExists('GraduationStudent') ? DB::table('GraduationStudent')->count() : 0,
        ];
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
