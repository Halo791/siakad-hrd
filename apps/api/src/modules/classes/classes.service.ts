import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class ClassesService {
  constructor(private readonly prisma: PrismaService) {}

  list() { return this.prisma.class.findMany({ include: { course: true, schedules: true, lecturers: true } }); }

  create(data: { studyProgramId: string; courseId: string; periodId: string; name: string; capacity: number }) {
    return this.prisma.class.create({ data });
  }
}
