<?php

declare(strict_types=1);

/**
 * Generate a large demo dataset for cPanel/phpMyAdmin imports.
 *
 * Usage:
 *   php database/generate_demo_1000.php
 *
 * Output:
 *   database/siakad_demo_1000.sql
 */

$outputPath = __DIR__.'/siakad_demo_1000.sql';
$handle = fopen($outputPath, 'wb');

if ($handle === false) {
    fwrite(STDERR, "Cannot write {$outputPath}\n");
    exit(1);
}

$passwordHash = '$2b$10$YFng/Qczy49DvFtgqtdHK.fWudTBEZMiYrBnL5.ifWeq2Th7UvdI.';
$now = '2026-05-22 00:00:00.000';
$studentCount = 1000;
$lecturerCount = 120;

$faculties = [
    ['faculty_fti', 'univ01', 'FTI', 'Fakultas Teknologi Informasi', 'Baik Sekali', 'Dr. Rina Puspitasari, M.Kom.', '0812-1100-2200'],
    ['faculty_feb', 'univ01', 'FEB', 'Fakultas Ekonomi dan Bisnis', 'Baik Sekali', 'Dr. Bima Prasetyo, M.M.', '0812-1100-3300'],
    ['faculty_fkip', 'univ01', 'FKIP', 'Fakultas Keguruan dan Ilmu Pendidikan', 'Baik', 'Dr. Sari Wulandari, M.Pd.', '0812-1100-4400'],
];

$programs = [
    ['prodi_if', 'faculty_fti', 'IF', 'Informatika', 'S1', 'degree_s1'],
    ['prodi_si', 'faculty_fti', 'SI', 'Sistem Informasi', 'S1', 'degree_s1'],
    ['prodi_ti', 'faculty_fti', 'TI', 'Teknologi Informasi', 'S1', 'degree_s1'],
    ['prodi_mi', 'faculty_fti', 'MI', 'Manajemen Informatika', 'D3', 'degree_d3'],
    ['prodi_ak', 'faculty_feb', 'AK', 'Akuntansi', 'S1', 'degree_s1'],
    ['prodi_mn', 'faculty_feb', 'MN', 'Manajemen', 'S1', 'degree_s1'],
];

$studentClasses = [
    ['student_class_a', 'A', 'Kelas A'],
    ['student_class_b', 'B', 'Kelas B'],
    ['student_class_c', 'C', 'Kelas C'],
    ['student_class_d', 'D', 'Kelas D'],
];

$statuses = [
    ['student_status_aktif', 'AKTIF', 'Aktif'],
    ['student_status_cuti', 'CUTI', 'Cuti'],
    ['student_status_lulus', 'LULUS', 'Lulus'],
];

$courseNames = [
    'Pengantar Teknologi Informasi',
    'Algoritma dan Pemrograman',
    'Basis Data',
    'Struktur Data',
    'Pemrograman Web',
    'Sistem Operasi',
    'Jaringan Komputer',
    'Rekayasa Perangkat Lunak',
    'Analisis dan Desain Sistem',
    'Keamanan Informasi',
    'Kecerdasan Buatan',
    'Manajemen Proyek',
];

$firstNames = [
    'Aditya', 'Bagas', 'Citra', 'Dewi', 'Eka', 'Farhan', 'Gita', 'Hana', 'Indra', 'Joko',
    'Kartika', 'Lukman', 'Maya', 'Nadia', 'Oki', 'Putri', 'Qori', 'Rafi', 'Sinta', 'Taufik',
    'Ulfa', 'Vina', 'Wahyu', 'Yuda', 'Zahra',
];

$lastNames = [
    'Pratama', 'Saputra', 'Lestari', 'Wijaya', 'Kurniawan', 'Hidayat', 'Permata', 'Nugroho',
    'Ramadhan', 'Puspita', 'Maulana', 'Rahmawati', 'Santoso', 'Anggraini', 'Firmansyah',
    'Wibowo', 'Salsabila', 'Utami', 'Fauzi', 'Hermawan',
];

$locations = [
    ['Jakarta', 'DKI Jakarta'],
    ['Bandung', 'Jawa Barat'],
    ['Surabaya', 'Jawa Timur'],
    ['Yogyakarta', 'DI Yogyakarta'],
    ['Semarang', 'Jawa Tengah'],
    ['Malang', 'Jawa Timur'],
];

