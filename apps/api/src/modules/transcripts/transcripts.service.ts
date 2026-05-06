import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class TranscriptsService {
  constructor(private readonly prisma: PrismaService) {}
  list() { return this.prisma.transcript.findMany({ include: { student: true } }); }

  async generate(studentId: string) {
    const grades = await this.prisma.grade.findMany({
      where: { isLocked: true, classStudent: { studentId } },
      include: { classStudent: { include: { class: { include: { course: true } } } } }
    });
    const totalSks = grades.reduce((a, g) => a + g.classStudent.class.course.sks, 0);
    const totalQuality = grades.reduce((a, g) => a + ((g.score / 25) * g.classStudent.class.course.sks), 0);
    const gpa = totalSks > 0 ? totalQuality / totalSks : 0;
    const existing = await this.prisma.transcript.findFirst({ where: { studentId } });
    if (existing) {
      return this.prisma.transcript.update({ where: { id: existing.id }, data: { gpa, totalSks } });
    }
    return this.prisma.transcript.create({ data: { studentId, gpa, totalSks } });
  }
}
