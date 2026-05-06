import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService
  ) {}

  async login(email: string, password: string, roleCode?: string) {
    const user = await this.prisma.user.findUnique({
      include: { role: true, userRoles: { include: { role: true } } },
      where: { email }
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    const availableRoles = [user.role, ...user.userRoles.map((x) => x.role)];
    const selectedRole = roleCode
      ? availableRoles.find((x) => x.code === roleCode)
      : user.role;
    if (!selectedRole) throw new UnauthorizedException('Role is not assigned to this user');

    const payload = { sub: user.id, role: selectedRole.code, universityId: user.universityId };
    const accessToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
      expiresIn: '1h'
    });
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret',
      expiresIn: '7d'
    });

    await this.prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    return { accessToken, refreshToken, user, availableRoles: availableRoles.map((x) => ({ code: x.code, name: x.name })) };
  }

  async refresh(userId: string, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      include: { role: true, userRoles: { include: { role: true } } },
      where: { id: userId }
    });
    if (!user || user.refreshToken !== refreshToken) throw new UnauthorizedException('Invalid token');

    const decoded = await this.jwt.verifyAsync<{ sub: string; role: string; universityId: string }>(refreshToken, {
      secret: process.env.JWT_REFRESH_SECRET || 'dev-refresh-secret'
    }).catch(() => {
      throw new UnauthorizedException('Invalid token');
    });
    if (decoded.sub !== userId) throw new UnauthorizedException('Invalid token');

    const assignedRoles = [user.role, ...user.userRoles.map((x) => x.role)];
    const selectedRole = assignedRoles.find((x) => x.code === decoded.role) || user.role;
    const payload = { sub: user.id, role: selectedRole.code, universityId: user.universityId };
    return {
      accessToken: await this.jwt.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET || 'dev-access-secret',
        expiresIn: '1h'
      }),
      role: selectedRole.code
    };
  }
}
