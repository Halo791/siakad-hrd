import { Controller, Get, Query, Req } from '@nestjs/common';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
  constructor(private readonly service: DashboardService) {}

  @Public()
  @Get('admin')
  admin() {
    return this.service.adminSummary();
  }

  @Public()
  @Get('dosen')
  dosen() {
    return this.service.dosenSummary();
  }

  @Public()
  @Get('mahasiswa')
  mahasiswa() {
    return this.service.mahasiswaSummary();
  }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('secure/admin')
  secureAdmin() {
    return this.service.adminSummary();
  }

  @RequirePermission('GRADE', 'read')
  @Get('secure/dosen')
  secureDosen() {
    return this.service.dosenSummary();
  }

  @Get('secure/mahasiswa')
  secureMahasiswa(@Req() req: { user?: { userId?: string } }) {
    return this.service.mahasiswaSummaryByUser(req.user?.userId || '');
  }

  @Get('secure/mahasiswa/portal')
  mahasiswaPortal(@Req() req: { user?: { userId?: string; role?: string } }, @Query('studentId') studentId?: string) {
    return this.service.mahasiswaPortal(req.user?.userId || '', req.user?.role || '', studentId);
  }

  @Get('secure/dosen/portal')
  dosenPortal(@Req() req: { user?: { userId?: string; role?: string } }, @Query('lecturerId') lecturerId?: string) {
    return this.service.dosenPortal(req.user?.userId || '', req.user?.role || '', lecturerId);
  }
}
