import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { IsBoolean, IsOptional, IsString } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { AccessService } from './access.service';

class AssignRoleDto {
  @IsString() userId!: string;
  @IsString() roleId!: string;
}

class SetRolePermissionDto {
  @IsString() roleId!: string;
  @IsString() permissionId!: string;
  @IsOptional() @IsBoolean() canRead?: boolean;
  @IsOptional() @IsBoolean() canInsert?: boolean;
  @IsOptional() @IsBoolean() canUpdate?: boolean;
  @IsOptional() @IsBoolean() canDelete?: boolean;
  @IsOptional() @IsBoolean() canValidate?: boolean;
  @IsOptional() @IsBoolean() canApprove?: boolean;
  @IsOptional() @IsBoolean() canReject?: boolean;
  @IsOptional() @IsBoolean() canPrint?: boolean;
  @IsOptional() @IsBoolean() canExport?: boolean;
  @IsOptional() @IsBoolean() canImport?: boolean;
  @IsOptional() @IsBoolean() canGenerate?: boolean;
  @IsOptional() @IsBoolean() canLock?: boolean;
  @IsOptional() @IsBoolean() canUnlock?: boolean;
}

@Controller('access')
export class AccessController {
  constructor(private readonly service: AccessService) {}

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('roles') roles() { return this.service.roles(); }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('permissions') permissions() { return this.service.permissions(); }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('users') users() { return this.service.users(); }

  @RequirePermission('MASTER_FACULTY', 'update')
  @Post('users/assign-role') assignRole(@Body() dto: AssignRoleDto) { return this.service.assignRole(dto.userId, dto.roleId); }

  @RequirePermission('MASTER_FACULTY', 'update')
  @Post('users/set-primary-role') setPrimaryRole(@Body() dto: AssignRoleDto) { return this.service.setPrimaryRole(dto.userId, dto.roleId); }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('role-permissions/:roleId') rolePermissions(@Param('roleId') roleId: string) { return this.service.rolePermissions(roleId); }

  @RequirePermission('MASTER_FACULTY', 'update')
  @Post('role-permissions') setRolePermission(@Body() dto: SetRolePermissionDto) { return this.service.setRolePermission(dto); }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('audit-logs') auditLogs(@Query('limit') limit?: string) { return this.service.auditLogs(limit ? Number(limit) : 100); }

  @RequirePermission('MASTER_FACULTY', 'validate')
  @Post('permission-check/validate') checkValidate() { return { ok: true, action: 'validate' }; }

  @RequirePermission('MASTER_FACULTY', 'approve')
  @Post('permission-check/approve') checkApprove() { return { ok: true, action: 'approve' }; }

  @RequirePermission('MASTER_FACULTY', 'reject')
  @Post('permission-check/reject') checkReject() { return { ok: true, action: 'reject' }; }

  @RequirePermission('MASTER_FACULTY', 'print')
  @Post('permission-check/print') checkPrint() { return { ok: true, action: 'print' }; }

  @RequirePermission('MASTER_FACULTY', 'export')
  @Post('permission-check/export') checkExport() { return { ok: true, action: 'export' }; }

  @RequirePermission('MASTER_FACULTY', 'import')
  @Post('permission-check/import') checkImport() { return { ok: true, action: 'import' }; }

  @RequirePermission('MASTER_FACULTY', 'generate')
  @Post('permission-check/generate') checkGenerate() { return { ok: true, action: 'generate' }; }

  @RequirePermission('MASTER_FACULTY', 'lock')
  @Post('permission-check/lock') checkLock() { return { ok: true, action: 'lock' }; }

  @RequirePermission('MASTER_FACULTY', 'unlock')
  @Post('permission-check/unlock') checkUnlock() { return { ok: true, action: 'unlock' }; }
}