$villages = ['Sukamaju', 'Cempaka', 'Mekarsari', 'Karangjati', 'Tegalrejo'];
$districts = ['Kecamatan Utara', 'Kecamatan Selatan', 'Kecamatan Barat', 'Kecamatan Timur', 'Kecamatan Tengah'];
$entryPaths = ['Reguler', 'Transfer', 'Mandiri', 'Beasiswa'];
$bloodTypes = ['A', 'B', 'O', 'AB'];
$jacketSizes = ['S', 'M', 'L', 'XL'];
$transportations = ['Sepeda Motor', 'Transportasi Umum', 'Jalan Kaki', 'Mobil Pribadi'];
$residenceTypes = ['Bersama Orang Tua', 'Kos', 'Asrama', 'Kontrak'];

function sqlValue(mixed $value): string
{
    if ($value === null) {
        return 'NULL';
    }

    if (is_bool($value)) {
        return $value ? '1' : '0';
    }

    if (is_int($value) || is_float($value)) {
        return (string) $value;
    }

    return "'".str_replace("'", "''", (string) $value)."'";
}

function writeLine($handle, string $line = ''): void
{
    fwrite($handle, $line.PHP_EOL);
}

function insertRows($handle, string $table, array $columns, array $rows, array $updateColumns = [], int $chunkSize = 250): void
{
    if ($rows === []) {
        return;
    }

    $quotedColumns = array_map(fn (string $column): string => "`{$column}`", $columns);
    $updateColumns = $updateColumns ?: array_values(array_filter($columns, fn (string $column): bool => $column !== 'id'));

    foreach (array_chunk($rows, $chunkSize) as $chunk) {
        writeLine($handle, 'INSERT INTO `'.$table.'` ('.implode(', ', $quotedColumns).') VALUES');
        $values = [];

        foreach ($chunk as $row) {
            $values[] = '('.implode(', ', array_map('sqlValue', $row)).')';
        }

        writeLine($handle, implode(','.PHP_EOL, $values));

        if ($updateColumns !== []) {
            $updates = array_map(fn (string $column): string => "`{$column}` = VALUES(`{$column}`)", $updateColumns);
            writeLine($handle, 'ON DUPLICATE KEY UPDATE '.implode(', ', $updates).';');
        } else {
            writeLine($handle, ';');
        }

        writeLine($handle);
    }
}

function padded(int $number, int $length = 4): string
{
    return str_pad((string) $number, $length, '0', STR_PAD_LEFT);
}

function personName(array $firstNames, array $lastNames, int $number, string $prefix = ''): string
{
    $first = $firstNames[($number - 1) % count($firstNames)];
    $last = $lastNames[(int) floor(($number - 1) / count($firstNames)) % count($lastNames)];

    return trim($prefix.' '.$first.' '.$last.' '.padded($number, 4));
}

function gradeLetter(float $score): string
{
    return match (true) {
        $score >= 85 => 'A',
        $score >= 80 => 'A-',
        $score >= 75 => 'B+',
        $score >= 70 => 'B',
        $score >= 65 => 'B-',
        $score >= 60 => 'C',
        default => 'D',
    };
}

writeLine($handle, '-- SIAKAD demo bulk data for cPanel/phpMyAdmin.');
writeLine($handle, '-- Generated by database/generate_demo_1000.php.');
writeLine($handle, '-- Contains: 1000 mahasiswa, 120 dosen, courses, classes, KRS, grades, finance, MBKM, and related rows.');
writeLine($handle, '-- Demo password for generated users: Admin@12345');
writeLine($handle);
writeLine($handle, 'SET NAMES utf8mb4;');
writeLine($handle, 'SET FOREIGN_KEY_CHECKS = 0;');
writeLine($handle, 'START TRANSACTION;');
writeLine($handle);

insertRows($handle, 'University', ['id', 'code', 'name'], [
    ['univ01', 'UNIV01', 'Universitas Contoh Nusantara'],
], ['code', 'name']);

