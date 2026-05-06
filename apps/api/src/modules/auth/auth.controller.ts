import { Body, Controller, Get, Req, Post } from '@nestjs/common';
import { IsEmail, IsOptional, IsString } from 'class-validator';
import { Public } from '../../common/decorators/public.decorator';
import { AuthService } from './auth.service';

class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;

  @IsOptional()
  @IsString()
  roleCode?: string;
}

class RefreshDto {
  @IsString()
  userId!: string;

  @IsString()
  refreshToken!: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto.email, dto.password, dto.roleCode);
  }

  @Public()
  @Post('refresh')
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refresh(dto.userId, dto.refreshToken);
  }

  @Get('profile')
  profile(@Req() req: { user?: { userId?: string; role?: string; universityId?: string } }) {
    return req.user ?? null;
  }
}
