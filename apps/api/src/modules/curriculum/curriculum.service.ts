import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class CurriculumService {
  constructor(private readonly prisma: PrismaService) {}

  list() { return this.prisma.curriculum.findMany({ include: { studyProgram: true } }); }
  create(data: { studyProgramId: string; year: number; name: string }) { return this.prisma.curriculum.create({ data }); }

  courses() { return this.prisma.course.findMany(); }
  createCourse(data: { code: string; name: string; sks: number; minPassingGrade: string; isMandatory: boolean }) {
    return this.prisma.course.create({ data });
  }
}
