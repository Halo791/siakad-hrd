import { Body, Controller, Get, Post } from '@nestjs/common';
import { IsInt, IsString, Min } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { ClassesService } from './classes.service';

class CreateClassDto {
  @IsString() studyProgramId!: string;
  @IsString() courseId!: string;
  @IsString() periodId!: string;
  @IsString() name!: string;
  @IsInt() @Min(1) capacity!: number;
}

@Controller('classes')
export class ClassesController {
  constructor(private readonly service: ClassesService) {}

  @RequirePermission('CLASS', 'read')
  @Get() list() { return this.service.list(); }

  @RequirePermission('CLASS', 'insert')
  @Post() create(@Body() dto: CreateClassDto) { return this.service.create(dto); }
}
