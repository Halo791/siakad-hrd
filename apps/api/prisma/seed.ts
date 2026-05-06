import { PrismaClient, StudyPlanStatus } from '@prisma/client';
import { hash } from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const university = await prisma.university.upsert({
    where: { code: 'UNIV01' },
    update: {},
    create: { code: 'UNIV01', name: 'Universitas Contoh Nusantara' }
  });

  const roles = [
    'SUPER_ADMIN','ADMIN_UNIVERSITAS','ADMIN_FAKULTAS','ADMIN_PRODI','ADMIN_AKADEMIK','ADMIN_PMB','ADMIN_KEUANGAN','DOSEN','DOSEN_PA','KAPRODI','DEKAN','MAHASISWA','ORANG_TUA','ALUMNI'
  ];

  for (const code of roles) {
    await prisma.role.upsert({ where: { code }, update: {}, create: { code, name: code.replaceAll('_', ' ') } });
  }

  const permissions = [
    ['MASTER_FACULTY', 'Master Fakultas'],
    ['MASTER_STUDY_PROGRAM', 'Master Prodi'],
    ['MASTER_PERIOD', 'Master Periode'],
    ['CURRICULUM', 'Kurikulum'],
    ['COURSE', 'Mata Kuliah'],
    ['CLASS', 'Kelas Kuliah'],
    ['KRS', 'KRS'],
    ['GRADE', 'Nilai'],
    ['KHS', 'KHS'],
    ['TRANSCRIPT', 'Transkrip'],
    ['DOCUMENT', 'Dokumen Akademik'],
    ['SETTING_PRODI', 'Setting Prodi']
  ] as const;

  for (const [code, name] of permissions) {
    await prisma.permission.upsert({ where: { code }, update: {}, create: { code, name } });
  }

  const roleMap = new Map((await prisma.role.findMany()).map((r) => [r.code, r]));
  const superAdminRole = roleMap.get('SUPER_ADMIN')!;
  const dosenRole = roleMap.get('DOSEN')!;
  const mahasiswaRole = roleMap.get('MAHASISWA')!;

  const allPermissions = await prisma.permission.findMany({ orderBy: { code: 'asc' } });
  const fullTrue = {
    canRead: true,
    canInsert: true,
    canUpdate: true,
    canDelete: true,
    canValidate: true,
    canApprove: true,
    canReject: true,
    canPrint: true,
    canExport: true,
    canImport: true,
    canGenerate: true,
    canLock: true,
    canUnlock: true
  };

  for (const permission of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: superAdminRole.id, permissionId: permission.id } },
      update: {},
      create: {
        roleId: superAdminRole.id,
        permissionId: permission.id,
        ...fullTrue
      }
    });
  }

  const grantByRole: Record<string, string[]> = {
    ADMIN_UNIVERSITAS: ['MASTER_FACULTY', 'MASTER_STUDY_PROGRAM', 'MASTER_PERIOD', 'SETTING_PRODI'],
    ADMIN_FAKULTAS: ['MASTER_STUDY_PROGRAM', 'MASTER_PERIOD', 'SETTING_PRODI'],
    ADMIN_PRODI: ['CURRICULUM', 'COURSE', 'CLASS', 'SETTING_PRODI', 'KRS'],
    ADMIN_AKADEMIK: ['KRS', 'GRADE', 'KHS', 'TRANSCRIPT', 'SETTING_PRODI'],
    ADMIN_PMB: ['DOCUMENT'],
    ADMIN_KEUANGAN: ['MASTER_PERIOD'],
    DOSEN: ['GRADE', 'KRS'],
    DOSEN_PA: ['KRS'],
    KAPRODI: ['KRS', 'CURRICULUM', 'CLASS'],
    DEKAN: ['KRS', 'KHS', 'TRANSCRIPT'],
    MAHASISWA: ['DOCUMENT'],
    ORANG_TUA: ['TRANSCRIPT'],
    ALUMNI: ['TRANSCRIPT']
  };

  for (const [roleCode, allowedPerms] of Object.entries(grantByRole)) {
    const role = roleMap.get(roleCode);
    if (!role) continue;
    for (const permission of allPermissions.filter((p) => allowedPerms.includes(p.code))) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: {
          roleId: role.id,
          permissionId: permission.id,
          ...fullTrue
        }
      });
    }
  }

  const passwordHash = await hash('Admin@12345', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@siakad.local' },
    update: {},
    create: {
      universityId: university.id,
      roleId: superAdminRole.id,
      name: 'Super Admin',
      email: 'superadmin@siakad.local',
      passwordHash
    }
  });

  const dosenUser = await prisma.user.upsert({
    where: { email: 'dosen1@siakad.local' },
    update: {},
    create: {
      universityId: university.id,
      roleId: dosenRole.id,
      name: 'Dosen Satu',
      email: 'dosen1@siakad.local',
      passwordHash
    }
  });

  const mahasiswaUser = await prisma.user.upsert({
    where: { email: 'mhs1@siakad.local' },
    update: {},
    create: {
      universityId: university.id,
      roleId: mahasiswaRole.id,
      name: 'Mahasiswa Satu',
      email: 'mhs1@siakad.local',
      passwordHash
    }
  });
  const mahasiswa2User = await prisma.user.upsert({
    where: { email: 'mhs2@siakad.local' },
    update: {},
    create: {
      universityId: university.id,
      roleId: mahasiswaRole.id,
      name: 'Mahasiswa Dua',
      email: 'mhs2@siakad.local',
      passwordHash
    }
  });

  await prisma.userRole.upsert({
    where: { userId_roleId: { userId: dosenUser.id, roleId: roleMap.get('DOSEN_PA')!.id } },
    update: {},
    create: { userId: dosenUser.id, roleId: roleMap.get('DOSEN_PA')!.id }
  });

  const faculty = await prisma.faculty.upsert({
    where: { universityId_code: { universityId: university.id, code: 'FTI' } },
    update: {
      accreditation: 'Baik Sekali',
      leaderName: 'Dr. Rina Puspitasari, M.Kom.',
      leaderPhone: '0812-1100-2200'
    },
    create: {
      universityId: university.id,
      code: 'FTI',
      name: 'Fakultas Teknologi Informasi',
      accreditation: 'Baik Sekali',
      leaderName: 'Dr. Rina Puspitasari, M.Kom.',
      leaderPhone: '0812-1100-2200'
    }
  });

  const degreeLevelS1 = await prisma.degreeLevelRef.upsert({
    where: { code: 'S1' },
    update: { name: 'Sarjana (S1)' },
    create: { code: 'S1', name: 'Sarjana (S1)' }
  });

  const prodi = await prisma.studyProgram.upsert({
    where: { facultyId_code: { facultyId: faculty.id, code: 'IF' } },
    update: { degreeLevel: 'S1', degreeLevelId: degreeLevelS1.id },
    create: {
      facultyId: faculty.id,
      code: 'IF',
      name: 'Informatika',
      degreeLevel: 'S1',
      degreeLevelId: degreeLevelS1.id
    }
  });

  const year = await prisma.academicYear.upsert({
    where: { code: '2026/2027' },
    update: {},
    create: { code: '2026/2027', name: 'Tahun Ajaran 2026/2027' }
  });

  const period = await prisma.academicPeriod.upsert({
    where: { code: '2026-GANJIL' },
    update: {},
    create: {
      academicYearId: year.id,
      code: '2026-GANJIL',
      name: 'Ganjil 2026/2027',
      startDate: new Date('2026-08-01'),
      endDate: new Date('2026-12-31'),
      isActive: true
    }
  });

  const lecturer = await prisma.lecturer.upsert({
    where: { userId: dosenUser.id },
    update: { studyProgramId: prodi.id },
    create: { userId: dosenUser.id, studyProgramId: prodi.id, nidn: '00112233', name: 'Dosen Satu' }
  });

  const student = await prisma.student.upsert({
    where: { userId: mahasiswaUser.id },
    update: { currentSemester: 1 },
    create: {
      userId: mahasiswaUser.id,
      studyProgramId: prodi.id,
      nim: '20260001',
      name: 'Mahasiswa Satu',
      status: 'AKTIF',
      currentSemester: 1
    }
  });
  const student2 = await prisma.student.upsert({
    where: { userId: mahasiswa2User.id },
    update: { currentSemester: 3 },
    create: {
      userId: mahasiswa2User.id,
      studyProgramId: prodi.id,
      nim: '20260002',
      name: 'Mahasiswa Dua',
      status: 'AKTIF',
      currentSemester: 3
    }
  });

  const courseAlgo = await prisma.course.upsert({
    where: { code: 'IF101' },
    update: {},
    create: { code: 'IF101', name: 'Algoritma dan Pemrograman', sks: 3, minPassingGrade: 'C', isMandatory: true }
  });

  const courseStruktur = await prisma.course.upsert({
    where: { code: 'IF102' },
    update: {},
    create: { code: 'IF102', name: 'Struktur Data', sks: 3, minPassingGrade: 'C', isMandatory: true }
  });
  const courseBasis = await prisma.course.upsert({
    where: { code: 'IF103' },
    update: {},
    create: { code: 'IF103', name: 'Basis Data', sks: 3, minPassingGrade: 'C', isMandatory: true }
  });

  const curriculum = await prisma.curriculum.findFirst({ where: { studyProgramId: prodi.id, year: 2026 } })
    ?? await prisma.curriculum.create({ data: { studyProgramId: prodi.id, year: 2026, name: 'Kurikulum 2026' } });

  await prisma.curriculumCourse.upsert({
    where: { curriculumId_courseId: { curriculumId: curriculum.id, courseId: courseAlgo.id } },
    update: {},
    create: { curriculumId: curriculum.id, courseId: courseAlgo.id, semester: 1 }
  });
  await prisma.curriculumCourse.upsert({
    where: { curriculumId_courseId: { curriculumId: curriculum.id, courseId: courseBasis.id } },
    update: {},
    create: { curriculumId: curriculum.id, courseId: courseBasis.id, semester: 1 }
  });

  await prisma.curriculumCourse.upsert({
    where: { curriculumId_courseId: { curriculumId: curriculum.id, courseId: courseStruktur.id } },
    update: {},
    create: { curriculumId: curriculum.id, courseId: courseStruktur.id, semester: 2 }
  });

  const existingPrereq = await prisma.coursePrerequisite.findFirst({
    where: { courseId: courseStruktur.id, prerequisiteCourseId: courseAlgo.id }
  });
  if (!existingPrereq) {
    await prisma.coursePrerequisite.create({
      data: { courseId: courseStruktur.id, prerequisiteCourseId: courseAlgo.id }
    });
  }

  const classAlgo = await prisma.class.upsert({
    where: { id: 'cls_algo_2026_ganjil' },
    update: {},
    create: {
      id: 'cls_algo_2026_ganjil',
      studyProgramId: prodi.id,
      courseId: courseAlgo.id,
      periodId: period.id,
      name: 'A',
      capacity: 40
    }
  });

  const classStruktur = await prisma.class.upsert({
    where: { id: 'cls_struktur_2026_ganjil' },
    update: {},
    create: {
      id: 'cls_struktur_2026_ganjil',
      studyProgramId: prodi.id,
      courseId: courseStruktur.id,
      periodId: period.id,
      name: 'A',
      capacity: 40
    }
  });
  const classBasis = await prisma.class.upsert({
    where: { id: 'cls_basis_2026_ganjil' },
    update: {},
    create: {
      id: 'cls_basis_2026_ganjil',
      studyProgramId: prodi.id,
      courseId: courseBasis.id,
      periodId: period.id,
      name: 'A',
      capacity: 40
    }
  });

  await prisma.classSchedule.deleteMany({ where: { classId: { in: [classAlgo.id, classStruktur.id, classBasis.id] } } });
  await prisma.classSchedule.createMany({
    data: [
      { classId: classAlgo.id, dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'R101' },
      { classId: classStruktur.id, dayOfWeek: 3, startTime: '08:00', endTime: '10:00', room: 'R102' },
      { classId: classBasis.id, dayOfWeek: 1, startTime: '08:00', endTime: '10:00', room: 'R103' }
    ]
  });

  await prisma.classLecturer.upsert({
    where: { id: 'cl_lect_algo' },
    update: {},
    create: { id: 'cl_lect_algo', classId: classAlgo.id, lecturerId: lecturer.id, isPrimary: true }
  });
  await prisma.classLecturer.upsert({
    where: { id: 'cl_lect_basis' },
    update: {},
    create: { id: 'cl_lect_basis', classId: classBasis.id, lecturerId: lecturer.id, isPrimary: true }
  });

  await prisma.classLecturer.upsert({
    where: { id: 'cl_lect_struktur' },
    update: {},
    create: { id: 'cl_lect_struktur', classId: classStruktur.id, lecturerId: lecturer.id, isPrimary: true }
  });

  const classStudentAlgo = await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: classAlgo.id, studentId: student.id } },
    update: {},
    create: { classId: classAlgo.id, studentId: student.id }
  });

  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: classStruktur.id, studentId: student.id } },
    update: {},
    create: { classId: classStruktur.id, studentId: student.id }
  });
  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: classStruktur.id, studentId: student2.id } },
    update: {},
    create: { classId: classStruktur.id, studentId: student2.id }
  });
  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: classAlgo.id, studentId: student2.id } },
    update: {},
    create: { classId: classAlgo.id, studentId: student2.id }
  });
  await prisma.classStudent.upsert({
    where: { classId_studentId: { classId: classBasis.id, studentId: student2.id } },
    update: {},
    create: { classId: classBasis.id, studentId: student2.id }
  });

  const studyPlan = await prisma.studyPlan.upsert({
    where: { id: 'krs_mhs1_2026_ganjil' },
    update: { status: StudyPlanStatus.DRAFT },
    create: { id: 'krs_mhs1_2026_ganjil', studentId: student.id, periodId: period.id, status: StudyPlanStatus.DRAFT }
  });

  await prisma.studyPlanItem.upsert({
    where: { id: 'krs_item_algo' },
    update: {},
    create: { id: 'krs_item_algo', studyPlanId: studyPlan.id, classId: classAlgo.id }
  });

  await prisma.studyProgramSetting.upsert({
    where: { studyProgramId_periodId: { studyProgramId: prodi.id, periodId: period.id } },
    update: {
      openKrs: true,
      openKrsValidation: true,
      openPrintKrs: true,
      openPrintUts: true,
      openPrintUas: true,
      krsStartDate: new Date('2026-01-01'),
      krsEndDate: new Date('2026-12-31'),
      minAttendanceUts: 75,
      minAttendanceUas: 75,
      totalMeetings: 16,
      allowLecturerGenerate: true,
      allowLecturerEditGrade: false
    },
    create: {
      studyProgramId: prodi.id,
      periodId: period.id,
      openKrs: true,
      openKrsValidation: true,
      openPrintKrs: true,
      openPrintUts: true,
      openPrintUas: true,
      krsStartDate: new Date('2026-01-01'),
      krsEndDate: new Date('2026-12-31'),
      minAttendanceUts: 75,
      minAttendanceUas: 75,
      totalMeetings: 16,
      allowLecturerGenerate: true,
      allowLecturerEditGrade: false
    }
  });

  const studySystemReguler = await prisma.studySystemRef.upsert({
    where: { code: 'REG' },
    update: {},
    create: { code: 'REG', name: 'Reguler' }
  });
  const studentClassA = await prisma.studentClassRef.upsert({
    where: { code: 'A' },
    update: {},
    create: { code: 'A', name: 'Kelas A' }
  });
  const studentStatusAktif = await prisma.studentStatusRef.upsert({
    where: { code: 'AKTIF' },
    update: {},
    create: { code: 'AKTIF', name: 'Aktif' }
  });

  await prisma.student.update({
    where: { id: student.id },
    data: {
      studySystemId: studySystemReguler.id,
      studentClassId: studentClassA.id,
      studentStatusId: studentStatusAktif.id
    }
  });

  await prisma.studentParent.upsert({
    where: { id: 'parent_mhs1' },
    update: { name: 'Orang Tua Mhs 1', relation: 'Ayah', phone: '081200000001' },
    create: { id: 'parent_mhs1', studentId: student.id, name: 'Orang Tua Mhs 1', relation: 'Ayah', phone: '081200000001' }
  });
  const studyPlanPrereqFail = await prisma.studyPlan.upsert({
    where: { id: 'krs_mhs2_prereq_fail' },
    update: { status: StudyPlanStatus.DRAFT },
    create: { id: 'krs_mhs2_prereq_fail', studentId: student2.id, periodId: period.id, status: StudyPlanStatus.DRAFT }
  });
  await prisma.studyPlanItem.upsert({
    where: { id: 'krs_item_mhs2_struktur' },
    update: {},
    create: { id: 'krs_item_mhs2_struktur', studyPlanId: studyPlanPrereqFail.id, classId: classStruktur.id }
  });

  const studyPlanConflict = await prisma.studyPlan.upsert({
    where: { id: 'krs_mhs2_conflict' },
    update: { status: StudyPlanStatus.DRAFT },
    create: { id: 'krs_mhs2_conflict', studentId: student2.id, periodId: period.id, status: StudyPlanStatus.DRAFT }
  });
  await prisma.studyPlanItem.upsert({
    where: { id: 'krs_item_mhs2_algo' },
    update: {},
    create: { id: 'krs_item_mhs2_algo', studyPlanId: studyPlanConflict.id, classId: classAlgo.id }
  });
  await prisma.studyPlanItem.upsert({
    where: { id: 'krs_item_mhs2_basis' },
    update: {},
    create: { id: 'krs_item_mhs2_basis', studyPlanId: studyPlanConflict.id, classId: classBasis.id }
  });

  const gradeAlgo = await prisma.grade.upsert({
    where: { id: 'grade_algo_mhs1' },
    update: { score: 85, letter: 'A', isLocked: true },
    create: { id: 'grade_algo_mhs1', classStudentId: classStudentAlgo.id, score: 85, letter: 'A', isLocked: true }
  });

  await prisma.transcript.upsert({
    where: { id: 'transcript_mhs1' },
    update: { studentId: student.id, gpa: 3.4, totalSks: 3 },
    create: { id: 'transcript_mhs1', studentId: student.id, gpa: 3.4, totalSks: 3 }
  });

  console.log('Seed siap:', {
    superAdmin: superAdmin.email,
    dosen: dosenUser.email,
    mahasiswa: mahasiswaUser.email,
    mahasiswa2: mahasiswa2User.email,
    sampleStudyPlanId: studyPlan.id,
    samplePrereqFailStudyPlanId: studyPlanPrereqFail.id,
    sampleConflictStudyPlanId: studyPlanConflict.id,
    sampleClassStrukturId: classStruktur.id,
    sampleGradeId: gradeAlgo.id,
    samplePeriodId: period.id,
    sampleStudentId: student.id
  });
}

main().finally(async () => prisma.$disconnect());
