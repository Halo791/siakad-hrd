<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

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

    private array $resourceTables = [
        'curricula' => 'Curriculum',
        'courses' => 'Course',
        'curriculum-courses' => 'CurriculumCourse',
        'grading-scales' => 'GradingScale',
        'grade-components' => 'GradeComponent',
        'equivalences' => 'CourseEquivalence',
        'prerequisites' => 'CoursePrerequisite',
    ];

    public function index(Request $request)
    {
        $tab = in_array($request->query('tab'), $this->tabs, true) ? $request->query('tab') : 'tahun-kurikulum';
        $this->ensureAttachmentTable();

        return view('perkuliahan.kurikulum', [
            'tab' => $tab,
            'tabs' => $this->tabs,
            'studyPrograms' => $this->table('StudyProgram')->orderBy('code')->get(),
            'plainCurricula' => $this->table('Curriculum')->orderByDesc('year')->get(),
            'plainCourses' => $this->table('Course')->orderBy('code')->get(),
            'plainClasses' => $this->table('Class')->orderBy('name')->get(),
            'curricula' => $this->curricula(),
            'courses' => $this->courses(),
            'curriculumCourses' => $this->curriculumCourses(),
            'gradingScales' => $this->gradingScales(),
            'gradeComponents' => $this->gradeComponents(),
            'courseEquivalences' => $this->courseEquivalences(),
            'coursePrerequisites' => $this->coursePrerequisites(),
            'attachments' => $this->attachments(),
            'previewUrl' => fn (?string $url) => $this->previewUrl($url),
            'stats' => $this->stats(),
        ]);
    }

    public function store(Request $request, string $resource)
    {
        $table = $this->tableFor($resource);
        $data = $this->validated($request, $resource);
        $data['id'] = (string) Str::uuid();
        $this->table($table)->insert($data);

        return back()->with('success', 'Data berhasil ditambahkan.');
    }

    public function update(Request $request, string $resource, string $id)
    {
        $table = $this->tableFor($resource);
        $this->table($table)->where('id', $id)->update($this->validated($request, $resource));

        return back()->with('success', 'Data berhasil diperbarui.');
    }

    public function destroy(string $resource, string $id)
    {
        $table = $this->tableFor($resource);
        $this->table($table)->where('id', $id)->delete();
        if ($this->tableExists('RecordAttachment')) {
            DB::table('RecordAttachment')->where('entityTable', $table)->where('entityId', $id)->delete();
        }

        return back()->with('success', 'Data berhasil dihapus.');
    }

    public function storeAttachment(Request $request, string $resource, string $id)
    {
        $table = $this->tableFor($resource);
        if (!$this->ensureAttachmentTable()) {
            return back()->withErrors(['imageUrl' => 'Tabel RecordAttachment belum tersedia atau user database tidak punya izin membuat tabel.']);
        }
        $data = $request->validate([
            'title' => ['required', 'string', 'max:191'],
            'imageUrl' => ['required', 'url', 'max:500'],
        ]);

        $this->table('RecordAttachment')->insert([
            'id' => (string) Str::uuid(),
            'entityTable' => $table,
            'entityId' => $id,
            'title' => $data['title'],
            'imageUrl' => $data['imageUrl'],
            'createdAt' => now(),
        ]);

        return back()->with('success', 'Lampiran gambar berhasil ditambahkan.');
    }

    public function destroyAttachment(string $id)
    {
        $this->ensureAttachmentTable();
        if ($this->tableExists('RecordAttachment')) {
            DB::table('RecordAttachment')->where('id', $id)->delete();
        }

        return back()->with('success', 'Lampiran gambar berhasil dihapus.');
    }

    private function validated(Request $request, string $resource): array
    {
        return match ($resource) {
            'curricula' => $request->validate([
                'studyProgramId' => ['required', 'string'],
                'year' => ['required', 'integer', 'min:1900', 'max:2200'],
                'name' => ['required', 'string', 'max:191'],
            ]),
            'courses' => $request->validate([
                'code' => ['required', 'string', 'max:191'],
                'name' => ['required', 'string', 'max:191'],
                'sks' => ['required', 'integer', 'min:1', 'max:10'],
                'minPassingGrade' => ['required', 'string', 'max:10'],
                'isMandatory' => ['nullable'],
            ]) + ['isMandatory' => $request->boolean('isMandatory')],
            'curriculum-courses' => $request->validate([
                'curriculumId' => ['required', 'string'],
                'courseId' => ['required', 'string'],
                'semester' => ['required', 'integer', 'min:1', 'max:14'],
                'isPackage' => ['nullable'],
            ]) + ['isPackage' => $request->boolean('isPackage')],
            'grading-scales' => $request->validate([
                'letter' => ['required', 'string', 'max:10'],
                'minValue' => ['required', 'numeric', 'min:0', 'max:100'],
                'maxValue' => ['required', 'numeric', 'min:0', 'max:100'],
                'gradePoint' => ['required', 'numeric', 'min:0', 'max:4'],
            ]),
            'grade-components' => $request->validate([
                'name' => ['required', 'string', 'max:191'],
                'percentage' => ['required', 'numeric', 'min:0', 'max:100'],
                'classId' => ['nullable', 'string'],
            ]),
            'equivalences' => $request->validate([
                'fromCourseId' => ['required', 'string'],
                'toCourseId' => ['required', 'string'],
            ]),
            'prerequisites' => $request->validate([
                'courseId' => ['required', 'string'],
                'prerequisiteCourseId' => ['required', 'string'],
            ]),
            default => abort(404),
        };
    }

    private function tableFor(string $resource): string
    {
        abort_unless(isset($this->resourceTables[$resource]), 404);
        return $this->resourceTables[$resource];
    }

    private function curricula()
    {
        return $this->table('Curriculum')
            ->leftJoin('StudyProgram', 'Curriculum.studyProgramId', '=', 'StudyProgram.id')
            ->leftJoin('Faculty', 'StudyProgram.facultyId', '=', 'Faculty.id')
            ->select('Curriculum.*', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName', 'Faculty.name as facultyName')
            ->orderByDesc('Curriculum.year')
            ->orderBy('StudyProgram.code')
            ->get();
    }

    private function courses()
    {
        return $this->table('Course')->orderBy('code')->get();
    }

    private function curriculumCourses()
    {
        return $this->table('CurriculumCourse')
            ->join('Curriculum', 'CurriculumCourse.curriculumId', '=', 'Curriculum.id')
            ->join('Course', 'CurriculumCourse.courseId', '=', 'Course.id')
            ->leftJoin('StudyProgram', 'Curriculum.studyProgramId', '=', 'StudyProgram.id')
            ->select('CurriculumCourse.*', 'Curriculum.name as curriculumName', 'Curriculum.year', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName', 'Course.code as courseCode', 'Course.name as courseName', 'Course.sks', 'Course.minPassingGrade', 'Course.isMandatory')
            ->orderByDesc('Curriculum.year')
            ->orderBy('CurriculumCourse.semester')
            ->orderBy('Course.code')
            ->get();
    }

    private function gradingScales()
    {
        return $this->table('GradingScale')->orderByDesc('gradePoint')->get();
    }

    private function gradeComponents()
    {
        return $this->table('GradeComponent')
            ->leftJoin('Class', 'GradeComponent.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('GradeComponent.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('GradeComponent.name')
            ->get();
    }

    private function courseEquivalences()
    {
        return $this->table('CourseEquivalence')
            ->join('Course as FromCourse', 'CourseEquivalence.fromCourseId', '=', 'FromCourse.id')
            ->join('Course as ToCourse', 'CourseEquivalence.toCourseId', '=', 'ToCourse.id')
            ->select('CourseEquivalence.*', 'FromCourse.code as fromCode', 'FromCourse.name as fromName', 'ToCourse.code as toCode', 'ToCourse.name as toName')
            ->orderBy('FromCourse.code')
            ->get();
    }

    private function coursePrerequisites()
    {
        return $this->table('CoursePrerequisite')
            ->join('Course as Course', 'CoursePrerequisite.courseId', '=', 'Course.id')
            ->join('Course as Prerequisite', 'CoursePrerequisite.prerequisiteCourseId', '=', 'Prerequisite.id')
            ->select('CoursePrerequisite.*', 'Course.code as courseCode', 'Course.name as courseName', 'Prerequisite.code as prerequisiteCode', 'Prerequisite.name as prerequisiteName')
            ->orderBy('Course.code')
            ->get();
    }

    private function attachments()
    {
        if (!$this->tableExists('RecordAttachment')) return collect();

        return DB::table('RecordAttachment')->get()->groupBy(fn ($row) => $row->entityTable.'|'.$row->entityId);
    }

    private function stats(): array
    {
        return [
            'curricula' => $this->table('Curriculum')->count(),
            'courses' => $this->table('Course')->count(),
            'curriculumCourses' => $this->table('CurriculumCourse')->count(),
            'gradingScales' => $this->table('GradingScale')->count(),
        ];
    }

    private function table(string $table)
    {
        if (!$this->tableExists($table)) {
            return DB::query()->fromSub('select null as id where 1=0', $table);
        }

        return DB::table($table);
    }

    private function ensureAttachmentTable(): bool
    {
        if ($this->tableExists('RecordAttachment')) return true;

        try {
            DB::statement("CREATE TABLE IF NOT EXISTS `RecordAttachment` (
                `id` VARCHAR(191) NOT NULL,
                `entityTable` VARCHAR(191) NOT NULL,
                `entityId` VARCHAR(191) NOT NULL,
                `title` VARCHAR(191) NOT NULL,
                `imageUrl` VARCHAR(500) NOT NULL,
                `createdAt` DATETIME NULL,
                PRIMARY KEY (`id`),
                KEY `RecordAttachment_entity_idx` (`entityTable`, `entityId`)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
            return true;
        } catch (\Throwable) {
            return false;
        }
    }

    private function previewUrl(?string $url): ?string
    {
        if (!$url) return null;
        if (preg_match('/drive\.google\.com\/file\/d\/([^\/]+)/', $url, $matches)) return 'https://drive.google.com/uc?export=view&id='.$matches[1];
        if (preg_match('/[?&]id=([^&]+)/', $url, $matches)) return 'https://drive.google.com/uc?export=view&id='.$matches[1];
        return $url;
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
