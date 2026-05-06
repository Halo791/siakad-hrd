import { Injectable } from '@nestjs/common';
import { hash } from 'bcrypt';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class MasterService {
  constructor(private readonly prisma: PrismaService) {}

  universities() { return this.prisma.university.findMany(); }
  createUniversity(data: { code: string; name: string }) { return this.prisma.university.create({ data }); }
  updateUniversity(id: string, data: { code?: string; name?: string }) { return this.prisma.university.update({ where: { id }, data }); }
  deleteUniversity(id: string) { return this.prisma.university.delete({ where: { id } }); }

  academicYears() { return this.prisma.academicYear.findMany({ include: { periods: true } }); }
  createAcademicYear(data: { code: string; name: string }) { return this.prisma.academicYear.create({ data }); }
  updateAcademicYear(id: string, data: { code?: string; name?: string }) { return this.prisma.academicYear.update({ where: { id }, data }); }
  deleteAcademicYear(id: string) { return this.prisma.academicYear.delete({ where: { id } }); }

  async faculties() {
    const faculties = await this.prisma.faculty.findMany({
      include: {
        university: true,
        studyPrograms: {
          orderBy: { code: 'asc' },
          include: {
            students: { select: { id: true, currentSemester: true } },
            lecturers: { orderBy: { name: 'asc' } }
          }
        }
      },
      orderBy: { code: 'asc' }
    });

    return faculties.map((faculty) => {
      const semesterMap = new Map<number, number>();
      const lecturers = faculty.studyPrograms
        .flatMap((studyProgram) => studyProgram.lecturers.map((lecturer) => ({
          id: lecturer.id,
          nidn: lecturer.nidn,
          name: lecturer.name,
          studyProgramId: studyProgram.id,
          studyProgramCode: studyProgram.code,
          studyProgramName: studyProgram.name
        })))
        .sort((a, b) => `${a.studyProgramCode}-${a.name}`.localeCompare(`${b.studyProgramCode}-${b.name}`));

      faculty.studyPrograms.forEach((studyProgram) => {
        studyProgram.students.forEach((student) => {
          semesterMap.set(student.currentSemester, (semesterMap.get(student.currentSemester) || 0) + 1);
        });
      });

      const studyPrograms = faculty.studyPrograms.map(({ students, lecturers: _lecturers, ...studyProgram }) => ({
        ...studyProgram,
        studentCount: students.length,
        lecturerCount: _lecturers.length
      }));

      return {
        ...faculty,
        studyPrograms,
        studentBodyTotal: Array.from(semesterMap.values()).reduce((sum, count) => sum + count, 0),
        studentBodyBySemester: Array.from(semesterMap.entries())
          .sort(([a], [b]) => a - b)
          .map(([semester, count]) => ({ semester, count })),
        lecturers
      };
    });
  }
  createFaculty(data: { universityId: string; code: string; name: string; accreditation?: string; leaderName?: string; leaderPhone?: string }) {
    return this.prisma.faculty.create({ data });
  }
  updateFaculty(id: string, data: { universityId?: string; code?: string; name?: string; accreditation?: string; leaderName?: string; leaderPhone?: string }) {
    return this.prisma.faculty.update({ where: { id }, data });
  }
  deleteFaculty(id: string) { return this.prisma.faculty.delete({ where: { id } }); }

  studyPrograms() { return this.prisma.studyProgram.findMany({ include: { faculty: true, degreeLevelRef: true } }); }
  createStudyProgram(data: { facultyId: string; code: string; name: string; degreeLevel?: string; degreeLevelId?: string }) {
    return this.prisma.studyProgram.create({ data });
  }
  updateStudyProgram(
    id: string,
    data: { facultyId?: string; code?: string; name?: string; degreeLevel?: string; degreeLevelId?: string }
  ) {
    return this.prisma.studyProgram.update({ where: { id }, data });
  }
  deleteStudyProgram(id: string) { return this.prisma.studyProgram.delete({ where: { id } }); }

  academicPeriods() { return this.prisma.academicPeriod.findMany({ include: { academicYear: true } }); }
  createAcademicPeriod(data: { academicYearId: string; code: string; name: string; startDate: Date; endDate: Date }) {
    return this.prisma.academicPeriod.create({ data });
  }
  updateAcademicPeriod(
    id: string,
    data: { academicYearId?: string; code?: string; name?: string; startDate?: Date; endDate?: Date; isActive?: boolean }
  ) {
    return this.prisma.academicPeriod.update({ where: { id }, data });
  }
  deleteAcademicPeriod(id: string) { return this.prisma.academicPeriod.delete({ where: { id } }); }

  students() {
    return this.prisma.student.findMany({
      include: { studyProgram: true, user: true, parents: true, studentStatus: true, studentClass: true, studySystem: true }
    });
  }

  lecturers() {
    return this.prisma.lecturer.findMany({ include: { user: true, studyProgram: { include: { faculty: true } } }, orderBy: { name: 'asc' } });
  }

  studentParents() {
    return this.prisma.studentParent.findMany({ include: { student: true } });
  }
  createStudentParent(data: { studentId: string; name: string; relation: string; phone?: string }) {
    return this.prisma.studentParent.create({ data });
  }
  updateStudentParent(id: string, data: { studentId?: string; name?: string; relation?: string; phone?: string }) {
    return this.prisma.studentParent.update({ where: { id }, data });
  }
  deleteStudentParent(id: string) { return this.prisma.studentParent.delete({ where: { id } }); }

  async createLecturer(data: {
    universityId: string;
    studyProgramId?: string;
    name: string;
    email: string;
    nidn: string;
    status?: string;
    roleCode?: string;
    password?: string;
  }) {
    const roleCode = data.roleCode || 'DOSEN';
    const role = await this.prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    const passwordHash = await hash(data.password || 'Admin@12345', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          universityId: data.universityId,
          roleId: role.id,
          name: data.name,
          email: data.email,
          passwordHash
        }
      });

      if (roleCode !== 'DOSEN') {
        const dosenRole = await tx.role.findUnique({ where: { code: 'DOSEN' } });
        if (dosenRole) {
          await tx.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: dosenRole.id } },
            update: {},
            create: { userId: user.id, roleId: dosenRole.id }
          });
        }
      }

      return tx.lecturer.create({
        data: {
          userId: user.id,
          studyProgramId: data.studyProgramId,
          nidn: data.nidn,
          name: data.name
        },
        include: { user: true, studyProgram: true }
      });
    });
  }
  async updateLecturer(
    id: string,
    data: { name?: string; nidn?: string; email?: string; studyProgramId?: string }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const lecturer = await tx.lecturer.update({
        where: { id },
        data: {
          name: data.name,
          nidn: data.nidn,
          studyProgramId: data.studyProgramId
        }
      });

      if (data.name || data.email) {
        await tx.user.update({
          where: { id: lecturer.userId },
          data: {
            name: data.name,
            email: data.email
          }
        });
      }

      return tx.lecturer.findUniqueOrThrow({ where: { id }, include: { user: true, studyProgram: true } });
    });
  }
  deleteLecturer(id: string) { return this.prisma.lecturer.delete({ where: { id } }); }

  async createStudent(data: {
    universityId: string;
    studyProgramId: string;
    nim: string;
    name: string;
    email: string;
    status: string;
    currentSemester?: number;
    studentClassId?: string;
    studentStatusId?: string;
    studySystemId?: string;
    roleCode?: string;
    password?: string;
  }) {
    const roleCode = data.roleCode || 'MAHASISWA';
    const role = await this.prisma.role.findUniqueOrThrow({ where: { code: roleCode } });
    const passwordHash = await hash(data.password || 'Admin@12345', 10);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          universityId: data.universityId,
          roleId: role.id,
          name: data.name,
          email: data.email,
          passwordHash
        }
      });

      if (roleCode !== 'MAHASISWA') {
        const studentRole = await tx.role.findUnique({ where: { code: 'MAHASISWA' } });
        if (studentRole) {
          await tx.userRole.upsert({
            where: { userId_roleId: { userId: user.id, roleId: studentRole.id } },
            update: {},
            create: { userId: user.id, roleId: studentRole.id }
          });
        }
      }

      return tx.student.create({
        data: {
          userId: user.id,
          studyProgramId: data.studyProgramId,
          nim: data.nim,
          name: data.name,
          status: data.status,
          currentSemester: data.currentSemester,
          studentClassId: data.studentClassId,
          studentStatusId: data.studentStatusId,
          studySystemId: data.studySystemId
        },
        include: { user: true, studyProgram: true }
      });
    });
  }
  async updateStudent(
    id: string,
    data: {
      studyProgramId?: string;
      nim?: string;
      name?: string;
      email?: string;
      status?: string;
      currentSemester?: number;
      studentClassId?: string;
      studentStatusId?: string;
      studySystemId?: string;
    }
  ) {
    return this.prisma.$transaction(async (tx) => {
      const student = await tx.student.update({
        where: { id },
        data: {
          studyProgramId: data.studyProgramId,
          nim: data.nim,
          name: data.name,
          status: data.status,
          currentSemester: data.currentSemester,
          studentClassId: data.studentClassId,
          studentStatusId: data.studentStatusId,
          studySystemId: data.studySystemId
        }
      });

      if (data.name || data.email) {
        await tx.user.update({
          where: { id: student.userId },
          data: {
            name: data.name,
            email: data.email
          }
        });
      }

      return tx.student.findUniqueOrThrow({ where: { id }, include: { user: true, studyProgram: true } });
    });
  }
  deleteStudent(id: string) { return this.prisma.student.delete({ where: { id } }); }

  studySystems() { return this.prisma.studySystemRef.findMany(); }
  createStudySystem(data: { code: string; name: string }) { return this.prisma.studySystemRef.create({ data }); }
  updateStudySystem(id: string, data: { code?: string; name?: string }) { return this.prisma.studySystemRef.update({ where: { id }, data }); }
  deleteStudySystem(id: string) { return this.prisma.studySystemRef.delete({ where: { id } }); }

  studentClasses() { return this.prisma.studentClassRef.findMany(); }
  createStudentClass(data: { code: string; name: string }) { return this.prisma.studentClassRef.create({ data }); }
  updateStudentClass(id: string, data: { code?: string; name?: string }) { return this.prisma.studentClassRef.update({ where: { id }, data }); }
  deleteStudentClass(id: string) { return this.prisma.studentClassRef.delete({ where: { id } }); }

  studentStatuses() { return this.prisma.studentStatusRef.findMany(); }
  createStudentStatus(data: { code: string; name: string }) { return this.prisma.studentStatusRef.create({ data }); }
  updateStudentStatus(id: string, data: { code?: string; name?: string }) { return this.prisma.studentStatusRef.update({ where: { id }, data }); }
  deleteStudentStatus(id: string) { return this.prisma.studentStatusRef.delete({ where: { id } }); }

  degreeLevels() { return this.prisma.degreeLevelRef.findMany(); }
  createDegreeLevel(data: { code: string; name: string }) { return this.prisma.degreeLevelRef.create({ data }); }
  updateDegreeLevel(id: string, data: { code?: string; name?: string }) { return this.prisma.degreeLevelRef.update({ where: { id }, data }); }
  deleteDegreeLevel(id: string) { return this.prisma.degreeLevelRef.delete({ where: { id } }); }
}
