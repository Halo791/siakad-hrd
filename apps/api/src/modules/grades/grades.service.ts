import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class GradesService {
  constructor(private readonly prisma: PrismaService) {}

  list() { return this.prisma.grade.findMany({ include: { classStudent: true } }); }

  lock(id: string) {
    return this.prisma.grade.update({ where: { id }, data: { isLocked: true } });
  }

  unlock(id: string) {
    return this.prisma.grade.update({ where: { id }, data: { isLocked: false } });
  }

  async importCsv(classId: string, rows: Array<{ nim: string; score: number; letter?: string }>) {
    const classStudents = await this.prisma.classStudent.findMany({
      where: { classId },
      include: { student: true }
    });

    const nimMap = new Map(classStudents.map((cs) => [cs.student.nim, cs]));
    let imported = 0;

    for (const row of rows) {
      const cs = nimMap.get(row.nim);
      if (!cs) continue;
      if (row.score < 0 || row.score > 100) throw new BadRequestException(`Score out of range for NIM ${row.nim}`);

      const letter = row.letter ?? (row.score >= 85 ? 'A' : row.score >= 70 ? 'B' : row.score >= 60 ? 'C' : row.score >= 50 ? 'D' : 'E');
      await this.prisma.grade.upsert({
        where: { id: `grade_${classId}_${cs.studentId}` },
        update: { score: row.score, letter, isLocked: false },
        create: { id: `grade_${classId}_${cs.studentId}`, classStudentId: cs.id, score: row.score, letter, isLocked: false }
      });
      imported += 1;
    }

    return { imported, totalRows: rows.length };
  }
}
