import { BadRequestException, ConflictException, Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../../prisma.service';

const ROLE_ORDER = [
  'SUPER_ADMIN',
  'ADMIN_UNIVERSITAS',
  'ADMIN_FAKULTAS',
  'ADMIN_PRODI',
  'ADMIN_AKADEMIK',
  'ADMIN_PMB',
  'ADMIN_KEUANGAN',
  'DOSEN',
  'DOSEN_PA',
  'KAPRODI',
  'DEKAN',
  'MAHASISWA',
  'ORANG_TUA',
  'ALUMNI'
];

@Injectable()
export class AccessService {
  constructor(private readonly prisma: PrismaService) {}

  async roles() {
    const roles = await this.prisma.role.findMany();
    return roles.sort((a, b) => {
      const aIndex = ROLE_ORDER.indexOf(a.code);
      const bIndex = ROLE_ORDER.indexOf(b.code);
      return (aIndex === -1 ? ROLE_ORDER.length : aIndex) - (bIndex === -1 ? ROLE_ORDER.length : bIndex);
    });
  }
  permissions() { return this.prisma.permission.findMany({ orderBy: { code: 'asc' } }); }
  users() {
    return this.prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: { role: true, userRoles: { include: { role: true } } }
    });
  }

  async createUser(data: { name: string; email: string; password: string; roleId: string; universityId?: string }) {
    const email = data.email.trim().toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictException('Email user sudah terdaftar');

    const university = data.universityId
      ? await this.prisma.university.findUnique({ where: { id: data.universityId } })
      : await this.prisma.university.findFirst({ orderBy: { code: 'asc' } });
    if (!university) throw new BadRequestException('Data universitas belum tersedia');

    const role = await this.prisma.role.findUnique({ where: { id: data.roleId } });
    if (!role) throw new BadRequestException('Role tidak ditemukan');

    const passwordHash = await hash(data.password, 10);
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          universityId: university.id,
          roleId: role.id,
          name: data.name.trim(),
          email,
          passwordHash
        }
      });
      await tx.userRole.create({ data: { userId: user.id, roleId: role.id } });
      return tx.user.findUnique({
        where: { id: user.id },
        include: { role: true, userRoles: { include: { role: true } } }
      });
    });
  }

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
