import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ReportsService } from './reports.service';

@Controller('reports')
export class ReportsController {
  constructor(private readonly service: ReportsService) {}

  @RequirePermission('KRS', 'export')
  @Get('krs/:studyPlanId.csv')
  async exportKrsCsv(@Param('studyPlanId') studyPlanId: string, @Res() res: Response) {
    const csv = await this.service.exportKrsCsv(studyPlanId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="krs-${studyPlanId}.csv"`);
    res.send(csv);
  }

  @RequirePermission('KRS', 'export')
  @Get('krs/:studyPlanId.xlsx')
  async exportKrsXlsx(@Param('studyPlanId') studyPlanId: string, @Res() res: Response) {
    const xlsx = await this.service.exportKrsXlsx(studyPlanId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=\"krs-${studyPlanId}.xlsx\"`);
    res.send(xlsx);
  }

  @RequirePermission('TRANSCRIPT', 'export')
  @Get('transcript/:studentId.csv')
  async exportTranscriptCsv(@Param('studentId') studentId: string, @Res() res: Response) {
    const csv = await this.service.exportTranscriptCsv(studentId);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="transcript-${studentId}.csv"`);
    res.send(csv);
  }

  @RequirePermission('TRANSCRIPT', 'export')
  @Get('transcript/:studentId.xlsx')
  async exportTranscriptXlsx(@Param('studentId') studentId: string, @Res() res: Response) {
    const xlsx = await this.service.exportTranscriptXlsx(studentId);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=\"transcript-${studentId}.xlsx\"`);
    res.send(xlsx);
  }

  @RequirePermission('KHS', 'print')
  @Get('khs/:studentId/:periodId.pdf')
  async exportKhsPdf(
    @Param('studentId') studentId: string,
    @Param('periodId') periodId: string,
    @Res() res: Response
  ) {
    const pdf = await this.service.exportKhsPdf(studentId, periodId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="khs-${studentId}-${periodId}.pdf"`);
    res.send(pdf);
  }
}
