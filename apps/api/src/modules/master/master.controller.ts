import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { IsBoolean, IsInt, IsOptional, IsString } from 'class-validator';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { MasterService } from './master.service';

class CreateFacultyDto {
  @IsString() universityId!: string;
  @IsString() code!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() accreditation?: string;
  @IsOptional() @IsString() leaderName?: string;
  @IsOptional() @IsString() leaderPhone?: string;
}

class CreateStudyProgramDto {
  @IsString() facultyId!: string;
  @IsString() code!: string;
  @IsString() name!: string;
  @IsOptional() @IsString() degreeLevel?: string;
  @IsOptional() @IsString() degreeLevelId?: string;
}

class CreateUniversityDto {
  @IsString() code!: string;
  @IsString() name!: string;
}

class CreateAcademicYearDto {
  @IsString() code!: string;
  @IsString() name!: string;
}

class CreateAcademicPeriodDto {
  @IsString() academicYearId!: string;
  @IsString() code!: string;
  @IsString() name!: string;
  @IsString() startDate!: string;
  @IsString() endDate!: string;
}

class CreateRefDto {
  @IsString() code!: string;
  @IsString() name!: string;
}
class UpdateRefDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
}

class CreateLecturerDto {
  @IsString() universityId!: string;
  @IsString() name!: string;
  @IsString() email!: string;
  @IsString() nidn!: string;
  @IsOptional() @IsString() studyProgramId?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsString() roleCode?: string;
  @IsOptional() @IsString() password?: string;
}

class CreateStudentDto {
  @IsString() universityId!: string;
  @IsString() studyProgramId!: string;
  @IsString() nim!: string;
  @IsString() name!: string;
  @IsString() email!: string;
  @IsString() status!: string;
  @IsOptional() @IsInt() currentSemester?: number;
  @IsOptional() @IsString() studentClassId?: string;
  @IsOptional() @IsString() studentStatusId?: string;
  @IsOptional() @IsString() studySystemId?: string;
  @IsOptional() @IsString() roleCode?: string;
  @IsOptional() @IsString() password?: string;
}

class CreateStudentParentDto {
  @IsString() studentId!: string;
  @IsString() name!: string;
  @IsString() relation!: string;
  @IsOptional() @IsString() phone?: string;
}

class CreateStructuralPositionDto {
  @IsString() code!: string;
  @IsString() name!: string;
  @IsString() level!: string;
  @IsOptional() @IsString() description?: string;
}

class CreateLecturerStructuralPositionDto {
  @IsString() lecturerId!: string;
  @IsString() positionId!: string;
  @IsOptional() @IsString() facultyId?: string;
  @IsOptional() @IsString() studyProgramId?: string;
  @IsOptional() @IsString() decreeNumber?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() @IsBoolean() isActive?: boolean;
}

class UpdateUniversityDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
}

class UpdateAcademicYearDto {
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
}

class UpdateAcademicPeriodDto {
  @IsOptional() @IsString() academicYearId?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() startDate?: string;
  @IsOptional() @IsString() endDate?: string;
  @IsOptional() isActive?: boolean;
}

class UpdateFacultyDto {
  @IsOptional() @IsString() universityId?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() accreditation?: string;
  @IsOptional() @IsString() leaderName?: string;
  @IsOptional() @IsString() leaderPhone?: string;
}

class UpdateStudyProgramDto {
  @IsOptional() @IsString() facultyId?: string;
  @IsOptional() @IsString() code?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() degreeLevel?: string;
  @IsOptional() @IsString() degreeLevelId?: string;
}

class UpdateStudentDto {
  @IsOptional() @IsString() studyProgramId?: string;
  @IsOptional() @IsString() nim?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsInt() currentSemester?: number;
  @IsOptional() @IsString() studentClassId?: string;
  @IsOptional() @IsString() studentStatusId?: string;
  @IsOptional() @IsString() studySystemId?: string;
}

class UpdateLecturerDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() email?: string;
  @IsOptional() @IsString() nidn?: string;
  @IsOptional() @IsString() studyProgramId?: string;
}

class UpdateStudentParentDto {
  @IsOptional() @IsString() studentId?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() relation?: string;
  @IsOptional() @IsString() phone?: string;
}

@Controller('master')
export class MasterController {
  constructor(private readonly service: MasterService) {}

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('universities') universities() { return this.service.universities(); }

  @RequirePermission('MASTER_FACULTY', 'insert')
  @Post('universities') createUniversity(@Body() dto: CreateUniversityDto) { return this.service.createUniversity(dto); }
  @RequirePermission('MASTER_FACULTY', 'update')
  @Patch('universities/:id') updateUniversity(@Param('id') id: string, @Body() dto: UpdateUniversityDto) { return this.service.updateUniversity(id, dto); }
  @RequirePermission('MASTER_FACULTY', 'delete')
  @Delete('universities/:id') deleteUniversity(@Param('id') id: string) { return this.service.deleteUniversity(id); }

  @RequirePermission('MASTER_PERIOD', 'read')
  @Get('academic-years') academicYears() { return this.service.academicYears(); }

  @RequirePermission('MASTER_PERIOD', 'insert')
  @Post('academic-years') createAcademicYear(@Body() dto: CreateAcademicYearDto) { return this.service.createAcademicYear(dto); }
  @RequirePermission('MASTER_PERIOD', 'update')
  @Patch('academic-years/:id') updateAcademicYear(@Param('id') id: string, @Body() dto: UpdateAcademicYearDto) { return this.service.updateAcademicYear(id, dto); }
  @RequirePermission('MASTER_PERIOD', 'delete')
  @Delete('academic-years/:id') deleteAcademicYear(@Param('id') id: string) { return this.service.deleteAcademicYear(id); }

  @RequirePermission('MASTER_FACULTY', 'read')
  @Get('faculties') faculties() { return this.service.faculties(); }

