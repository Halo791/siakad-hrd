import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  roles() { return this.prisma.role.findMany({ orderBy: { code: 'asc' } }); }
  permissions() { return this.prisma.permission.findMany({ orderBy: { code: 'asc' } }); }
  users() { return this.prisma.user.findMany({ include: { role: true, userRoles: { include: { role: true } } } }); }

  createPermission(code: string, name: string) {
    const normalizedCode = code.trim().toUpperCase().replace(/\s+/g, '_');
    return this.prisma.permission.upsert({
      where: { code: normalizedCode },
      update: { name },
      create: { code: normalizedCode, name }
    });
  }

  async assignRole(userId: string, roleId: string) {
    return this.prisma.userRole.upsert({
      where: { userId_roleId: { userId, roleId } },
      update: {},
      create: { userId, roleId }
    });
  }

  async setPrimaryRole(userId: string, roleId: string) {
    return this.prisma.user.update({ where: { id: userId }, data: { roleId } });
  }

  rolePermissions(roleId: string) {
    return this.prisma.rolePermission.findMany({ where: { roleId }, include: { permission: true } });
  }

  setRolePermission(data: {
    roleId: string;
    permissionId: string;
    canRead?: boolean;
    canInsert?: boolean;
    canUpdate?: boolean;
    canDelete?: boolean;
    canValidate?: boolean;
    canApprove?: boolean;
    canReject?: boolean;
    canPrint?: boolean;
    canExport?: boolean;
    canImport?: boolean;
    canGenerate?: boolean;
    canLock?: boolean;
    canUnlock?: boolean;
  }) {
    const { roleId, permissionId, ...flags } = data;
    return this.prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId, permissionId } },
      update: flags,
      create: { roleId, permissionId, ...flags }
    });
  }

  auditLogs(limit = 100) {
    return this.prisma.auditLog.findMany({
      take: Math.min(Math.max(limit, 1), 500),
      orderBy: { createdAt: 'desc' },
      include: { user: true }
    });
  }
}
