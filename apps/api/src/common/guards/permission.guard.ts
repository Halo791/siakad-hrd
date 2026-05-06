import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../../prisma.service';
import { PERMISSION_KEY, PermissionAction } from '../decorators/require-permission.decorator';

const actionToField: Record<PermissionAction, keyof { [k: string]: boolean }> = {
  read: 'canRead', insert: 'canInsert', update: 'canUpdate', delete: 'canDelete',
  validate: 'canValidate', approve: 'canApprove', reject: 'canReject', print: 'canPrint',
  export: 'canExport', import: 'canImport', generate: 'canGenerate', lock: 'canLock', unlock: 'canUnlock'
};

@Injectable()
export class PermissionGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const required = this.reflector.getAllAndOverride<{ code: string; action: PermissionAction }>(
      PERMISSION_KEY,
      [context.getHandler(), context.getClass()]
    );
    if (!required) return true;

    const req = context.switchToHttp().getRequest();
    if (!req.user?.userId) return false;

    const user = await this.prisma.user.findUnique({
      where: { id: req.user.userId },
      include: { role: true, userRoles: { include: { role: true } } }
    });
    if (!user) return false;

    const assignedRoles = [user.role, ...user.userRoles.map((x) => x.role)];
    const activeRole = assignedRoles.find((x) => x.code === req.user.role);
    if (!activeRole) return false;

    const permission = await this.prisma.permission.findUnique({ where: { code: required.code } });
    if (!permission) return false;

    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: { roleId_permissionId: { roleId: activeRole.id, permissionId: permission.id } }
    });
    if (!rolePermission) return false;

    const field = actionToField[required.action] as keyof typeof rolePermission;
    return Boolean(rolePermission[field]);
  }
}