  @RequirePermission('MASTER_FACULTY', 'insert')
  @Post('faculties') createFaculty(@Body() dto: CreateFacultyDto) { return this.service.createFaculty(dto); }
  @RequirePermission('MASTER_FACULTY', 'update')
  @Patch('faculties/:id') updateFaculty(@Param('id') id: string, @Body() dto: UpdateFacultyDto) { return this.service.updateFaculty(id, dto); }
  @RequirePermission('MASTER_FACULTY', 'delete')
  @Delete('faculties/:id') deleteFaculty(@Param('id') id: string) { return this.service.deleteFaculty(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('study-programs') studyPrograms() { return this.service.studyPrograms(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('study-programs') createStudyProgram(@Body() dto: CreateStudyProgramDto) { return this.service.createStudyProgram(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('study-programs/:id') updateStudyProgram(@Param('id') id: string, @Body() dto: UpdateStudyProgramDto) { return this.service.updateStudyProgram(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('study-programs/:id') deleteStudyProgram(@Param('id') id: string) { return this.service.deleteStudyProgram(id); }

  @RequirePermission('MASTER_PERIOD', 'read')
  @Get('academic-periods') academicPeriods() { return this.service.academicPeriods(); }
  @RequirePermission('MASTER_PERIOD', 'insert')
  @Post('academic-periods') createAcademicPeriod(@Body() dto: CreateAcademicPeriodDto) {
    return this.service.createAcademicPeriod({
      ...dto,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate)
    });
  }
  @RequirePermission('MASTER_PERIOD', 'update')
  @Patch('academic-periods/:id')
  updateAcademicPeriod(@Param('id') id: string, @Body() dto: UpdateAcademicPeriodDto) {
    return this.service.updateAcademicPeriod(id, {
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined
    });
  }
  @RequirePermission('MASTER_PERIOD', 'delete')
  @Delete('academic-periods/:id') deleteAcademicPeriod(@Param('id') id: string) { return this.service.deleteAcademicPeriod(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('students') students() { return this.service.students(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('lecturers') lecturers() { return this.service.lecturers(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('structural-positions') structuralPositions() { return this.service.structuralPositions(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('structural-positions')
  createStructuralPosition(@Body() dto: CreateStructuralPositionDto) { return this.service.createStructuralPosition(dto); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('lecturer-structural-positions')
  lecturerStructuralPositions() { return this.service.lecturerStructuralPositions(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('lecturer-structural-positions')
  createLecturerStructuralPosition(@Body() dto: CreateLecturerStructuralPositionDto) {
    return this.service.createLecturerStructuralPosition({
      ...dto,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined
    });
  }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('lecturers') createLecturer(@Body() dto: CreateLecturerDto) { return this.service.createLecturer(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('lecturers/:id') updateLecturer(@Param('id') id: string, @Body() dto: UpdateLecturerDto) { return this.service.updateLecturer(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('lecturers/:id') deleteLecturer(@Param('id') id: string) { return this.service.deleteLecturer(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('student-parents') studentParents() { return this.service.studentParents(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('student-parents') createStudentParent(@Body() dto: CreateStudentParentDto) { return this.service.createStudentParent(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('student-parents/:id')
  updateStudentParent(@Param('id') id: string, @Body() dto: UpdateStudentParentDto) { return this.service.updateStudentParent(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('student-parents/:id') deleteStudentParent(@Param('id') id: string) { return this.service.deleteStudentParent(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('students') createStudent(@Body() dto: CreateStudentDto) { return this.service.createStudent(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('students/:id') updateStudent(@Param('id') id: string, @Body() dto: UpdateStudentDto) { return this.service.updateStudent(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('students/:id') deleteStudent(@Param('id') id: string) { return this.service.deleteStudent(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('study-systems') studySystems() { return this.service.studySystems(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('study-systems') createStudySystem(@Body() dto: CreateRefDto) { return this.service.createStudySystem(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('study-systems/:id') updateStudySystem(@Param('id') id: string, @Body() dto: UpdateRefDto) { return this.service.updateStudySystem(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('study-systems/:id') deleteStudySystem(@Param('id') id: string) { return this.service.deleteStudySystem(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('student-classes') studentClasses() { return this.service.studentClasses(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('student-classes') createStudentClass(@Body() dto: CreateRefDto) { return this.service.createStudentClass(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('student-classes/:id') updateStudentClass(@Param('id') id: string, @Body() dto: UpdateRefDto) { return this.service.updateStudentClass(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('student-classes/:id') deleteStudentClass(@Param('id') id: string) { return this.service.deleteStudentClass(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('student-statuses') studentStatuses() { return this.service.studentStatuses(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('student-statuses') createStudentStatus(@Body() dto: CreateRefDto) { return this.service.createStudentStatus(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('student-statuses/:id') updateStudentStatus(@Param('id') id: string, @Body() dto: UpdateRefDto) { return this.service.updateStudentStatus(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('student-statuses/:id') deleteStudentStatus(@Param('id') id: string) { return this.service.deleteStudentStatus(id); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'read')
  @Get('degree-levels') degreeLevels() { return this.service.degreeLevels(); }

  @RequirePermission('MASTER_STUDY_PROGRAM', 'insert')
  @Post('degree-levels') createDegreeLevel(@Body() dto: CreateRefDto) { return this.service.createDegreeLevel(dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'update')
  @Patch('degree-levels/:id') updateDegreeLevel(@Param('id') id: string, @Body() dto: UpdateRefDto) { return this.service.updateDegreeLevel(id, dto); }
  @RequirePermission('MASTER_STUDY_PROGRAM', 'delete')
  @Delete('degree-levels/:id') deleteDegreeLevel(@Param('id') id: string) { return this.service.deleteDegreeLevel(id); }
}
