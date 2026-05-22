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
        $this->ensureAttachmentTable();

        return view('perkuliahan.data-kelas', [
            'tab' => $tab,
            'tabs' => $this->tabs,
            'academicYears' => $this->table('AcademicYear')->orderByDesc('code')->get(),
            'studyPrograms' => $this->table('StudyProgram')->orderBy('code')->get(),
            'courses' => $this->table('Course')->orderBy('code')->get(),
            'plainClasses' => $this->table('Class')->orderBy('name')->get(),
            'plainLecturers' => $this->table('Lecturer')->orderBy('name')->get(),
            'plainStudents' => $this->table('Student')->orderBy('nim')->get(),
            'plainClassStudents' => $this->table('ClassStudent')->orderBy('id')->get(),
            'plainMeetings' => $this->table('Meeting')->orderBy('meetingDate')->get(),
            'periods' => $this->periods(),
            'classes' => $this->classes(),
            'classLecturers' => $this->classLecturers(),
            'schedules' => $this->schedules(),
            'classStudents' => $this->classStudents(),
            'meetings' => $this->meetings(),
            'attendances' => $this->attendances(),
            'grades' => $this->grades(),
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
        return $this->table('AcademicPeriod')
            ->leftJoin('AcademicYear', 'AcademicPeriod.academicYearId', '=', 'AcademicYear.id')
            ->select('AcademicPeriod.*', 'AcademicYear.name as academicYearName')
            ->orderByDesc('AcademicPeriod.code')
            ->get();
    }

    private function classes()
    {
        return $this->table('Class')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->join('AcademicPeriod', 'Class.periodId', '=', 'AcademicPeriod.id')
            ->leftJoin('StudyProgram', 'Class.studyProgramId', '=', 'StudyProgram.id')
            ->select('Class.*', 'Course.code as courseCode', 'Course.name as courseName', 'Course.sks', 'AcademicPeriod.name as periodName', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderByDesc('AcademicPeriod.code')
            ->orderBy('Course.code')
            ->get();
    }

    private function classLecturers()
    {
        return $this->table('ClassLecturer')
            ->join('Class', 'ClassLecturer.classId', '=', 'Class.id')
            ->join('Lecturer', 'ClassLecturer.lecturerId', '=', 'Lecturer.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->select('ClassLecturer.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName', 'Lecturer.nidn', 'Lecturer.name as lecturerName')
            ->orderBy('Course.code')
            ->get();
    }

    private function schedules()
    {
        return $this->table('ClassSchedule')
            ->join('Class', 'ClassSchedule.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->select('ClassSchedule.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('dayOfWeek')
            ->orderBy('startTime')
            ->get();
    }

    private function classStudents()
    {
        return $this->table('ClassStudent')
            ->join('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->join('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->select('ClassStudent.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName', 'Student.nim', 'Student.name as studentName')
            ->orderBy('Course.code')
            ->orderBy('Student.nim')
            ->get();
    }

    private function meetings()
    {
        return $this->table('Meeting')
            ->join('Class', 'Meeting.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Meeting.*', 'Class.name as className', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('Meeting.meetingDate')
            ->get();
    }

    private function attendances()
    {
        return $this->table('Attendance')
            ->join('Meeting', 'Attendance.meetingId', '=', 'Meeting.id')
            ->join('ClassStudent', 'Attendance.classStudentId', '=', 'ClassStudent.id')
            ->join('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->join('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Attendance.*', 'Meeting.meetingNo', 'Meeting.meetingDate', 'Student.nim', 'Student.name as studentName', 'Course.code as courseCode', 'Course.name as courseName')
            ->orderBy('Meeting.meetingDate')
            ->get();
    }

    private function grades()
    {
        return $this->table('Grade')
            ->join('ClassStudent', 'Grade.classStudentId', '=', 'ClassStudent.id')
            ->join('Student', 'ClassStudent.studentId', '=', 'Student.id')
            ->join('Class', 'ClassStudent.classId', '=', 'Class.id')
            ->join('Course', 'Class.courseId', '=', 'Course.id')
            ->select('Grade.*', 'Student.nim', 'Student.name as studentName', 'Course.code as courseCode', 'Course.name as courseName', 'Class.name as className')
            ->orderBy('Course.code')
            ->orderBy('Student.nim')
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
            'periods' => $this->table('AcademicPeriod')->count(),
            'classes' => $this->table('Class')->count(),
            'students' => $this->table('ClassStudent')->count(),
            'grades' => $this->table('Grade')->count(),
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