insertRows($handle, 'Role', ['id', 'code', 'name'], [
    ['role_super_admin', 'SUPER_ADMIN', 'Super Admin'],
    ['role_admin_universitas', 'ADMIN_UNIVERSITAS', 'Admin Universitas'],
    ['role_admin_fakultas', 'ADMIN_FAKULTAS', 'Admin Fakultas'],
    ['role_admin_prodi', 'ADMIN_PRODI', 'Admin Prodi'],
    ['role_admin_akademik', 'ADMIN_AKADEMIK', 'Admin Akademik'],
    ['role_admin_pmb', 'ADMIN_PMB', 'Admin PMB'],
    ['role_admin_keuangan', 'ADMIN_KEUANGAN', 'Admin Keuangan'],
    ['role_dosen', 'DOSEN', 'Dosen'],
    ['role_dosen_pa', 'DOSEN_PA', 'Dosen Pembimbing Akademik'],
    ['role_kaprodi', 'KAPRODI', 'Kaprodi'],
    ['role_dekan', 'DEKAN', 'Dekan'],
    ['role_mahasiswa', 'MAHASISWA', 'Mahasiswa'],
    ['role_orang_tua', 'ORANG_TUA', 'Orang Tua'],
    ['role_alumni', 'ALUMNI', 'Alumni'],
], ['code', 'name']);

insertRows($handle, 'DegreeLevelRef', ['id', 'code', 'name'], [
    ['degree_s1', 'S1', 'Sarjana (S1)'],
    ['degree_d3', 'D3', 'Diploma Tiga (D3)'],
], ['code', 'name']);

insertRows($handle, 'Faculty', ['id', 'universityId', 'code', 'name', 'accreditation', 'leaderName', 'leaderPhone'], $faculties, ['universityId', 'code', 'name', 'accreditation', 'leaderName', 'leaderPhone']);
insertRows($handle, 'StudyProgram', ['id', 'facultyId', 'code', 'name', 'degreeLevel', 'degreeLevelId'], $programs, ['facultyId', 'code', 'name', 'degreeLevel', 'degreeLevelId']);

insertRows($handle, 'AcademicYear', ['id', 'code', 'name'], [
    ['year_2026_2027', '2026/2027', 'Tahun Ajaran 2026/2027'],
    ['year_2027_2028', '2027/2028', 'Tahun Ajaran 2027/2028'],
], ['code', 'name']);

insertRows($handle, 'AcademicPeriod', ['id', 'academicYearId', 'code', 'name', 'startDate', 'endDate', 'isActive'], [
    ['period_2026_ganjil', 'year_2026_2027', '2026-GANJIL', 'Ganjil 2026/2027', '2026-08-01 00:00:00.000', '2026-12-31 00:00:00.000', 1],
    ['period_2026_genap', 'year_2026_2027', '2026-GENAP', 'Genap 2026/2027', '2027-02-01 00:00:00.000', '2027-06-30 00:00:00.000', 0],
], ['academicYearId', 'code', 'name', 'startDate', 'endDate', 'isActive']);

insertRows($handle, 'StudySystemRef', ['id', 'code', 'name'], [
    ['study_system_reg', 'REG', 'Reguler'],
    ['study_system_kry', 'KRY', 'Karyawan'],
], ['code', 'name']);

insertRows($handle, 'StudentClassRef', ['id', 'code', 'name'], $studentClasses, ['code', 'name']);
insertRows($handle, 'StudentStatusRef', ['id', 'code', 'name'], $statuses, ['code', 'name']);

$courses = [];
$curricula = [];
$curriculumCourses = [];
$courseIdsByProgram = [];

foreach ($programs as $programIndex => $program) {
    [$programId,, $programCode, $programName] = $program;
    $curriculumId = 'demo_curriculum_'.$programCode.'_2026';
    $curricula[] = [$curriculumId, $programId, 2026, 'Kurikulum 2026 '.$programName];
    $courseIdsByProgram[$programId] = [];

    foreach ($courseNames as $courseIndex => $courseName) {
        $number = $courseIndex + 1;
        $courseId = 'demo_course_'.strtolower($programCode).'_'.padded($number, 3);
        $code = $programCode.(100 + $number);
        $courses[] = [$courseId, $code, $courseName.' '.$programCode, ($number % 4) === 0 ? 2 : 3, 'C', $number <= 10 ? 1 : 0];
        $curriculumCourses[] = ['demo_curcourse_'.strtolower($programCode).'_'.padded($number, 3), $curriculumId, $courseId, (($number - 1) % 6) + 1, $number <= 8 ? 1 : 0];
        $courseIdsByProgram[$programId][] = $courseId;
    }
}

