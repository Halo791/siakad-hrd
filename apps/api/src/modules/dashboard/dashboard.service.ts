import { Injectable } from '@nestjs/common';
import { StudyPlanStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async adminSummary() {
    const [students, classes, submittedKrs] = await Promise.all([
      this.prisma.student.count({ where: { status: 'AKTIF' } }),
      this.prisma.class.count(),
      this.prisma.studyPlan.count({ where: { status: 'SUBMITTED' } })
    ]);
    return { students, classes, submittedKrs };
  }

  async dosenSummary() {
    const [classes, unlockedGrades, pendingKrs] = await Promise.all([
      this.prisma.classLecturer.count(),
      this.prisma.grade.count({ where: { isLocked: false } }),
      this.prisma.studyPlan.count({ where: { status: 'SUBMITTED' } })
    ]);
    return { classes, unlockedGrades, pendingKrs };
  }

  async mahasiswaSummary() {
    const student = await this.prisma.student.findFirst({ where: { nim: '20260001' } });
    if (!student) return { totalSks: 0, ips: 0, ipk: 0, docs: 0 };

    const [grades, latestKhs, transcript, docs] = await Promise.all([
      this.prisma.grade.findMany({
        where: { isLocked: true, classStudent: { studentId: student.id } },
        include: { classStudent: { include: { class: { include: { course: true } } } } }
      }),
      this.prisma.khs.findFirst({ where: { studentId: student.id }, orderBy: { period: { endDate: 'desc' } } }),
      this.prisma.transcript.findFirst({ where: { studentId: student.id } }),
      this.prisma.studentDocument.count({ where: { studentId: student.id } })
    ]);

    const totalSks = grades.reduce((a, g) => a + g.classStudent.class.course.sks, 0);
    return {
      totalSks,
      ips: latestKhs?.ips ?? 0,
      ipk: transcript?.gpa ?? 0,
      docs
    };
  }

  async mahasiswaSummaryByUser(userId: string) {
    const student = await this.prisma.student.findFirst({ where: { userId } });
    if (!student) return { totalSks: 0, ips: 0, ipk: 0, docs: 0 };

    const [grades, latestKhs, transcript, docs] = await Promise.all([
      this.prisma.grade.findMany({
        where: { isLocked: true, classStudent: { studentId: student.id } },
        include: { classStudent: { include: { class: { include: { course: true } } } } }
      }),
      this.prisma.khs.findFirst({ where: { studentId: student.id }, orderBy: { period: { endDate: 'desc' } } }),
      this.prisma.transcript.findFirst({ where: { studentId: student.id } }),
      this.prisma.studentDocument.count({ where: { studentId: student.id } })
    ]);

    const totalSks = grades.reduce((a, g) => a + g.classStudent.class.course.sks, 0);
    return { totalSks, ips: latestKhs?.ips ?? 0, ipk: transcript?.gpa ?? 0, docs };
  }

  async mahasiswaPortal(userId: string, role: string, studentId?: string) {
    const canInspectAllStudents = [
      'SUPER_ADMIN',
      'ADMIN_UNIVERSITAS',
      'ADMIN_FAKULTAS',
      'ADMIN_PRODI',
      'ADMIN_AKADEMIK'
    ].includes(role);
    const selectedStudent = canInspectAllStudents && studentId
      ? await this.prisma.student.findUnique({ where: { id: studentId }, select: { id: true } })
      : null;
    const fallbackStudent = canInspectAllStudents
      ? await this.prisma.student.findFirst({ orderBy: { nim: 'asc' }, select: { id: true } })
      : null;
    const where = canInspectAllStudents
      ? { id: selectedStudent?.id ?? fallbackStudent?.id ?? '' }
      : { userId };

    const student = await this.prisma.student.findFirst({
      where,
      include: {
        user: { include: { role: true, userRoles: { include: { role: true } } } },
        studyProgram: { include: { faculty: true, degreeLevelRef: true } },
        studentClass: true,
        studentStatus: true,
        studySystem: true,
        parents: true,
        studyPlans: {
          include: {
            period: true,
            items: { include: { class: { include: { course: true, schedules: true } } } }
          },
          orderBy: { period: { endDate: 'desc' } }
        },
        classStudents: {
          include: {
            grades: true,
            attendances: true,
            class: { include: { course: true, period: true, schedules: true } }
          }
        },
        khs: { include: { period: true }, orderBy: { period: { endDate: 'desc' } } },
        transcripts: true,
        documents: true
      }
    });

    if (!student) {
      return {
        viewerRole: role,
        canInspectAllStudents,
        students: [],
        student: null,
        activePeriod: null,
        semesterStatus: null,
        khs: [],
        transcript: null,
        documents: [],
        finance: { bills: [], payments: [], virtualAccounts: [] },
        activities: [],
        mbkmActivities: []
      };
    }

    const studentOptions = canInspectAllStudents
      ? await this.prisma.student.findMany({
        select: {
          id: true,
          nim: true,
          name: true,
          currentSemester: true,
          studyProgram: { select: { code: true, name: true } }
        },
        orderBy: { nim: 'asc' }
      })
      : [];

    const activePeriod = await this.prisma.academicPeriod.findFirst({
      where: { isActive: true },
      orderBy: { endDate: 'desc' }
    });
    const activeStudyPlan = activePeriod
      ? student.studyPlans.find((plan) => plan.periodId === activePeriod.id)
      : student.studyPlans[0];
    const activeClasses = student.classStudents.filter((item) => item.class.periodId === activeStudyPlan?.periodId);
    const activeLockedGrades = activeClasses.flatMap((item) => item.grades.filter((grade) => grade.isLocked));
    const activeSks = activeStudyPlan?.items.reduce((total, item) => total + item.class.course.sks, 0) ?? 0;
    const lockedSks = activeClasses.reduce((total, item) => {
      return total + (item.grades.some((grade) => grade.isLocked) ? item.class.course.sks : 0);
    }, 0);

    const [bills, activities, rawMbkmActivities] = await Promise.all([
      this.prisma.bill.findMany({
        where: { studentId: student.id },
        orderBy: { createdAt: 'desc' }
      }),
      this.prisma.studentActivity.findMany({
        where: { studentId: student.id },
        orderBy: { name: 'asc' }
      }),
      this.prisma.mbkmActivity.findMany({
        where: { studentId: student.id },
        orderBy: { semester: 'desc' }
      })
    ]);

    const billIds = bills.map((bill) => bill.id);
    const mbkmActivityIds = rawMbkmActivities.map((activity) => activity.id);
    const [payments, virtualAccounts, rawMbkmConversions] = await Promise.all([
      billIds.length
        ? this.prisma.payment.findMany({
          where: { billId: { in: billIds } },
          orderBy: { paidAt: 'desc' }
        })
        : [],
      billIds.length
        ? this.prisma.virtualAccount.findMany({
          where: { billId: { in: billIds } }
        })
        : [],
      mbkmActivityIds.length
        ? this.prisma.mbkmConversion.findMany({
          where: { mbkmActivityId: { in: mbkmActivityIds } }
        })
        : []
    ]);
    const conversionCourseIds = [...new Set(rawMbkmConversions.map((conversion) => conversion.courseId))];
    const conversionCourses = conversionCourseIds.length
      ? await this.prisma.course.findMany({
        where: { id: { in: conversionCourseIds } },
        select: { id: true, code: true, name: true, sks: true }
      })
      : [];
    const conversionCourseMap = new Map(conversionCourses.map((course) => [course.id, course]));
    const mbkmActivities = rawMbkmActivities.map((activity) => ({
      id: activity.id,
      type: activity.type,
      partner: activity.partner,
      semester: activity.semester,
      conversions: rawMbkmConversions
        .filter((conversion) => conversion.mbkmActivityId === activity.id)
        .map((conversion) => {
          const course = conversionCourseMap.get(conversion.courseId);
          return {
            id: conversion.id,
            courseId: conversion.courseId,
            courseCode: course?.code ?? '-',
            courseName: course?.name ?? '-',
            sks: course?.sks ?? 0,
            convertedScore: conversion.convertedScore
          };
        })
    }));

    const gradesByPeriod = new Map<string, typeof student.classStudents>();
    for (const classStudent of student.classStudents) {
      if (!gradesByPeriod.has(classStudent.class.periodId)) gradesByPeriod.set(classStudent.class.periodId, []);
      gradesByPeriod.get(classStudent.class.periodId)!.push(classStudent);
    }

    const khsByPeriod = new Map(student.khs.map((item) => [item.periodId, item]));
    const khs = Array.from(gradesByPeriod.entries()).map(([periodId, classStudents]) => {
      const period = classStudents[0].class.period;
      const rows = classStudents.map((item) => {
        const grade = item.grades.find((entry) => entry.isLocked) || item.grades[0];
        return {
          classId: item.classId,
          courseCode: item.class.course.code,
          courseName: item.class.course.name,
          className: item.class.name,
          sks: item.class.course.sks,
          score: grade?.score ?? null,
          letter: grade?.letter ?? '-',
          isLocked: Boolean(grade?.isLocked)
        };
      });
      const lockedRows = rows.filter((row) => row.isLocked && row.score !== null);
      const totalSks = lockedRows.reduce((total, row) => total + row.sks, 0);
      const totalQuality = lockedRows.reduce((total, row) => total + ((row.score ?? 0) / 25) * row.sks, 0);
      const generated = khsByPeriod.get(periodId);
      return {
        periodId,
        periodCode: period.code,
        periodName: period.name,
        totalSks,
        ips: generated?.ips ?? (totalSks ? totalQuality / totalSks : 0),
        ipk: generated?.ipk ?? student.transcripts[0]?.gpa ?? 0,
        generated: Boolean(generated),
        rows
      };
    }).sort((a, b) => b.periodCode.localeCompare(a.periodCode));

    return {
      viewerRole: role,
      canInspectAllStudents,
      students: studentOptions,
      student: {
        id: student.id,
        nim: student.nim,
        name: student.name,
        status: student.status,
        currentSemester: student.currentSemester,
        email: student.user.email,
        accountStatus: student.user.status,
        roleNames: [student.user.role, ...student.user.userRoles.map((item) => item.role)].map((role) => role.name),
        studyProgram: {
          code: student.studyProgram.code,
          name: student.studyProgram.name,
          degreeLevel: student.studyProgram.degreeLevelRef?.name ?? student.studyProgram.degreeLevel,
          facultyName: student.studyProgram.faculty.name,
          facultyCode: student.studyProgram.faculty.code
        },
        studentClass: student.studentClass?.name ?? '-',
        studentStatus: student.studentStatus?.name ?? student.status,
        studySystem: student.studySystem?.name ?? '-',
        parents: student.parents.map((parent) => ({
          id: parent.id,
          name: parent.name,
          relation: parent.relation,
          phone: parent.phone
        }))
      },
      activePeriod,
      transcript: student.transcripts[0]
        ? {
          id: student.transcripts[0].id,
          gpa: student.transcripts[0].gpa,
          totalSks: student.transcripts[0].totalSks
        }
        : null,
      documents: student.documents.map((document) => ({
        id: document.id,
        category: document.category,
        fileName: document.fileName,
        filePath: document.filePath,
        uploadedAt: document.uploadedAt
      })),
      finance: {
        bills: bills.map((bill) => ({
          id: bill.id,
          amount: bill.amount,
          type: bill.type,
          status: bill.status,
          createdAt: bill.createdAt
        })),
        payments: payments.map((payment) => ({
          id: payment.id,
          billId: payment.billId,
          amount: payment.amount,
          paidAt: payment.paidAt,
          method: payment.method,
          status: payment.status
        })),
        virtualAccounts: virtualAccounts.map((account) => ({
          id: account.id,
          billId: account.billId,
          vaNumber: account.vaNumber,
          provider: account.provider,
          status: account.status
        }))
      },
      activities: activities.map((activity) => ({
        id: activity.id,
        name: activity.name,
        category: activity.category,
        score: activity.score,
        isShownInSkpi: activity.isShownInSkpi
      })),
      mbkmActivities,
      semesterStatus: {
        periodId: activeStudyPlan?.periodId ?? activePeriod?.id ?? null,
        periodName: activeStudyPlan?.period.name ?? activePeriod?.name ?? '-',
        krsStatus: activeStudyPlan?.status ?? StudyPlanStatus.DRAFT,
        krsLabel: this.studyPlanStatusLabel(activeStudyPlan?.status),
        plannedSks: activeSks,
        classCount: activeStudyPlan?.items.length ?? 0,
        gradedSks: lockedSks,
        lockedGradeCount: activeLockedGrades.length,
        documentCount: student.documents.length,
        activeClassRows: activeStudyPlan?.items.map((item) => ({
          classId: item.classId,
          courseCode: item.class.course.code,
          courseName: item.class.course.name,
          className: item.class.name,
          sks: item.class.course.sks
        })) ?? []
      },
      khs
    };
  }

  private studyPlanStatusLabel(status?: StudyPlanStatus) {
    const labels: Record<StudyPlanStatus, string> = {
      DRAFT: 'Draft',
      SUBMITTED: 'Diajukan',
      APPROVED: 'Disetujui PA',
      REJECTED: 'Ditolak',
      CANCELED: 'Dibatalkan'
    };
    return labels[status ?? StudyPlanStatus.DRAFT];
  }

  async dosenPortal(userId: string, role: string, lecturerId?: string) {
    const canInspectAllLecturers = [
      'SUPER_ADMIN',
      'ADMIN_UNIVERSITAS',
      'ADMIN_FAKULTAS',
      'ADMIN_PRODI',
      'ADMIN_AKADEMIK'
    ].includes(role);
    const selectedLecturer = canInspectAllLecturers && lecturerId
      ? await this.prisma.lecturer.findUnique({ where: { id: lecturerId }, select: { id: true } })
      : null;
    const fallbackLecturer = canInspectAllLecturers
      ? await this.prisma.lecturer.findFirst({ orderBy: { name: 'asc' }, select: { id: true } })
      : null;
    const where = canInspectAllLecturers
      ? { id: selectedLecturer?.id ?? fallbackLecturer?.id ?? '' }
      : { userId };

    const lecturer = await this.prisma.lecturer.findFirst({
      where,
      include: {
        user: { include: { role: true, userRoles: { include: { role: true } } } },
        studyProgram: { include: { faculty: true, degreeLevelRef: true } },
        structuralPositions: {
          include: { position: true, faculty: true, studyProgram: true },
          orderBy: [{ isActive: 'desc' }, { startDate: 'desc' }]
        },
        classLinks: {
          include: {
            class: {
              include: {
                course: true,
                period: true,
                schedules: true,
                students: { select: { id: true } }
              }
            }
          }
        }
      }
    });

    if (!lecturer) {
      return {
        viewerRole: role,
        canInspectAllLecturers,
        lecturers: [],
        lecturer: null,
        activePeriod: null,
        teaching: { classes: [], activeClassCount: 0, totalSks: 0, studentCount: 0 },
        advisories: { students: [], consultationCount: 0, consultations: [] },
        identity: { nidn: null, nidk: null, nupn: null, signatureStatus: 'Belum tercatat' }
      };
    }

    const [lecturerOptions, activePeriod, advisorRows, consultations] = await Promise.all([
      canInspectAllLecturers
        ? this.prisma.lecturer.findMany({
          select: {
            id: true,
            nidn: true,
            name: true,
            studyProgram: { select: { code: true, name: true } }
          },
          orderBy: { name: 'asc' }
        })
        : [],
      this.prisma.academicPeriod.findFirst({
        where: { isActive: true },
        orderBy: { endDate: 'desc' }
      }),
      this.prisma.academicAdvisor.findMany({ where: { lecturerId: lecturer.id } }),
      this.prisma.consultation.findMany({
        where: { lecturerId: lecturer.id },
        orderBy: { createdAt: 'desc' }
      })
    ]);

    const relatedStudentIds = [
      ...new Set([
        ...advisorRows.map((advisor) => advisor.studentId),
        ...consultations.map((consultation) => consultation.studentId)
      ])
    ];
    const relatedStudents = relatedStudentIds.length
      ? await this.prisma.student.findMany({
        where: { id: { in: relatedStudentIds } },
        include: {
          studyProgram: true,
          studentStatus: true
        },
        orderBy: { nim: 'asc' }
      })
      : [];
    const studentMap = new Map(relatedStudents.map((student) => [student.id, student]));

    const classes = lecturer.classLinks.map((link) => ({
      id: link.class.id,
      classLecturerId: link.id,
      isPrimary: link.isPrimary,
      name: link.class.name,
      periodCode: link.class.period.code,
      periodName: link.class.period.name,
      courseCode: link.class.course.code,
      courseName: link.class.course.name,
      sks: link.class.course.sks,
      capacity: link.class.capacity,
      participantCount: link.class.students.length,
      schedules: link.class.schedules.map((schedule) => ({
        id: schedule.id,
        dayOfWeek: schedule.dayOfWeek,
        startTime: schedule.startTime,
        endTime: schedule.endTime,
        room: schedule.room
      }))
    })).sort((a, b) => `${b.periodCode}-${b.courseCode}`.localeCompare(`${a.periodCode}-${a.courseCode}`));
    const activeClasses = activePeriod ? classes.filter((item) => item.periodCode === activePeriod.code) : classes;

    return {
      viewerRole: role,
      canInspectAllLecturers,
      lecturers: lecturerOptions.map((item) => ({
        id: item.id,
        nidn: item.nidn,
        name: item.name,
        studyProgram: item.studyProgram
          ? { code: item.studyProgram.code, name: item.studyProgram.name }
          : null
      })),
      lecturer: {
        id: lecturer.id,
        nidn: lecturer.nidn,
        name: lecturer.name,
        email: lecturer.user.email,
        accountStatus: lecturer.user.status,
        roleNames: [lecturer.user.role, ...lecturer.user.userRoles.map((item) => item.role)].map((item) => item.name),
        studyProgram: lecturer.studyProgram
          ? {
            code: lecturer.studyProgram.code,
            name: lecturer.studyProgram.name,
            degreeLevel: lecturer.studyProgram.degreeLevelRef?.name ?? lecturer.studyProgram.degreeLevel,
            facultyCode: lecturer.studyProgram.faculty.code,
            facultyName: lecturer.studyProgram.faculty.name
          }
          : null,
        structuralPositions: lecturer.structuralPositions.map((assignment) => ({
          id: assignment.id,
          code: assignment.position.code,
          name: assignment.position.name,
          level: assignment.position.level,
          decreeNumber: assignment.decreeNumber,
          startDate: assignment.startDate,
          endDate: assignment.endDate,
          isActive: assignment.isActive,
          facultyName: assignment.faculty?.name ?? null,
          studyProgramName: assignment.studyProgram?.name ?? null
        }))
      },
      activePeriod,
      teaching: {
        classes,
        activeClassCount: activeClasses.length,
        totalSks: activeClasses.reduce((total, item) => total + item.sks, 0),
        studentCount: activeClasses.reduce((total, item) => total + item.participantCount, 0)
      },
      advisories: {
        students: advisorRows.map((advisor) => {
          const student = studentMap.get(advisor.studentId);
          return {
            id: advisor.id,
            studentId: advisor.studentId,
            nim: student?.nim ?? '-',
            name: student?.name ?? '-',
            currentSemester: student?.currentSemester ?? 0,
            status: student?.studentStatus?.name ?? student?.status ?? '-',
            studyProgram: student?.studyProgram ? { code: student.studyProgram.code, name: student.studyProgram.name } : null
          };
        }),
        consultationCount: consultations.length,
        consultations: consultations.map((consultation) => {
          const student = studentMap.get(consultation.studentId);
          return {
            id: consultation.id,
            studentId: consultation.studentId,
            studentNim: student?.nim ?? '-',
            studentName: student?.name ?? '-',
            message: consultation.message,
            createdAt: consultation.createdAt
          };
        })
      },
      identity: {
        nidn: lecturer.nidn,
        nidk: null,
        nupn: null,
        signatureStatus: 'Belum tercatat'
      }
    };
  }
}
