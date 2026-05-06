import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { StudyPlanStatus } from '@prisma/client';
import { IsArray, IsString } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { KrsService } from './krs.service';

class CreateKrsDto {
  @IsString() studentId!: string;
  @IsString() periodId!: string;
}

class AddKrsItemDto {
  @IsString() classId!: string;
}

class BulkApproveDto {
  @IsArray()
  @IsString({ each: true })
  ids!: string[];
}

@Controller('krs')
export class KrsController {
  constructor(private readonly service: KrsService) {}

  @RequirePermission('KRS', 'read')
  @Get() list(@Query('periodId') periodId?: string, @Query('status') status?: StudyPlanStatus) {
    return this.service.list(periodId, status);
  }

  @RequirePermission('KRS', 'insert')
  @Post() create(@Body() dto: CreateKrsDto) { return this.service.create(dto); }

  @RequirePermission('KRS', 'insert')
  @Post(':id/items') addItem(@Param('id') id: string, @Body() dto: AddKrsItemDto) {
    return this.service.addItem(id, dto.classId);
  }

  @RequirePermission('KRS', 'update')
  @Post(':id/submit') submit(@Param('id') id: string) { return this.service.submit(id); }

  @RequirePermission('KRS', 'approve')
  @Post(':id/approve') approve(@Param('id') id: string) { return this.service.approve(id); }

  @RequirePermission('KRS', 'approve')
  @Post('approve-bulk')
  bulkApprove(@Body() dto: BulkApproveDto) {
    return this.service.bulkApprove(dto.ids ?? []);
  }

  @RequirePermission('KRS', 'reject')
  @Post(':id/reject') reject(@Param('id') id: string) { return this.service.reject(id); }

  @RequirePermission('KRS', 'validate')
  @Post(':id/validate') validate(@Param('id') id: string) { return this.service.validateRules(id); }
}