insertRows($handle, 'Course', ['id', 'code', 'name', 'sks', 'minPassingGrade', 'isMandatory'], $courses, ['code', 'name', 'sks', 'minPassingGrade', 'isMandatory']);
insertRows($handle, 'Curriculum', ['id', 'studyProgramId', 'year', 'name'], $curricula, ['studyProgramId', 'year', 'name']);
insertRows($handle, 'CurriculumCourse', ['id', 'curriculumId', 'courseId', 'semester', 'isPackage'], $curriculumCourses, ['curriculumId', 'courseId', 'semester', 'isPackage']);

insertRows($handle, 'GradingScale', ['id', 'letter', 'minValue', 'maxValue', 'gradePoint'], [
    ['scale_a', 'A', 85, 100, 4.00],
    ['scale_a_minus', 'A-', 80, 84.99, 3.70],
    ['scale_b_plus', 'B+', 75, 79.99, 3.30],
    ['scale_b', 'B', 70, 74.99, 3.00],
    ['scale_b_minus', 'B-', 65, 69.99, 2.70],
    ['scale_c', 'C', 60, 64.99, 2.00],
    ['scale_d', 'D', 45, 59.99, 1.00],
], ['letter', 'minValue', 'maxValue', 'gradePoint']);

$users = [
    ['user_super_admin', 'univ01', 'role_super_admin', 'Super Admin', 'superadmin@siakad.local', $passwordHash, null, 'ACTIVE', $now, $now],
];
$lecturers = [];
$userRoles = [];

for ($i = 1; $i <= $lecturerCount; $i++) {
    $id = padded($i, 4);
    $name = personName($firstNames, $lastNames, $i, 'Dosen');
    $program = $programs[($i - 1) % count($programs)];
    $userId = 'demo_user_dosen_'.$id;
    $lecturerId = 'demo_lecturer_'.$id;
    $roleId = $i % 10 === 0 ? 'role_kaprodi' : 'role_dosen';
    $users[] = [$userId, 'univ01', $roleId, $name, 'dosen'.$id.'@siakad.local', $passwordHash, null, 'ACTIVE', $now, $now];
    $lecturers[] = [$lecturerId, $userId, $program[0], '09'.padded($i, 8), $name];

    if ($i % 3 === 0) {
        $userRoles[] = ['demo_userrole_dosen_pa_'.$id, $userId, 'role_dosen_pa'];
    }
}

insertRows($handle, 'User', ['id', 'universityId', 'roleId', 'name', 'email', 'passwordHash', 'refreshToken', 'status', 'createdAt', 'updatedAt'], $users, ['universityId', 'roleId', 'name', 'email', 'passwordHash', 'refreshToken', 'status', 'updatedAt']);
insertRows($handle, 'UserRole', ['id', 'userId', 'roleId'], $userRoles, ['userId', 'roleId']);
insertRows($handle, 'Lecturer', ['id', 'userId', 'studyProgramId', 'nidn', 'name'], $lecturers, ['userId', 'studyProgramId', 'nidn', 'name']);

$settings = [];
foreach ($programs as $program) {
    $settings[] = [
        'demo_setting_'.$program[2].'_ganjil',
        $program[0],
        'period_2026_ganjil',
        1,
        '2026-07-01 00:00:00.000',
        '2026-09-15 00:00:00.000',
        1,
        1,
        1,
        1,
        75,
        75,
        16,
        1,
        1,
    ];
}

insertRows($handle, 'StudyProgramSetting', [
    'id', 'studyProgramId', 'periodId', 'openKrs', 'krsStartDate', 'krsEndDate', 'openKrsValidation',
    'openPrintKrs', 'openPrintUts', 'openPrintUas', 'minAttendanceUts', 'minAttendanceUas', 'totalMeetings',
    'allowLecturerGenerate', 'allowLecturerEditGrade',
], $settings, [
    'studyProgramId', 'periodId', 'openKrs', 'krsStartDate', 'krsEndDate', 'openKrsValidation',
    'openPrintKrs', 'openPrintUts', 'openPrintUas', 'minAttendanceUts', 'minAttendanceUas', 'totalMeetings',
    'allowLecturerGenerate', 'allowLecturerEditGrade',
]);

