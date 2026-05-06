import { Controller, Get, Param, Post } from '@nestjs/common';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { KhsService } from './khs.service';

@Controller('khs')
export class KhsController {
  constructor(private readonly service: KhsService) {}
  @RequirePermission('KHS', 'read')
  @Get() list() { return this.service.list(); }
  @RequirePermission('KHS', 'generate')
  @Post('generate/:periodId') generate(@Param('periodId') periodId: string) { return this.service.generate(periodId); }
}
