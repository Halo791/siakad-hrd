import { Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { TranscriptsService } from './transcripts.service';

@Controller('transcripts')
export class TranscriptsController {
  constructor(private readonly service: TranscriptsService) {}
  @RequirePermission('TRANSCRIPT', 'read')
  @Get() list() { return this.service.list(); }
  @RequirePermission('TRANSCRIPT', 'generate')
  @Post('generate/:studentId') generate(@Param('studentId') studentId: string) { return this.service.generate(studentId); }
}
