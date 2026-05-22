<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PortalController extends Controller
{
    private array $sections = [
        'pegawai' => ['label' => 'Pegawai', 'tabs' => ['daftar-pegawai', 'detail-pegawai', 'pembimbing', 'tanda-tangan']],
        'kegiatan' => ['label' => 'Kegiatan', 'tabs' => ['kalender-akademik', 'monitoring-kalender-akademik']],
        'orang-tua' => ['label' => 'Orang Tua', 'tabs' => ['monitoring-mahasiswa']],
        'alumni' => ['label' => 'Alumni', 'tabs' => ['profil-alumni']],
    ];

    private array $resourceTables = [
        'lecturers' => 'Lecturer',
        'advisors' => 'AcademicAdvisor',
        'periods' => 'AcademicPeriod',
        'settings' => 'StudyProgramSetting',
        'parents' => 'StudentParent',
        'alumni' => 'GraduationStudent',
    ];

    public function index(Request $request, string $section)
    {
        abort_unless(isset($this->sections[$section]), 404);
        $this->ensureAttachmentTable();

        $tabs = $this->sections[$section]['tabs'];
        $tab = in_array($request->query('tab'), $tabs, true) ? $request->query('tab') : $tabs[0];

        return view('portal.index', [
            'section' => $section,
            'sectionLabel' => $this->sections[$section]['label'],
            'tab' => $tab,
            'tabs' => $tabs,
            'users' => $this->table('User')->orderBy('name')->get(),
            'studyPrograms' => $this->table('StudyProgram')->orderBy('code')->get(),
            'students' => $this->table('Student')->orderBy('nim')->get(),
            'academicYears' => $this->table('AcademicYear')->orderByDesc('code')->get(),
            'graduationPeriods' => $this->table('GraduationPeriod')->orderByDesc('code')->get(),
            'lecturers' => $this->lecturers(),
            'selectedLecturer' => $this->selectedLecturer($request),
            'advisors' => $this->advisors(),
            'periods' => $this->academicPeriods(),
            'studyProgramSettings' => $this->studyProgramSettings(),
            'parentRows' => $this->parentRows(),
            'alumniRows' => $this->alumniRows(),
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
        $data = $request->validate(['title' => ['required', 'string', 'max:191'], 'imageUrl' => ['required', 'url', 'max:500']]);

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
            'lecturers' => $request->validate(['userId' => ['required', 'string'], 'studyProgramId' => ['nullable', 'string'], 'nidn' => ['required', 'string', 'max:191'], 'name' => ['required', 'string', 'max:191']]),
            'advisors' => $request->validate(['studentId' => ['required', 'string'], 'lecturerId' => ['required', 'string']]),
            'periods' => $request->validate(['academicYearId' => ['required', 'string'], 'code' => ['required', 'string', 'max:191'], 'name' => ['required', 'string', 'max:191'], 'startDate' => ['required', 'date'], 'endDate' => ['required', 'date'], 'isActive' => ['nullable']]) + ['isActive' => $request->boolean('isActive')],
            'settings' => $request->validate(['studyProgramId' => ['required', 'string'], 'periodId' => ['required', 'string'], 'openKrs' => ['nullable'], 'openKrsValidation' => ['nullable'], 'openPrintKrs' => ['nullable'], 'openPrintUts' => ['nullable'], 'openPrintUas' => ['nullable'], 'minAttendanceUts' => ['required', 'numeric'], 'minAttendanceUas' => ['required', 'numeric'], 'totalMeetings' => ['required', 'integer'], 'allowLecturerGenerate' => ['nullable'], 'allowLecturerEditGrade' => ['nullable']]) + [
                'openKrs' => $request->boolean('openKrs'), 'openKrsValidation' => $request->boolean('openKrsValidation'), 'openPrintKrs' => $request->boolean('openPrintKrs'), 'openPrintUts' => $request->boolean('openPrintUts'), 'openPrintUas' => $request->boolean('openPrintUas'), 'allowLecturerGenerate' => $request->boolean('allowLecturerGenerate'), 'allowLecturerEditGrade' => $request->boolean('allowLecturerEditGrade'),
            ],
            'parents' => $request->validate(['studentId' => ['required', 'string'], 'name' => ['required', 'string', 'max:191'], 'relation' => ['required', 'string', 'max:191'], 'phone' => ['nullable', 'string', 'max:191']]),
            'alumni' => $request->validate(['graduationPeriodId' => ['required', 'string'], 'studentId' => ['required', 'string'], 'status' => ['required', 'string', 'max:191']]),
            default => abort(404),
        };
    }

    private function tableFor(string $resource): string
    {
        abort_unless(isset($this->resourceTables[$resource]), 404);
        return $this->resourceTables[$resource];
    }

    private function lecturers()
    {
        return $this->table('Lecturer')
            ->leftJoin('User', 'Lecturer.userId', '=', 'User.id')
            ->leftJoin('StudyProgram', 'Lecturer.studyProgramId', '=', 'StudyProgram.id')
            ->select('Lecturer.*', 'User.email', 'User.status as userStatus', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderBy('Lecturer.name')
            ->get();
    }

    private function selectedLecturer(Request $request)
    {
        $lecturers = $this->lecturers();
        return $request->query('lecturerId') ? ($lecturers->firstWhere('id', $request->query('lecturerId')) ?: $lecturers->first()) : $lecturers->first();
    }

    private function advisors()
    {
        return $this->table('AcademicAdvisor')
            ->join('Student', 'AcademicAdvisor.studentId', '=', 'Student.id')
            ->join('Lecturer', 'AcademicAdvisor.lecturerId', '=', 'Lecturer.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select('AcademicAdvisor.*', 'Student.nim', 'Student.name as studentName', 'Lecturer.nidn', 'Lecturer.name as lecturerName', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderBy('Lecturer.name')
            ->orderBy('Student.nim')
            ->get();
    }

    private function academicPeriods()
    {
        return $this->table('AcademicPeriod')->orderByDesc('code')->get();
    }

    private function studyProgramSettings()
    {
        return $this->table('StudyProgramSetting')
            ->join('StudyProgram', 'StudyProgramSetting.studyProgramId', '=', 'StudyProgram.id')
            ->join('AcademicPeriod', 'StudyProgramSetting.periodId', '=', 'AcademicPeriod.id')
            ->select('StudyProgramSetting.*', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName', 'AcademicPeriod.name as periodName')
            ->orderByDesc('AcademicPeriod.code')
            ->orderBy('StudyProgram.code')
            ->get();
    }

    private function parentRows()
    {
        return $this->table('StudentParent')
            ->join('Student', 'StudentParent.studentId', '=', 'Student.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select('StudentParent.*', 'Student.nim', 'Student.name as studentName', 'Student.status as studentStatus', 'Student.currentSemester', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderBy('Student.nim')
            ->get();
    }

    private function alumniRows()
    {
        return $this->table('GraduationStudent')
            ->join('Student', 'GraduationStudent.studentId', '=', 'Student.id')
            ->leftJoin('GraduationPeriod', 'GraduationStudent.graduationPeriodId', '=', 'GraduationPeriod.id')
            ->leftJoin('StudyProgram', 'Student.studyProgramId', '=', 'StudyProgram.id')
            ->select('GraduationStudent.*', 'Student.nim', 'Student.name as studentName', 'GraduationPeriod.code as graduationCode', 'GraduationPeriod.name as graduationName', 'StudyProgram.code as studyProgramCode', 'StudyProgram.name as studyProgramName')
            ->orderByDesc('GraduationPeriod.code')
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
        return ['lecturers' => $this->table('Lecturer')->count(), 'advisors' => $this->table('AcademicAdvisor')->count(), 'periods' => $this->table('AcademicPeriod')->count(), 'parents' => $this->table('StudentParent')->count(), 'alumni' => $this->table('GraduationStudent')->count()];
    }

    private function table(string $table)
    {
        if (!$this->tableExists($table)) return DB::query()->fromSub('select null as id where 1=0', $table);
        return DB::table($table);
    }

    private function ensureAttachmentTable(): bool
    {
        if ($this->tableExists('RecordAttachment')) return true;

        try {
            DB::statement("CREATE TABLE IF NOT EXISTS `RecordAttachment` (`id` VARCHAR(191) NOT NULL, `entityTable` VARCHAR(191) NOT NULL, `entityId` VARCHAR(191) NOT NULL, `title` VARCHAR(191) NOT NULL, `imageUrl` VARCHAR(500) NOT NULL, `createdAt` DATETIME NULL, PRIMARY KEY (`id`), KEY `RecordAttachment_entity_idx` (`entityTable`, `entityId`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci");
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
