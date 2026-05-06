import { Injectable } from '@nestjs/common';
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
}