$classes = [];
$schedules = [];
$classLecturers = [];
$meetings = [];
$gradeComponents = [];
$classIdsByProgram = [];
$day = 1;

foreach ($programs as $programIndex => $program) {
    $programId = $program[0];
    $classIdsByProgram[$programId] = [];

    foreach ($courseIdsByProgram[$programId] as $courseIndex => $courseId) {
        foreach (['A', 'B'] as $classLetter) {
            $classId = 'demo_class_'.$courseId.'_'.strtolower($classLetter);
            $lecturerNo = (($programIndex * 20 + $courseIndex * 2 + ($classLetter === 'B' ? 1 : 0)) % $lecturerCount) + 1;
            $lecturerId = 'demo_lecturer_'.padded($lecturerNo, 4);
            $startHour = 7 + (($courseIndex + ($classLetter === 'B' ? 2 : 0)) % 8);
            $start = str_pad((string) $startHour, 2, '0', STR_PAD_LEFT).':00';
            $end = str_pad((string) ($startHour + 2), 2, '0', STR_PAD_LEFT).':30';

            $classes[] = [$classId, $programId, $courseId, 'period_2026_ganjil', $classLetter, 60];
            $schedules[] = ['demo_schedule_'.$classId, $classId, $day, $start, $end, 'R'.str_pad((string) (($courseIndex % 20) + 101), 3, '0', STR_PAD_LEFT)];
            $classLecturers[] = ['demo_cl_lect_'.$classId, $classId, $lecturerId, 1];
            $gradeComponents[] = ['demo_component_tugas_'.$classId, 'Tugas', 30, $classId];
            $gradeComponents[] = ['demo_component_uts_'.$classId, 'UTS', 30, $classId];
            $gradeComponents[] = ['demo_component_uas_'.$classId, 'UAS', 40, $classId];
            $classIdsByProgram[$programId][] = $classId;

            for ($meetingNo = 1; $meetingNo <= 4; $meetingNo++) {
                $meetings[] = [
                    'demo_meeting_'.$classId.'_'.padded($meetingNo, 2),
                    $classId,
                    $meetingNo,
                    date('Y-m-d H:i:s.000', strtotime('2026-08-03 +'.(($meetingNo - 1) * 7 + $day - 1).' days')),
                ];
            }

            $day++;
            if ($day > 5) {
                $day = 1;
            }
        }
    }
}

insertRows($handle, 'Class', ['id', 'studyProgramId', 'courseId', 'periodId', 'name', 'capacity'], $classes, ['studyProgramId', 'courseId', 'periodId', 'name', 'capacity']);
insertRows($handle, 'ClassSchedule', ['id', 'classId', 'dayOfWeek', 'startTime', 'endTime', 'room'], $schedules, ['classId', 'dayOfWeek', 'startTime', 'endTime', 'room']);
insertRows($handle, 'ClassLecturer', ['id', 'classId', 'lecturerId', 'isPrimary'], $classLecturers, ['classId', 'lecturerId', 'isPrimary']);
insertRows($handle, 'Meeting', ['id', 'classId', 'meetingNo', 'meetingDate'], $meetings, ['classId', 'meetingNo', 'meetingDate']);
insertRows($handle, 'GradeComponent', ['id', 'name', 'percentage', 'classId'], $gradeComponents, ['name', 'percentage', 'classId']);

$studentUsers = [];
$students = [];
$parents = [];
$biodatas = [];
$advisors = [];
$studyPlans = [];
$studyPlanItems = [];
$classStudents = [];
$grades = [];
$attendances = [];
$transcripts = [];
$khsRows = [];
$bills = [];
$payments = [];
$virtualAccounts = [];
$activities = [];
$mbkmActivities = [];
$mbkmConversions = [];
$studentDocuments = [];

