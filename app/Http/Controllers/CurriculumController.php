<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CurriculumController extends Controller
{
    private array $tabs = [
        'tahun-kurikulum',
        'mata-kuliah',
        'kurikulum-prodi',
        'skala-nilai',
        'komposisi-nilai',
        'predikat-kelulusan',
        'aturan-evaluasi',
        'ekivalensi-mata-kuliah',
        'kurikulum-konsentrasi',
        'prasyarat-mata-kuliah',
        'grup-mk-wajib-pilihan',
    ];

    public function index(Request $request)
    {
        $tab = in_array($request->query('tab'), $this->tabs, true) ? $request->query('tab') : 'tahun-kurikulum';

        return view('perkuliahan.kurikulum', [
            'tab' => $tab,
            'tabs' => $this->tabs,
            'curricula' => $this->curricula(),
            'courses' => $this->courses(),
            'curriculumCourses' => $this->curriculumCourses(),
            'gradingScales' => $this->gradingScales(),
            'gradeComponents' => $this->gradeComponents(),
            'courseEquivalences' => $this->courseEquivalences(),
            'coursePrerequisites' => $this->coursePrerequisites(),
            'stats' => $this->stats(),
        ]);
    }

    private function curricula()
    {
        if (!$this->tableExists('Curriculum')) return collect();

        return DB::table('Curriculum')
            ->leftJoin('StudyProgram', 'Curriculum.studyProgramId', '=', 'StudyProgram.id')
            ->leftJoin('Faculty', 'StudyProgram.facultyId', '=', 'Faculty.id')
            ->select('Curriculum.*', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName', 'Faculty.name as facultyName')
            ->orderByDesc('Curriculum.year')
            ->orderBy('StudyProgram.code')
            ->get();
    }

    private function courses()
    {
        if (!$this->tableExists('Course')) return collect();

        return DB::table('Course')
            ->orderBy('code')
            ->get();
    }

    private function curriculumCourses()
    {
        if (!$this->tableExists('CurriculumCourse')) return collect();

        return DB::table('CurriculumCourse')
            ->join('Curriculum', 'CurriculumCourse.curriculumId', '=', 'Curriculum.id')
            ->join('Course', 'CurriculumCourse.courseId', '=', 'Course.id')
            ->leftJoin('StudyProgram', 'Curriculum.studyProgramId', '=', 'StudyProgram.id')
            ->select(
                'CurriculumCourse.*',
                'Curriculum.name as curriculumName',
                'Curriculum.year',
                'StudyProgram.code as studyProgramCode',
                'StudyProgram.name as studyProgramName',
                'Course.code as courseCode',
                'Course.name as courseName',
                'Course.sks',
                'Course.minPassingGrade',
                'Course.isMandatory'
            )
            ->orderByDesc('Curriculum.year')
            ->orderBy('CurriculumCourse.semester')
            ->orderBy('Course.code')
            ->get();
    }

    private function gradingScales()
    {
        if (!$this->tableExists('GradingScale')) return collect();

        return DB::table('GradingScale')
            ->orderByDesc('gradePoint')
            ->get();
    }

    private function gradeComponents()
    {
        if (!$this->tableExists('GradeComponent')) return collect();

        return DB::table('GradeComponent')
            ->leftJoin('Class', 'GradeComponent.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('GradeComponent.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('GradeComponent.name')
            ->get();
    }

    private function courseEquivalences()
    {
        if (!$this->tableExists('CourseEquivalence')) return collect();

        return DB::table('CourseEquivalence')
            ->join('Course as FromCourse', 'CourseEquivalence.fromCourseId', '=', 'FromCourse.id')
            ->join('Course as ToCourse', 'CourseEquivalence.toCourseId', '=', 'ToCourse.id')
            ->select('CourseEquivalence.*', 'FromCourse.code as fromCode', 'FromCourse.name as fromName', 'ToCourse.code as toCode', 'ToCourse.name as toName')
            ->orderBy('FromCourse.code')
            ->get();
    }

    private function coursePrerequisites()
    {
        if (!$this->tableExists('CoursePrerequisite')) return collect();

        return DB::table('CoursePrerequisite')
            ->join('Course as Course', 'CoursePrerequisite.courseId', '=', 'Course.id')
            ->join('Course as Prerequisite', 'CoursePrerequisite.prerequisiteCourseId', '=', 'Prerequisite.id')
            ->select('CoursePrerequisite.*', 'Course.code as courseCode', 'Course.name as courseName', 'Prerequisite.code as prerequisiteCode', 'Prerequisite.name as prerequisiteName')
            ->orderBy('Course.code')
            ->get();
    }

    private function stats(): array
    {
        return [
            'curricula' => $this->tableExists('Curriculum') ? DB::table('Curriculum')->count() : 0,
            'courses' => $this->tableExists('Course') ? DB::table('Course')->count() : 0,
            'curriculumCourses' => $this->tableExists('CurriculumCourse') ? DB::table('CurriculumCourse')->count() : 0,
            'gradingScales' => $this->tableExists('GradingScale') ? DB::table('GradingScale')->count() : 0,
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
