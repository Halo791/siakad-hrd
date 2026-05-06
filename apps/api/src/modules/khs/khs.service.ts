import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class KhsService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.khs.findMany({ include: { student: true, period: true } }); }

  async generate(periodId: string) {
    const students = await this.prisma.student.findMany();
    const results = [];
    for (const student of students) {
      const grades = await this.prisma.grade.findMany({
        where: {
          isLocked: true,
          classStudent: { studentId: student.id, class: { periodId } }
        },
        include: { classStudent: { include: { class: { include: { course: true } } } } }
      });
      const totalSks = grades.reduce((a, g) => a + g.classStudent.class.course.sks, 0);
      const totalQuality = grades.reduce((a, g) => a + ((g.score / 25) * g.classStudent.class.course.sks), 0);
      const ips = totalSks > 0 ? totalQuality / totalSks : 0;
      const latestKhs = await this.prisma.khs.findFirst({ where: { studentId: student.id }, orderBy: { period: { endDate: 'desc' } }, include: { period: true } });
      const ipk = latestKhs ? (latestKhs.ipk + ips) / 2 : ips;
      const khs = await this.prisma.khs.upsert({
        where: { studentId_periodId: { studentId: student.id, periodId } },
        update: { ips, ipk },
        create: { studentId: student.id, periodId, ips, ipk }
      });
      results.push(khs);
    }
    return results;
  }
}