for ($i = 1; $i <= $studentCount; $i++) {
    $id = padded($i, 4);
    $name = personName($firstNames, $lastNames, $i, 'Mahasiswa');
    $program = $programs[($i - 1) % count($programs)];
    $programId = $program[0];
    $classRef = $studentClasses[($i - 1) % count($studentClasses)];
    $studentStatus = $i % 37 === 0 ? $statuses[1] : $statuses[0];
    $userId = 'demo_user_mhs_'.$id;
    $studentId = 'demo_student_'.$id;
    $studentUsers[] = [$userId, 'univ01', 'role_mahasiswa', $name, 'mhs'.$id.'@siakad.local', $passwordHash, null, 'ACTIVE', $now, $now];
    $students[] = [$studentId, $userId, $programId, $classRef[0], $studentStatus[0], $i % 9 === 0 ? 'study_system_kry' : 'study_system_reg', '2027'.$id, $name, $studentStatus[1], (($i - 1) % 8) + 1];
    $parents[] = ['demo_parent_'.$id, $studentId, 'Wali '.$name, $i % 2 === 0 ? 'Ibu' : 'Ayah', '0813'.str_pad((string) $i, 8, '0', STR_PAD_LEFT)];

    [$city, $province] = $locations[($i - 1) % count($locations)];
    $gender = $i % 2 === 0 ? 'Laki-laki' : 'Perempuan';
    $entryYear = 2027;
    $biodatas[] = [
        'demo_biodata_'.$id,
        $studentId,
        $gender,
        $city,
        date('Y-m-d', strtotime('2003-01-01 +'.($i % 1200).' days')),
        'Islam',
        'Belum Menikah',
        'Indonesia',
        '33'.str_pad((string) $i, 14, '0', STR_PAD_LEFT),
        '00'.str_pad((string) $i, 10, '0', STR_PAD_LEFT),
        '0813'.str_pad((string) $i, 8, '0', STR_PAD_LEFT),
        '0822'.str_pad((string) $i, 8, '0', STR_PAD_LEFT),
        'mhs'.$id.'@siakad.local',
        'Jl. Pendidikan No. '.(($i % 200) + 1),
        str_pad((string) (($i % 20) + 1), 2, '0', STR_PAD_LEFT),
        str_pad((string) (($i % 10) + 1), 2, '0', STR_PAD_LEFT),
        $villages[($i - 1) % count($villages)],
        $districts[($i - 1) % count($districts)],
        $city,
        $province,
        '6'.str_pad((string) ($i % 9999), 4, '0', STR_PAD_LEFT),
        'SMA Negeri '.(($i % 20) + 1).' '.$city,
        $entryYear - 1,
        $entryYear,
        $entryPaths[($i - 1) % count($entryPaths)],
        'REG-2027'.$id,
        $bloodTypes[($i - 1) % count($bloodTypes)],
        $jacketSizes[($i - 1) % count($jacketSizes)],
        $transportations[($i - 1) % count($transportations)],
        $residenceTypes[($i - 1) % count($residenceTypes)],
        $now,
        $now,
    ];

    $lecturerNo = (($i - 1) % $lecturerCount) + 1;
    $advisors[] = ['demo_advisor_'.$id, $studentId, 'demo_lecturer_'.padded($lecturerNo, 4)];

    $studyPlanId = 'demo_krs_'.$id.'_ganjil';
    $studyPlans[] = [$studyPlanId, $studentId, 'period_2026_ganjil', $i % 5 === 0 ? 'SUBMITTED' : 'APPROVED'];

    $selectedClassIds = [];
    $availableClassIds = $classIdsByProgram[$programId];
    for ($j = 0; $j < 5; $j++) {
        $classId = $availableClassIds[(($i + $j * 3) % count($availableClassIds))];
        $selectedClassIds[] = $classId;
    }

    $totalSks = 0;
    $totalPoints = 0.0;

    foreach ($selectedClassIds as $index => $classId) {
        $classStudentId = 'demo_cs_'.$id.'_'.padded($index + 1, 2);
        $score = 60 + (($i * 7 + $index * 11) % 39);
        $letter = gradeLetter((float) $score);
        $point = match ($letter) {
            'A' => 4.0,
            'A-' => 3.7,
            'B+' => 3.3,
            'B' => 3.0,
            'B-' => 2.7,
            'C' => 2.0,
            default => 1.0,
        };
        $sks = $index === 4 ? 2 : 3;
        $totalSks += $sks;
        $totalPoints += $point * $sks;

        $classStudents[] = [$classStudentId, $classId, $studentId];
        $studyPlanItems[] = ['demo_krs_item_'.$id.'_'.padded($index + 1, 2), $studyPlanId, $classId];
        $grades[] = ['demo_grade_'.$id.'_'.padded($index + 1, 2), $classStudentId, $score, $letter, 1];
        $attendances[] = ['demo_att_'.$id.'_'.padded($index + 1, 2), 'demo_meeting_'.$classId.'_01', $classStudentId, $i % 17 === 0 ? 'PERMIT' : ($i % 23 === 0 ? 'SICK' : 'PRESENT')];
    }

    $gpa = round($totalPoints / max(1, $totalSks), 2);
    $transcripts[] = ['demo_transcript_'.$id, $studentId, $gpa, $totalSks];
    $khsRows[] = ['demo_khs_'.$id.'_ganjil', $studentId, 'period_2026_ganjil', $gpa, $gpa];

    $billAmount = 2500000 + (($i % 6) * 500000);
    $billId = 'demo_bill_ukt_'.$id;
    $bills[] = [$billId, $studentId, $billAmount, 'UKT Semester Ganjil', $i % 4 === 0 ? 'UNPAID' : 'PAID', $now];
    $virtualAccounts[] = ['demo_va_'.$id, $billId, '98888'.str_pad((string) $i, 10, '0', STR_PAD_LEFT), 'BNI', $i % 4 === 0 ? 'ACTIVE' : 'PAID'];

    if ($i % 4 !== 0) {
        $payments[] = ['demo_payment_ukt_'.$id, $billId, $billAmount, '2026-08-'.str_pad((string) (($i % 20) + 1), 2, '0', STR_PAD_LEFT).' 10:00:00.000', $i % 3 === 0 ? 'VA' : 'TRANSFER', 'SUCCESS'];
    }

    if ($i % 3 === 0) {
        $activities[] = ['demo_activity_'.$id, $studentId, 'Prestasi Akademik Semester Ganjil', 'Akademik', 80 + ($i % 20), $i % 2 === 0 ? 1 : 0];
    }

    if ($i % 5 === 0) {
        $mbkmId = 'demo_mbkm_'.$id;
        $mbkmActivities[] = [$mbkmId, $studentId, $i % 2 === 0 ? 'Magang' : 'Studi Independen', $i % 2 === 0 ? 'PT Teknologi Nusantara' : 'Kampus Merdeka', (string) ((($i - 1) % 8) + 1)];
        $firstCourse = $courseIdsByProgram[$programId][0];
        $mbkmConversions[] = ['demo_mbkm_conv_'.$id, $mbkmId, $firstCourse, 85 + ($i % 10)];
    }

    if ($i % 10 === 0) {
        $studentDocuments[] = ['demo_doc_'.$id, $studentId, 'TRANSKRIP', 'transkrip_'.$id.'.pdf', '/documents/demo/transkrip_'.$id.'.pdf', 'user_super_admin', $now];
    }
}

