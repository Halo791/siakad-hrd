import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsBoolean, IsInt, IsString, Min } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { CurriculumService } from './curriculum.service';

class CreateCurriculumDto {
  @IsString() studyProgramId!: string;
  @IsInt() year!: number;
  @IsString() name!: string;
}

class CreateCourseDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsInt() @Min(1) sks!: number;
  @IsString() minPassingGrade!: string;
  @IsBoolean() isMandatory!: boolean;
}

@Controller('curriculum')
export class CurriculumController {
  constructor(private readonly service: CurriculumService) {}

  @RequirePermission('CURRICULUM', 'read')
  @Get() list() { return this.service.list(); }

  @RequirePermission('CURRICULUM', 'insert')
  @Post() create(@Body() dto: CreateCurriculumDto) { return this.service.create(dto); }

  @RequirePermission('COURSE', 'read')
  @Get('courses') courses() { return this.service.courses(); }

  @RequirePermission('COURSE', 'insert')
  @Post('courses') createCourse(@Body() dto: CreateCourseDto) { return this.service.createCourse(dto); }
}
