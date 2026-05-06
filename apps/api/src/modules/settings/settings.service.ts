import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  list(periodId?: string) {
    return this.prisma.studyProgramSetting.findMany({
      where: periodId ? { periodId } : {},
      include: { studyProgram: true, period: true }
    });
  }

  upsert(data: {
    studyProgramId: string;
    periodId: string;
    openKrs?: boolean;
    krsStartDate?: Date;
    krsEndDate?: Date;
    openKrsValidation?: boolean;
    openPrintKrs?: boolean;
    openPrintUts?: boolean;
    openPrintUas?: boolean;
    minAttendanceUts?: number;
    minAttendanceUas?: number;
    totalMeetings?: number;
    allowLecturerGenerate?: boolean;
    allowLecturerEditGrade?: boolean;
  }) {
    const {
      studyProgramId,
      periodId,
      ...rest
    } = data;

    return this.prisma.studyProgramSetting.upsert({
      where: { studyProgramId_periodId: { studyProgramId, periodId } },
      update: rest,
      create: { studyProgramId, periodId, ...rest }
    });
  }
}
