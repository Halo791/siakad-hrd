import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Type } from 'class-transformer';
import { IsBoolean, IsDateString, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { SettingsService } from './settings.service';

class UpsertSettingDto {
  @IsString()
  studyProgramId!: string;

  @IsString()
  periodId!: string;

  @IsOptional() @IsBoolean() openKrs?: boolean;
  @IsOptional() @IsDateString() krsStartDate?: string;
  @IsOptional() @IsDateString() krsEndDate?: string;
  @IsOptional() @IsBoolean() openKrsValidation?: boolean;
  @IsOptional() @IsBoolean() openPrintKrs?: boolean;
  @IsOptional() @IsBoolean() openPrintUts?: boolean;
  @IsOptional() @IsBoolean() openPrintUas?: boolean;
  @IsOptional() @IsNumber() @Min(0) @Max(100) minAttendanceUts?: number;
  @IsOptional() @IsNumber() @Min(0) @Max(100) minAttendanceUas?: number;
  @IsOptional() @Type(() => Number) @IsInt() @Min(1) totalMeetings?: number;
  @IsOptional() @IsBoolean() allowLecturerGenerate?: boolean;
  @IsOptional() @IsBoolean() allowLecturerEditGrade?: boolean;
}

@Controller('settings')
export class SettingsController {
  constructor(private readonly service: SettingsService) {}

  @RequirePermission('SETTING_PRODI', 'read')
  @Get('study-program')
  list(@Query('periodId') periodId?: string) {
    return this.service.list(periodId);
  }

  @RequirePermission('SETTING_PRODI', 'update')
  @Post('study-program')
  upsert(@Body() dto: UpsertSettingDto) {
    return this.service.upsert({
      ...dto,
      krsStartDate: dto.krsStartDate ? new Date(dto.krsStartDate) : undefined,
      krsEndDate: dto.krsEndDate ? new Date(dto.krsEndDate) : undefined
    });
  }
}
