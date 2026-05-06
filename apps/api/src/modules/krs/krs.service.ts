import { BadRequestException, Injectable } from '@nestjs/common';
import { StudyPlanStatus } from '@prisma/client';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class KrsService {
  constructor(private readonly prisma: PrismaService) {}

  list(periodId?: string, status?: StudyPlanStatus) {
    return this.prisma.studyPlan.findMany({
      where: {
        ...(periodId ? { periodId } : {}),
        ...(status ? { status } : {})
      },
      include: { items: true, student: true }
    });
  }

  create(data: { studentId: string; periodId: string }) {
    return this.prisma.studyPlan.create({ data: { ...data, status: StudyPlanStatus.DRAFT } });
  }

  addItem(studyPlanId: string, classId: string) {
    return this.prisma.studyPlanItem.create({ data: { studyPlanId, classId } });
  }

  submit(studyPlanId: string) {
    return this.prisma.$transaction(async (tx) => {
      const plan = await tx.studyPlan.findUnique({
        where: { id: studyPlanId },
        include: { student: true }
      });
      if (!plan) throw new BadRequestException('KRS not found');

      const setting = await tx.studyProgramSetting.findUnique({
        where: {
          studyProgramId_periodId: {
            studyProgramId: plan.student.studyProgramId,
            periodId: plan.periodId
          }
        }
      });
      if (!setting?.openKrs) throw new BadRequestException('Periode KRS belum dibuka');

      const now = new Date();
      if (setting.krsStartDate && now < setting.krsStartDate) throw new BadRequestException('Belum masuk tanggal awal KRS');
      if (setting.krsEndDate && now > setting.krsEndDate) throw new BadRequestException('Periode KRS sudah ditutup');

      return tx.studyPlan.update({ where: { id: studyPlanId }, data: { status: StudyPlanStatus.SUBMITTED } });
    });
  }

  approve(studyPlanId: string) {
    return this.prisma.studyPlan.update({ where: { id: studyPlanId }, data: { status: StudyPlanStatus.APPROVED } });
  }

  reject(studyPlanId: string) {
    return this.prisma.studyPlan.update({ where: { id: studyPlanId }, data: { status: StudyPlanStatus.REJECTED } });
  }

  async bulkApprove(ids: string[]) {
    const result = await this.prisma.studyPlan.updateMany({
      where: { id: { in: ids }, status: StudyPlanStatus.SUBMITTED },
      data: { status: StudyPlanStatus.APPROVED }
    });
    return { approved: result.count };
  }

  async validateRules(studyPlanId: string) {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: studyPlanId },
      include: {
        student: true,
        items: {
          include: {
            class: {
              include: {
                course: { include: { prerequisites: true } },
                schedules: true
              }
            }
          }
        }
      }
    });
    if (!plan) throw new BadRequestException('KRS not found');

    const latestKhs = await this.prisma.khs.findFirst({
      where: { studentId: plan.studentId },
      orderBy: { period: { endDate: 'desc' } },
      include: { period: true }
    });
    const ips = latestKhs?.ips ?? 4;
    const maxSks = ips >= 3 ? 24 : ips >= 2.5 ? 21 : ips >= 2 ? 18 : 15;

    const totalSks = plan.items.reduce((acc, x) => acc + x.class.course.sks, 0);
    if (totalSks > maxSks) throw new BadRequestException(`Total SKS melebihi batas ${maxSks} berdasarkan IPS ${ips.toFixed(2)}`);

    const scheduleSet = new Set<string>();
    for (const item of plan.items) {
      for (const sch of item.class.schedules) {
        const key = `${sch.dayOfWeek}-${sch.startTime}-${sch.endTime}`;
        if (scheduleSet.has(key)) throw new BadRequestException(`Bentrok jadwal terdeteksi di ${key}`);
        scheduleSet.add(key);
      }
    }

    const passedCourseIds = new Set(
      (
        await this.prisma.grade.findMany({
          where: { isLocked: true, classStudent: { studentId: plan.studentId } },
          include: { classStudent: { include: { class: true } } }
        })
      )
        .filter((g) => g.score >= 60)
        .map((g) => g.classStudent.class.courseId)
    );

    for (const item of plan.items) {
      const prereqIds = item.class.course.prerequisites.map((p) => p.prerequisiteCourseId);
      const notPassed = prereqIds.filter((id) => !passedCourseIds.has(id));
      if (notPassed.length > 0) {
        throw new BadRequestException(`Prasyarat mata kuliah ${item.class.course.code} belum terpenuhi`);
      }
    }

    return { valid: true, totalSks, maxSks, ips };
  }
}
