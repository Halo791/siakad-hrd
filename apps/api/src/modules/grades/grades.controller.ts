import { BadRequestException, Body, Controller, Get, Param, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { parse } from 'csv-parse/sync';
import { IsString } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { GradesService } from './grades.service';

class ImportGradesDto {
  @IsString()
  classId!: string;
}

@Controller('grades')
export class GradesController {
  constructor(private readonly service: GradesService) {}

  @RequirePermission('GRADE', 'read')
  @Get() list() { return this.service.list(); }

  @RequirePermission('GRADE', 'lock')
  @Post(':id/lock') lock(@Param('id') id: string) { return this.service.lock(id); }

  @RequirePermission('GRADE', 'unlock')
  @Post(':id/unlock') unlock(@Param('id') id: string) { return this.service.unlock(id); }

  @RequirePermission('GRADE', 'import')
  @Post('import-csv')
  @UseInterceptors(FileInterceptor('file'))
  async importCsv(@UploadedFile() file: Express.Multer.File, @Body() dto: ImportGradesDto) {
    if (!file) throw new BadRequestException('CSV file is required');
    if (!dto.classId) throw new BadRequestException('classId is required');

    const records = parse(file.buffer, {
      columns: true,
      skip_empty_lines: true,
      trim: true
    }) as Array<{ nim: string; score: string; letter?: string }>;

    const rows = records.map((r) => ({ nim: r.nim, score: Number(r.score), letter: r.letter }));
    return this.service.importCsv(dto.classId, rows);
  }
}
