<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class ClassDataController extends Controller
{
    private array $tabs = [
        'tahun-ajaran',
        'kelas-kuliah',
        'detail-kelas-kuliah',
        'dosen-pengajar',
        'jadwal-perkuliahan',
        'peserta-kelas',
        'presensi-kelas',
        'nilai-perkuliahan',
        'jadwal-presensi',
        'pemutihan-nilai',
    ];

    private array $resourceTables = [
        'periods' => 'AcademicPeriod',
        'classes' => 'Class',
        'schedules' => 'ClassSchedule',
        'lecturers' => 'ClassLecturer',
        'students' => 'ClassStudent',
        'meetings' => 'Meeting',
        'attendances' => 'Attendance',
        'grades' => 'Grade',
    ];

    public function index(Request $request)
    {
        $tab = in_array($request->query('tab'), $this->tabs, true) ? $request->query('tab') : 'tahun-ajaran';
        $perPage = $this->perPage($request);
        $needsClassStudentOptions = in_array($tab, ['presensi-kelas', 'jadwal-presensi', 'nilai-perkuliahan', 'pemutihan-nilai'], true);

        return view('perkuliahan.data-kelas', [
            'tab' => $tab,
            'tabs' => $this->tabs,
            'academicYears' => $this->rows('AcademicYear', 'code', true),
            'studyPrograms' => $this->rows('StudyProgram', 'code'),
            'courses' => $this->rows('Course', 'code'),
            'plainClasses' => $this->rows('Class', 'name'),
            'plainLecturers' => $this->rows('Lecturer', 'name'),
            'plainStudents' => $this->rows('Student', 'nim'),
            'plainClassStudents' => $this->rows('ClassStudent'),
            'plainMeetings' => $this->rows('Meeting', 'meetingDate'),
            'periods' => $this->periods(),
            'classes' => $this->classes(),
            'classLecturers' => $this->classLecturers(),
            'schedules' => $this->schedules(),
            'classStudents' => $tab === 'peserta-kelas' ? $this->classStudents($perPage) : collect(),
            'classStudentOptions' => $needsClassStudentOptions ? $this->classStudentOptions() : collect(),
            'meetings' => in_array($tab, ['presensi-kelas', 'jadwal-presensi'], true) ? $this->meetings() : collect(),
            'attendances' => in_array($tab, ['presensi-kelas', 'jadwal-presensi'], true) ? $this->attendances($perPage) : collect(),
            'grades' => in_array($tab, ['nilai-perkuliahan', 'pemutihan-nilai'], true) ? $this->grades($perPage) : collect(),
            'stats' => $this->stats(),
            'perPage' => $perPage,
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
            'periods' => $request->validate([
                'academicYearId' => ['required', 'string'],
                'code' => ['required', 'string', 'max:191'],
                'name' => ['required', 'string', 'max:191'],
                'startDate' => ['required', 'date'],
                'endDate' => ['required', 'date'],
                'isActive' => ['nullable'],
            ]) + ['isActive' => $request->boolean('isActive')],
            'classes' => $request->validate([
                'studyProgramId' => ['required', 'string'],
                'courseId' => ['required', 'string'],
                'periodId' => ['required', 'string'],
                'name' => ['required', 'string', 'max:191'],
                'capacity' => ['required', 'integer', 'min:1'],
            ]),
            'schedules' => $request->validate([
                'classId' => ['required', 'string'],
                'dayOfWeek' => ['required', 'integer', 'between:1,7'],
                'startTime' => ['required', 'string', 'max:20'],
                'endTime' => ['required', 'string', 'max:20'],
                'room' => ['required', 'string', 'max:191'],
            ]),
            'lecturers' => $request->validate([
                'classId' => ['required', 'string'],
                'lecturerId' => ['required', 'string'],
                'isPrimary' => ['nullable'],
            ]) + ['isPrimary' => $request->boolean('isPrimary')],
            'students' => $request->validate([
                'classId' => ['required', 'string'],
                'studentId' => ['required', 'string'],
            ]),
            'meetings' => $request->validate([
                'classId' => ['required', 'string'],
                'meetingNo' => ['required', 'integer', 'min:1'],
                'meetingDate' => ['required', 'date'],
            ]),
            'attendances' => $request->validate([
                'meetingId' => ['required', 'string'],
                'classStudentId' => ['required', 'string'],
                'status' => ['required', Rule::in(['PRESENT', 'PERMIT', 'SICK', 'ABSENT'])],
            ]),
            'grades' => $request->validate([
                'classStudentId' => ['required', 'string'],
                'score' => ['required', 'numeric', 'min:0', 'max:100'],
                'letter' => ['required', 'string', 'max:5'],
                'isLocked' => ['nullable'],
            ]) + ['isLocked' => $request->boolean('isLocked')],
            default => abort(404),
        };
    }

    private function tableFor(string $resource): string
    {
        abort_unless(isset($this->resourceTables[$resource]), 404);
        return $this->resourceTables[$resource];
    }

    private function periods()
    {
        if (!$this->hasTables(['AcademicPeriod'])) return collect();

        return $this->safeGet(fn () => $this->table('AcademicPeriod')
            ->leftJoin('AcademicYear', 'AcademicPeriod.academicYearId', '=', 'AcademicYear.id')
            ->select('AcademicPeriod.*', 'AcademicYear.name as academicYearName')
            ->orderByDesc('AcademicPeriod.code')
            ->get());
    }

    private function classes()
    {
        if (!$this->hasTables(['Class'])) return collect();

        return $this->safeGet(fn () => $this->table('Class')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->leftJoin('AcademicPeriod', 'Class.periodId', '=', 'AcademicPeriod.id')
            ->leftJoin('StudyProgram', 'Class.studyProgramId', '=', 'StudyProgram.id')
            ->select('Class.*', 'Course.code as courseCode', 'Course.name as courseName', 'Course.sks', 'AcademicPeriod.name as periodName', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderByDesc('AcademicPeriod.code')
            ->orderBy('Course.code')
            ->get());
    }

    private function classLecturers()
    {
        if (!$this->hasTables(['ClassLecturer'])) return collect();

        return $this->safeGet(fn () => $this->table('ClassLecturer')
            ->leftJoin('Class', 'ClassLecturer.classId', '=', 'Class.id')
            ->leftJoin('Lecturer', 'ClassLecturer.lecturerId', '=', 'Lecturer.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('ClassLecturer.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName', 'Lecturer.nidn', 'Lecturer.name as lecturerName')
            ->orderBy('Course.code')
            ->get());
    }

    private function schedules()
    {
        if (!$this->hasTables(['ClassSchedule'])) return collect();

        return $this->safeGet(fn () => $this->table('ClassSchedule')
            ->leftJoin('Class', 'ClassSchedule.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('ClassSchedule.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('dayOfWeek')
            ->orderBy('startTime')
            ->get());
    }

    private function classStudents(int $perPage = 50)
    {
        if (!$this->hasTables(['ClassStudent'])) return collect();

        return $this->safeGet(fn () => $this->classStudentQuery()->paginate($perPage)->withQueryString());
    }

    private function classStudentOptions()
    {
        if (!$this->hasTables(['ClassStudent'])) return collect();

        return $this->safeGet(fn () => $this->classStudentQuery()->limit(1000)->get());
    }

    private function classStudentQuery()
    {
        return $this->table('ClassStudent')
            ->leftJoin('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->leftJoin('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->select('ClassStudent.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName', 'Student.nim', 'Student.name as studentName')
            ->orderBy('Course.code')
            ->orderBy('Student.nim');
    }

    private function meetings()
    {
        if (!$this->hasTables(['Meeting'])) return collect();

        return $this->safeGet(fn () => $this->table('Meeting')
            ->leftJoin('Class', 'Meeting.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Meeting.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('Meeting.meetingDate')
            ->get());
    }

    private function attendances(int $perPage = 50)
    {
        if (!$this->hasTables(['Attendance'])) return collect();

        return $this->safeGet(fn () => $this->table('Attendance')
            ->leftJoin('Meeting', 'Attendance.meetingId', '=', 'Meeting.id')
            ->leftJoin('ClassStudent', 'Attendance.classStudentId', '=', 'ClassStudent.id')
            ->leftJoin('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->leftJoin('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Attendance.*', 'Meeting.meetingNo', 'Meeting.meetingDate', 'Student.nim', 'Student.name as studentName', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('Meeting.meetingDate')
            ->paginate($perPage)->withQueryString());
    }

    private function grades(int $perPage = 50)
    {
        if (!$this->hasTables(['Grade'])) return collect();

        return $this->safeGet(fn () => $this->table('Grade')
            ->leftJoin('ClassStudent', 'Grade.classStudentId', '=', 'ClassStudent.id')
            ->leftJoin('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->leftJoin('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->leftJoin('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Grade.*', 'Student.nim', 'Student.name as studentName', 'Course.code as courseCode', 'Course.name as courseName', 'Class.name as className')
            ->orderBy('Course.code')
            ->orderBy('Student.nim')
            ->paginate($perPage)->withQueryString());
    }

    private function stats(): array
    {
        return [
            'periods' => $this->countRows('AcademicPeriod'),
            'classes' => $this->countRows('Class'),
            'students' => $this->countRows('ClassStudent'),
            'grades' => $this->countRows('Grade'),
        ];
    }

    private function rows(string $table, string $orderBy = 'id', bool $descending = false)
    {
        if (!$this->tableExists($table)) return collect();

        return $this->safeGet(function () use ($table, $orderBy, $descending) {
            $query = DB::table($table);
            return $descending ? $query->orderByDesc($orderBy)->get() : $query->orderBy($orderBy)->get();
        });
    }

    private function perPage(Request $request): int
    {
        $perPage = (int) $request->query('per_page', 50);

        return min(100, max(10, $perPage));
    }

    private function countRows(string $table): int
    {
        if (!$this->tableExists($table)) return 0;

        try {
            return DB::table($table)->count();
        } catch (\Throwable) {
            return 0;
        }
    }

    private function hasTables(array $tables): bool
    {
        foreach ($tables as $table) {
            if (!$this->tableExists($table)) return false;
        }

        return true;
    }

    private function safeGet(callable $callback)
    {
        try {
            return $callback();
        } catch (\Throwable) {
            return collect();
        }
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