insertRows($handle, 'User', ['id', 'universityId', 'roleId', 'name', 'email', 'passwordHash', 'refreshToken', 'status', 'createdAt', 'updatedAt'], $studentUsers, ['universityId', 'roleId', 'name', 'email', 'passwordHash', 'refreshToken', 'status', 'updatedAt']);
insertRows($handle, 'Student', ['id', 'userId', 'studyProgramId', 'studentClassId', 'studentStatusId', 'studySystemId', 'nim', 'name', 'status', 'currentSemester'], $students, ['userId', 'studyProgramId', 'studentClassId', 'studentStatusId', 'studySystemId', 'nim', 'name', 'status', 'currentSemester']);
insertRows($handle, 'StudentParent', ['id', 'studentId', 'name', 'relation', 'phone'], $parents, ['studentId', 'name', 'relation', 'phone']);
insertRows($handle, 'StudentBiodata', [
    'id', 'studentId', 'gender', 'birthPlace', 'birthDate', 'religion', 'maritalStatus', 'nationality',
    'nik', 'nisn', 'phone', 'alternatePhone', 'email', 'address', 'rt', 'rw', 'village', 'district',
    'city', 'province', 'postalCode', 'schoolOrigin', 'graduationYear', 'entryYear', 'entryPath',
    'registrationNumber', 'bloodType', 'jacketSize', 'transportation', 'residenceType', 'createdAt', 'updatedAt',
], $biodatas, [
    'studentId', 'gender', 'birthPlace', 'birthDate', 'religion', 'maritalStatus', 'nationality',
    'nik', 'nisn', 'phone', 'alternatePhone', 'email', 'address', 'rt', 'rw', 'village', 'district',
    'city', 'province', 'postalCode', 'schoolOrigin', 'graduationYear', 'entryYear', 'entryPath',
    'registrationNumber', 'bloodType', 'jacketSize', 'transportation', 'residenceType', 'updatedAt',
]);
insertRows($handle, 'AcademicAdvisor', ['id', 'studentId', 'lecturerId'], $advisors, ['studentId', 'lecturerId']);
insertRows($handle, 'StudyPlan', ['id', 'studentId', 'periodId', 'status'], $studyPlans, ['studentId', 'periodId', 'status']);
insertRows($handle, 'ClassStudent', ['id', 'classId', 'studentId'], $classStudents, ['classId', 'studentId']);
insertRows($handle, 'StudyPlanItem', ['id', 'studyPlanId', 'classId'], $studyPlanItems, ['studyPlanId', 'classId']);
insertRows($handle, 'Grade', ['id', 'classStudentId', 'score', 'letter', 'isLocked'], $grades, ['classStudentId', 'score', 'letter', 'isLocked']);
insertRows($handle, 'Attendance', ['id', 'meetingId', 'classStudentId', 'status'], $attendances, ['meetingId', 'classStudentId', 'status']);
insertRows($handle, 'Transcript', ['id', 'studentId', 'gpa', 'totalSks'], $transcripts, ['studentId', 'gpa', 'totalSks']);
insertRows($handle, 'Khs', ['id', 'studentId', 'periodId', 'ips', 'ipk'], $khsRows, ['studentId', 'periodId', 'ips', 'ipk']);
insertRows($handle, 'Bill', ['id', 'studentId', 'amount', 'type', 'status', 'createdAt'], $bills, ['studentId', 'amount', 'type', 'status', 'createdAt']);
insertRows($handle, 'VirtualAccount', ['id', 'billId', 'vaNumber', 'provider', 'status'], $virtualAccounts, ['billId', 'vaNumber', 'provider', 'status']);
insertRows($handle, 'Payment', ['id', 'billId', 'amount', 'paidAt', 'method', 'status'], $payments, ['billId', 'amount', 'paidAt', 'method', 'status']);
insertRows($handle, 'StudentActivity', ['id', 'studentId', 'name', 'category', 'score', 'isShownInSkpi'], $activities, ['studentId', 'name', 'category', 'score', 'isShownInSkpi']);
insertRows($handle, 'MbkmActivity', ['id', 'studentId', 'type', 'partner', 'semester'], $mbkmActivities, ['studentId', 'type', 'partner', 'semester']);
insertRows($handle, 'MbkmConversion', ['id', 'mbkmActivityId', 'courseId', 'convertedScore'], $mbkmConversions, ['mbkmActivityId', 'courseId', 'convertedScore']);
insertRows($handle, 'StudentDocument', ['id', 'studentId', 'category', 'fileName', 'filePath', 'uploadedBy', 'uploadedAt'], $studentDocuments, ['studentId', 'category', 'fileName', 'filePath', 'uploadedBy', 'uploadedAt']);

writeLine($handle, 'COMMIT;');
writeLine($handle, 'SET FOREIGN_KEY_CHECKS = 1;');
writeLine($handle);
writeLine($handle, '-- Summary');
writeLine($handle, '-- Students: '.$studentCount);
writeLine($handle, '-- Student biodata: '.count($biodatas));
writeLine($handle, '-- Lecturers: '.$lecturerCount);
writeLine($handle, '-- Courses: '.count($courses));
writeLine($handle, '-- Classes: '.count($classes));
writeLine($handle, '-- Class students: '.count($classStudents));
writeLine($handle, '-- Study plan items: '.count($studyPlanItems));
writeLine($handle, '-- Grades: '.count($grades));
writeLine($handle);
writeLine($handle, '-- Sample generated login:');
writeLine($handle, '--   mhs0001@siakad.local / Admin@12345');
writeLine($handle, '--   dosen0001@siakad.local / Admin@12345');

fclose($handle);

echo "Generated {$outputPath}\n";
