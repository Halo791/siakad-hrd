-- Manual SQL import for cPanel/phpMyAdmin.
-- Generated from apps/api/prisma/schema.prisma and prisma/seed.ts.
-- Demo login:
--   superadmin@siakad.local / Admin@12345
--   dosen1@siakad.local      / Admin@12345
--   mhs1@siakad.local        / Admin@12345
--   mhs2@siakad.local        / Admin@12345

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `University` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `University_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Role` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `User` (
  `id` VARCHAR(191) NOT NULL,
  `universityId` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `passwordHash` VARCHAR(191) NOT NULL,
  `refreshToken` TEXT NULL,
  `status` ENUM('ACTIVE','INACTIVE') NOT NULL DEFAULT 'ACTIVE',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_universityId_idx` (`universityId`),
  KEY `User_roleId_idx` (`roleId`),
  CONSTRAINT `User_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UserRole` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UserRole_userId_roleId_key` (`userId`, `roleId`),
  KEY `UserRole_roleId_idx` (`roleId`),
  CONSTRAINT `UserRole_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `UserRole_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Permission` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Permission_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RolePermission` (
  `id` VARCHAR(191) NOT NULL,
  `roleId` VARCHAR(191) NOT NULL,
  `permissionId` VARCHAR(191) NOT NULL,
  `canRead` BOOLEAN NOT NULL DEFAULT FALSE,
  `canInsert` BOOLEAN NOT NULL DEFAULT FALSE,
  `canUpdate` BOOLEAN NOT NULL DEFAULT FALSE,
  `canDelete` BOOLEAN NOT NULL DEFAULT FALSE,
  `canValidate` BOOLEAN NOT NULL DEFAULT FALSE,
  `canApprove` BOOLEAN NOT NULL DEFAULT FALSE,
  `canReject` BOOLEAN NOT NULL DEFAULT FALSE,
  `canPrint` BOOLEAN NOT NULL DEFAULT FALSE,
  `canExport` BOOLEAN NOT NULL DEFAULT FALSE,
  `canImport` BOOLEAN NOT NULL DEFAULT FALSE,
  `canGenerate` BOOLEAN NOT NULL DEFAULT FALSE,
  `canLock` BOOLEAN NOT NULL DEFAULT FALSE,
  `canUnlock` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `RolePermission_roleId_permissionId_key` (`roleId`, `permissionId`),
  KEY `RolePermission_permissionId_idx` (`permissionId`),
  CONSTRAINT `RolePermission_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `Role` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `RolePermission_permissionId_fkey` FOREIGN KEY (`permissionId`) REFERENCES `Permission` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Faculty` (
  `id` VARCHAR(191) NOT NULL,
  `universityId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `accreditation` VARCHAR(191) NULL,
  `leaderName` VARCHAR(191) NULL,
  `leaderPhone` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Faculty_universityId_code_key` (`universityId`, `code`),
  CONSTRAINT `Faculty_universityId_fkey` FOREIGN KEY (`universityId`) REFERENCES `University` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `DegreeLevelRef` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `DegreeLevelRef_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudyProgram` (
  `id` VARCHAR(191) NOT NULL,
  `facultyId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `degreeLevel` VARCHAR(191) NULL,
  `degreeLevelId` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudyProgram_facultyId_code_key` (`facultyId`, `code`),
  KEY `StudyProgram_degreeLevelId_idx` (`degreeLevelId`),
  CONSTRAINT `StudyProgram_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `Faculty` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StudyProgram_degreeLevelId_fkey` FOREIGN KEY (`degreeLevelId`) REFERENCES `DegreeLevelRef` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AcademicYear` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AcademicYear_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AcademicPeriod` (
  `id` VARCHAR(191) NOT NULL,
  `academicYearId` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `startDate` DATETIME(3) NOT NULL,
  `endDate` DATETIME(3) NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `AcademicPeriod_code_key` (`code`),
  KEY `AcademicPeriod_academicYearId_idx` (`academicYearId`),
  CONSTRAINT `AcademicPeriod_academicYearId_fkey` FOREIGN KEY (`academicYearId`) REFERENCES `AcademicYear` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudyProgramSetting` (
  `id` VARCHAR(191) NOT NULL,
  `studyProgramId` VARCHAR(191) NOT NULL,
  `periodId` VARCHAR(191) NOT NULL,
  `openKrs` BOOLEAN NOT NULL DEFAULT FALSE,
  `krsStartDate` DATETIME(3) NULL,
  `krsEndDate` DATETIME(3) NULL,
  `openKrsValidation` BOOLEAN NOT NULL DEFAULT FALSE,
  `openPrintKrs` BOOLEAN NOT NULL DEFAULT FALSE,
  `openPrintUts` BOOLEAN NOT NULL DEFAULT FALSE,
  `openPrintUas` BOOLEAN NOT NULL DEFAULT FALSE,
  `minAttendanceUts` DOUBLE NOT NULL DEFAULT 75,
  `minAttendanceUas` DOUBLE NOT NULL DEFAULT 75,
  `totalMeetings` INT NOT NULL DEFAULT 16,
  `allowLecturerGenerate` BOOLEAN NOT NULL DEFAULT TRUE,
  `allowLecturerEditGrade` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudyProgramSetting_studyProgramId_periodId_key` (`studyProgramId`, `periodId`),
  KEY `StudyProgramSetting_periodId_idx` (`periodId`),
  CONSTRAINT `StudyProgramSetting_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StudyProgramSetting_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `AcademicPeriod` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudySystemRef` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudySystemRef_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudentClassRef` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudentClassRef_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudentStatusRef` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StudentStatusRef_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Student` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `studyProgramId` VARCHAR(191) NOT NULL,
  `studentClassId` VARCHAR(191) NULL,
  `studentStatusId` VARCHAR(191) NULL,
  `studySystemId` VARCHAR(191) NULL,
  `nim` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `status` VARCHAR(191) NOT NULL,
  `currentSemester` INT NOT NULL DEFAULT 1,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Student_userId_key` (`userId`),
  UNIQUE KEY `Student_nim_key` (`nim`),
  KEY `Student_studyProgramId_idx` (`studyProgramId`),
  KEY `Student_studentClassId_idx` (`studentClassId`),
  KEY `Student_studentStatusId_idx` (`studentStatusId`),
  KEY `Student_studySystemId_idx` (`studySystemId`),
  CONSTRAINT `Student_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Student_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Student_studentClassId_fkey` FOREIGN KEY (`studentClassId`) REFERENCES `StudentClassRef` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Student_studentStatusId_fkey` FOREIGN KEY (`studentStatusId`) REFERENCES `StudentStatusRef` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Student_studySystemId_fkey` FOREIGN KEY (`studySystemId`) REFERENCES `StudySystemRef` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Lecturer` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `studyProgramId` VARCHAR(191) NULL,
  `nidn` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Lecturer_userId_key` (`userId`),
  UNIQUE KEY `Lecturer_nidn_key` (`nidn`),
  KEY `Lecturer_studyProgramId_idx` (`studyProgramId`),
  CONSTRAINT `Lecturer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Lecturer_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StructuralPosition` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `level` VARCHAR(191) NOT NULL,
  `description` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `StructuralPosition_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `LecturerStructuralPosition` (
  `id` VARCHAR(191) NOT NULL,
  `lecturerId` VARCHAR(191) NOT NULL,
  `positionId` VARCHAR(191) NOT NULL,
  `facultyId` VARCHAR(191) NULL,
  `studyProgramId` VARCHAR(191) NULL,
  `decreeNumber` VARCHAR(191) NULL,
  `startDate` DATETIME(3) NULL,
  `endDate` DATETIME(3) NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  KEY `LecturerStructuralPosition_lecturerId_isActive_idx` (`lecturerId`, `isActive`),
  KEY `LecturerStructuralPosition_positionId_isActive_idx` (`positionId`, `isActive`),
  KEY `LecturerStructuralPosition_facultyId_idx` (`facultyId`),
  KEY `LecturerStructuralPosition_studyProgramId_idx` (`studyProgramId`),
  CONSTRAINT `LecturerStructuralPosition_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `Lecturer` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `LecturerStructuralPosition_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `StructuralPosition` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `LecturerStructuralPosition_facultyId_fkey` FOREIGN KEY (`facultyId`) REFERENCES `Faculty` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `LecturerStructuralPosition_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudentParent` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `relation` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  PRIMARY KEY (`id`),
  KEY `StudentParent_studentId_idx` (`studentId`),
  CONSTRAINT `StudentParent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Curriculum` (
  `id` VARCHAR(191) NOT NULL,
  `studyProgramId` VARCHAR(191) NOT NULL,
  `year` INT NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Curriculum_studyProgramId_idx` (`studyProgramId`),
  CONSTRAINT `Curriculum_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Course` (
  `id` VARCHAR(191) NOT NULL,
  `code` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `sks` INT NOT NULL,
  `minPassingGrade` VARCHAR(191) NOT NULL,
  `isMandatory` BOOLEAN NOT NULL DEFAULT TRUE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Course_code_key` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CurriculumCourse` (
  `id` VARCHAR(191) NOT NULL,
  `curriculumId` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `semester` INT NOT NULL,
  `isPackage` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  UNIQUE KEY `CurriculumCourse_curriculumId_courseId_key` (`curriculumId`, `courseId`),
  KEY `CurriculumCourse_courseId_idx` (`courseId`),
  CONSTRAINT `CurriculumCourse_curriculumId_fkey` FOREIGN KEY (`curriculumId`) REFERENCES `Curriculum` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `CurriculumCourse_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CoursePrerequisite` (
  `id` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `prerequisiteCourseId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CoursePrerequisite_courseId_idx` (`courseId`),
  KEY `CoursePrerequisite_prerequisiteCourseId_idx` (`prerequisiteCourseId`),
  CONSTRAINT `CoursePrerequisite_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `CoursePrerequisite_prerequisiteCourseId_fkey` FOREIGN KEY (`prerequisiteCourseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `CourseEquivalence` (
  `id` VARCHAR(191) NOT NULL,
  `fromCourseId` VARCHAR(191) NOT NULL,
  `toCourseId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `CourseEquivalence_fromCourseId_idx` (`fromCourseId`),
  KEY `CourseEquivalence_toCourseId_idx` (`toCourseId`),
  CONSTRAINT `CourseEquivalence_fromCourseId_fkey` FOREIGN KEY (`fromCourseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `CourseEquivalence_toCourseId_fkey` FOREIGN KEY (`toCourseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `GradingScale` (
  `id` VARCHAR(191) NOT NULL,
  `letter` VARCHAR(191) NOT NULL,
  `minValue` DOUBLE NOT NULL,
  `maxValue` DOUBLE NOT NULL,
  `gradePoint` DOUBLE NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `GradeComponent` (
  `id` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `percentage` DOUBLE NOT NULL,
  `classId` VARCHAR(191) NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Class` (
  `id` VARCHAR(191) NOT NULL,
  `studyProgramId` VARCHAR(191) NOT NULL,
  `courseId` VARCHAR(191) NOT NULL,
  `periodId` VARCHAR(191) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `capacity` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Class_studyProgramId_idx` (`studyProgramId`),
  KEY `Class_courseId_idx` (`courseId`),
  KEY `Class_periodId_idx` (`periodId`),
  CONSTRAINT `Class_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Class_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Class_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `AcademicPeriod` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ClassSchedule` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `dayOfWeek` INT NOT NULL,
  `startTime` VARCHAR(191) NOT NULL,
  `endTime` VARCHAR(191) NOT NULL,
  `room` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `ClassSchedule_classId_idx` (`classId`),
  CONSTRAINT `ClassSchedule_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ClassLecturer` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `lecturerId` VARCHAR(191) NOT NULL,
  `isPrimary` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `ClassLecturer_classId_idx` (`classId`),
  KEY `ClassLecturer_lecturerId_idx` (`lecturerId`),
  CONSTRAINT `ClassLecturer_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ClassLecturer_lecturerId_fkey` FOREIGN KEY (`lecturerId`) REFERENCES `Lecturer` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `ClassStudent` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `ClassStudent_classId_studentId_key` (`classId`, `studentId`),
  KEY `ClassStudent_studentId_idx` (`studentId`),
  CONSTRAINT `ClassStudent_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `ClassStudent_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Meeting` (
  `id` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  `meetingNo` INT NOT NULL,
  `meetingDate` DATETIME(3) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Meeting_classId_idx` (`classId`),
  CONSTRAINT `Meeting_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Attendance` (
  `id` VARCHAR(191) NOT NULL,
  `meetingId` VARCHAR(191) NOT NULL,
  `classStudentId` VARCHAR(191) NOT NULL,
  `status` ENUM('PRESENT','PERMIT','SICK','ABSENT') NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Attendance_meetingId_idx` (`meetingId`),
  KEY `Attendance_classStudentId_idx` (`classStudentId`),
  CONSTRAINT `Attendance_meetingId_fkey` FOREIGN KEY (`meetingId`) REFERENCES `Meeting` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Attendance_classStudentId_fkey` FOREIGN KEY (`classStudentId`) REFERENCES `ClassStudent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudyPlan` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `periodId` VARCHAR(191) NOT NULL,
  `status` ENUM('DRAFT','SUBMITTED','APPROVED','REJECTED','CANCELED') NOT NULL DEFAULT 'DRAFT',
  PRIMARY KEY (`id`),
  KEY `StudyPlan_studentId_idx` (`studentId`),
  KEY `StudyPlan_periodId_idx` (`periodId`),
  CONSTRAINT `StudyPlan_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StudyPlan_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `AcademicPeriod` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudyPlanItem` (
  `id` VARCHAR(191) NOT NULL,
  `studyPlanId` VARCHAR(191) NOT NULL,
  `classId` VARCHAR(191) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `StudyPlanItem_studyPlanId_idx` (`studyPlanId`),
  KEY `StudyPlanItem_classId_idx` (`classId`),
  CONSTRAINT `StudyPlanItem_studyPlanId_fkey` FOREIGN KEY (`studyPlanId`) REFERENCES `StudyPlan` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `StudyPlanItem_classId_fkey` FOREIGN KEY (`classId`) REFERENCES `Class` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Grade` (
  `id` VARCHAR(191) NOT NULL,
  `classStudentId` VARCHAR(191) NOT NULL,
  `score` DOUBLE NOT NULL,
  `letter` VARCHAR(191) NOT NULL,
  `isLocked` BOOLEAN NOT NULL DEFAULT FALSE,
  PRIMARY KEY (`id`),
  KEY `Grade_classStudentId_idx` (`classStudentId`),
  CONSTRAINT `Grade_classStudentId_fkey` FOREIGN KEY (`classStudentId`) REFERENCES `ClassStudent` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Transcript` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `gpa` DOUBLE NOT NULL,
  `totalSks` INT NOT NULL,
  PRIMARY KEY (`id`),
  KEY `Transcript_studentId_idx` (`studentId`),
  CONSTRAINT `Transcript_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AcademicAdvisor` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `lecturerId` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `Consultation` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `lecturerId` VARCHAR(191) NOT NULL, `message` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `Bill` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `amount` DOUBLE NOT NULL, `type` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `Payment` (`id` VARCHAR(191) NOT NULL, `billId` VARCHAR(191) NOT NULL, `amount` DOUBLE NOT NULL, `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), `method` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `VirtualAccount` (`id` VARCHAR(191) NOT NULL, `billId` VARCHAR(191) NOT NULL, `vaNumber` VARCHAR(191) NOT NULL, `provider` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `VirtualAccount_vaNumber_key` (`vaNumber`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `UktGroup` (`id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `UktGroup_code_key` (`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `UktRate` (`id` VARCHAR(191) NOT NULL, `uktGroupId` VARCHAR(191) NOT NULL, `studyProgramId` VARCHAR(191) NOT NULL, `amount` DOUBLE NOT NULL, PRIMARY KEY (`id`), KEY `UktRate_uktGroupId_idx` (`uktGroupId`), KEY `UktRate_studyProgramId_idx` (`studyProgramId`), CONSTRAINT `UktRate_uktGroupId_fkey` FOREIGN KEY (`uktGroupId`) REFERENCES `UktGroup` (`id`) ON UPDATE CASCADE, CONSTRAINT `UktRate_studyProgramId_fkey` FOREIGN KEY (`studyProgramId`) REFERENCES `StudyProgram` (`id`) ON UPDATE CASCADE) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AdmissionPeriod` (`id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `startDate` DATETIME(3) NOT NULL, `endDate` DATETIME(3) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `AdmissionPeriod_code_key` (`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `Applicant` (`id` VARCHAR(191) NOT NULL, `admissionPeriodId` VARCHAR(191) NOT NULL, `registrationNo` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `Applicant_registrationNo_key` (`registrationNo`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `ApplicantDocument` (`id` VARCHAR(191) NOT NULL, `applicantId` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `fileUrl` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `SelectionRequirement` (`id` VARCHAR(191) NOT NULL, `admissionPeriodId` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `minScore` DOUBLE NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `SelectionScore` (`id` VARCHAR(191) NOT NULL, `applicantId` VARCHAR(191) NOT NULL, `selectionRequirementId` VARCHAR(191) NOT NULL, `score` DOUBLE NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `FinalProject` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `title` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `FinalProjectGuidance` (`id` VARCHAR(191) NOT NULL, `finalProjectId` VARCHAR(191) NOT NULL, `lecturerId` VARCHAR(191) NOT NULL, `notes` VARCHAR(191) NOT NULL, `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `FinalProjectExam` (`id` VARCHAR(191) NOT NULL, `finalProjectId` VARCHAR(191) NOT NULL, `examDate` DATETIME(3) NOT NULL, `score` DOUBLE NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `LeaveRequest` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `periodId` VARCHAR(191) NOT NULL, `reason` VARCHAR(191) NOT NULL, `status` ENUM('SUBMITTED','PROCESS_PA','PROCESS_KAPRODI','PROCESS_DEKAN','APPROVED','REJECTED') NOT NULL DEFAULT 'SUBMITTED', PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Questionnaire` (`id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `periodId` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `Questionnaire_code_key` (`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `QuestionnaireQuestion` (`id` VARCHAR(191) NOT NULL, `questionnaireId` VARCHAR(191) NOT NULL, `type` VARCHAR(191) NOT NULL, `question` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `QuestionnaireAnswer` (`id` VARCHAR(191) NOT NULL, `questionnaireQuestionId` VARCHAR(191) NOT NULL, `answerText` VARCHAR(191) NOT NULL, `score` DOUBLE NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `QuestionnaireResponse` (`id` VARCHAR(191) NOT NULL, `questionnaireId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `submittedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3), PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `GraduationPeriod` (`id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `GraduationPeriod_code_key` (`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `GraduationStudent` (`id` VARCHAR(191) NOT NULL, `graduationPeriodId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `CommencementPeriod` (`id` VARCHAR(191) NOT NULL, `code` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`), UNIQUE KEY `CommencementPeriod_code_key` (`code`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `CommencementStudent` (`id` VARCHAR(191) NOT NULL, `commencementPeriodId` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `status` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudentActivity` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `name` VARCHAR(191) NOT NULL, `category` VARCHAR(191) NOT NULL, `score` DOUBLE NULL, `isShownInSkpi` BOOLEAN NOT NULL DEFAULT FALSE, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `MbkmActivity` (`id` VARCHAR(191) NOT NULL, `studentId` VARCHAR(191) NOT NULL, `type` VARCHAR(191) NOT NULL, `partner` VARCHAR(191) NOT NULL, `semester` VARCHAR(191) NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
CREATE TABLE IF NOT EXISTS `MbkmConversion` (`id` VARCHAR(191) NOT NULL, `mbkmActivityId` VARCHAR(191) NOT NULL, `courseId` VARCHAR(191) NOT NULL, `convertedScore` DOUBLE NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `Khs` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `periodId` VARCHAR(191) NOT NULL,
  `ips` DOUBLE NOT NULL,
  `ipk` DOUBLE NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Khs_studentId_periodId_key` (`studentId`, `periodId`),
  KEY `Khs_periodId_idx` (`periodId`),
  CONSTRAINT `Khs_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE,
  CONSTRAINT `Khs_periodId_fkey` FOREIGN KEY (`periodId`) REFERENCES `AcademicPeriod` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `AuditLog` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NOT NULL,
  `metadata` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `AuditLog_userId_idx` (`userId`),
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `StudentDocument` (
  `id` VARCHAR(191) NOT NULL,
  `studentId` VARCHAR(191) NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `fileName` VARCHAR(191) NOT NULL,
  `filePath` VARCHAR(191) NOT NULL,
  `uploadedBy` VARCHAR(191) NULL,
  `uploadedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `StudentDocument_studentId_idx` (`studentId`),
  CONSTRAINT `StudentDocument_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `Student` (`id`) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `RecordAttachment` (
  `id` VARCHAR(191) NOT NULL,
  `entityTable` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NOT NULL,
  `title` VARCHAR(191) NOT NULL,
  `imageUrl` VARCHAR(500) NOT NULL,
  `createdAt` DATETIME NULL,
  PRIMARY KEY (`id`),
  KEY `RecordAttachment_entity_idx` (`entityTable`, `entityId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

INSERT INTO `University` (`id`, `code`, `name`) VALUES
('univ01', 'UNIV01', 'Universitas Contoh Nusantara')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `Role` (`id`, `code`, `name`) VALUES
('role_super_admin','SUPER_ADMIN','Super Admin'),
('role_admin_universitas','ADMIN_UNIVERSITAS','Admin Universitas'),
('role_admin_fakultas','ADMIN_FAKULTAS','Admin Fakultas'),
('role_admin_prodi','ADMIN_PRODI','Admin Prodi'),
('role_admin_akademik','ADMIN_AKADEMIK','Admin Akademik'),
('role_admin_pmb','ADMIN_PMB','Admin PMB'),
('role_admin_keuangan','ADMIN_KEUANGAN','Admin Keuangan'),
('role_dosen','DOSEN','Dosen'),
('role_dosen_pa','DOSEN_PA','Dosen Pembimbing Akademik'),
('role_kaprodi','KAPRODI','Kaprodi'),
('role_dekan','DEKAN','Dekan'),
('role_mahasiswa','MAHASISWA','Mahasiswa'),
('role_orang_tua','ORANG_TUA','Orang Tua'),
('role_alumni','ALUMNI','Alumni')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `Permission` (`id`, `code`, `name`) VALUES
('perm_master_faculty','MASTER_FACULTY','Master Fakultas'),
('perm_master_study_program','MASTER_STUDY_PROGRAM','Master Prodi'),
('perm_master_period','MASTER_PERIOD','Master Periode'),
('perm_curriculum','CURRICULUM','Kurikulum'),
('perm_course','COURSE','Mata Kuliah'),
('perm_class','CLASS','Kelas Kuliah'),
('perm_krs','KRS','KRS'),
('perm_grade','GRADE','Nilai'),
('perm_khs','KHS','KHS'),
('perm_transcript','TRANSCRIPT','Transkrip'),
('perm_document','DOCUMENT','Dokumen Akademik'),
('perm_setting_prodi','SETTING_PRODI','Setting Prodi')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `RolePermission` (`id`, `roleId`, `permissionId`, `canRead`, `canInsert`, `canUpdate`, `canDelete`, `canValidate`, `canApprove`, `canReject`, `canPrint`, `canExport`, `canImport`, `canGenerate`, `canLock`, `canUnlock`)
SELECT CONCAT('rp_', r.`code`, '_', p.`code`), r.`id`, p.`id`, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1
FROM `Role` r
JOIN `Permission` p
WHERE r.`code` = 'SUPER_ADMIN'
   OR (r.`code` = 'ADMIN_UNIVERSITAS' AND p.`code` IN ('MASTER_FACULTY','MASTER_STUDY_PROGRAM','MASTER_PERIOD','SETTING_PRODI'))
   OR (r.`code` = 'ADMIN_FAKULTAS' AND p.`code` IN ('MASTER_STUDY_PROGRAM','MASTER_PERIOD','SETTING_PRODI'))
   OR (r.`code` = 'ADMIN_PRODI' AND p.`code` IN ('CURRICULUM','COURSE','CLASS','SETTING_PRODI','KRS'))
   OR (r.`code` = 'ADMIN_AKADEMIK' AND p.`code` IN ('KRS','GRADE','KHS','TRANSCRIPT','SETTING_PRODI'))
   OR (r.`code` = 'ADMIN_PMB' AND p.`code` IN ('DOCUMENT'))
   OR (r.`code` = 'ADMIN_KEUANGAN' AND p.`code` IN ('MASTER_PERIOD'))
   OR (r.`code` = 'DOSEN' AND p.`code` IN ('GRADE','KRS'))
   OR (r.`code` = 'DOSEN_PA' AND p.`code` IN ('KRS'))
   OR (r.`code` = 'KAPRODI' AND p.`code` IN ('KRS','CURRICULUM','CLASS'))
   OR (r.`code` = 'DEKAN' AND p.`code` IN ('KRS','KHS','TRANSCRIPT'))
   OR (r.`code` = 'MAHASISWA' AND p.`code` IN ('DOCUMENT'))
   OR (r.`code` = 'ORANG_TUA' AND p.`code` IN ('TRANSCRIPT'))
   OR (r.`code` = 'ALUMNI' AND p.`code` IN ('TRANSCRIPT'))
ON DUPLICATE KEY UPDATE `canRead` = VALUES(`canRead`);

INSERT INTO `DegreeLevelRef` (`id`, `code`, `name`) VALUES ('degree_s1','S1','Sarjana (S1)') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `Faculty` (`id`, `universityId`, `code`, `name`, `accreditation`, `leaderName`, `leaderPhone`) VALUES ('faculty_fti','univ01','FTI','Fakultas Teknologi Informasi','Baik Sekali','Dr. Rina Puspitasari, M.Kom.','0812-1100-2200') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `StudyProgram` (`id`, `facultyId`, `code`, `name`, `degreeLevel`, `degreeLevelId`) VALUES ('prodi_if','faculty_fti','IF','Informatika','S1','degree_s1') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `AcademicYear` (`id`, `code`, `name`) VALUES ('year_2026_2027','2026/2027','Tahun Ajaran 2026/2027') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `AcademicPeriod` (`id`, `academicYearId`, `code`, `name`, `startDate`, `endDate`, `isActive`) VALUES ('period_2026_ganjil','year_2026_2027','2026-GANJIL','Ganjil 2026/2027','2026-08-01 00:00:00.000','2026-12-31 00:00:00.000',1) ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `User` (`id`, `universityId`, `roleId`, `name`, `email`, `passwordHash`, `status`) VALUES
('user_super_admin','univ01','role_super_admin','Super Admin','superadmin@siakad.local','$2b$10$YFng/Qczy49DvFtgqtdHK.fWudTBEZMiYrBnL5.ifWeq2Th7UvdI.','ACTIVE'),
('user_dosen1','univ01','role_dosen','Dosen Satu','dosen1@siakad.local','$2b$10$YFng/Qczy49DvFtgqtdHK.fWudTBEZMiYrBnL5.ifWeq2Th7UvdI.','ACTIVE'),
('user_mhs1','univ01','role_mahasiswa','Mahasiswa Satu','mhs1@siakad.local','$2b$10$YFng/Qczy49DvFtgqtdHK.fWudTBEZMiYrBnL5.ifWeq2Th7UvdI.','ACTIVE'),
('user_mhs2','univ01','role_mahasiswa','Mahasiswa Dua','mhs2@siakad.local','$2b$10$YFng/Qczy49DvFtgqtdHK.fWudTBEZMiYrBnL5.ifWeq2Th7UvdI.','ACTIVE')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `UserRole` (`id`, `userId`, `roleId`) VALUES ('userrole_dosen_pa','user_dosen1','role_dosen_pa') ON DUPLICATE KEY UPDATE `roleId` = VALUES(`roleId`);
INSERT INTO `Lecturer` (`id`, `userId`, `studyProgramId`, `nidn`, `name`) VALUES ('lecturer_dosen1','user_dosen1','prodi_if','00112233','Dosen Satu') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `StructuralPosition` (`id`, `code`, `name`, `level`) VALUES
('pos_rektor','REKTOR','Rektor','UNIVERSITAS'),
('pos_wakil_rektor','WAKIL_REKTOR','Wakil Rektor','UNIVERSITAS'),
('pos_dekan','DEKAN','Dekan','FAKULTAS'),
('pos_wakil_dekan','WAKIL_DEKAN','Wakil Dekan','FAKULTAS'),
('pos_kaprodi','KAPRODI','Ketua Program Studi','PRODI'),
('pos_sekprodi','SEKPRODI','Sekretaris Program Studi','PRODI'),
('pos_ketua_lpm','KETUA_LPM','Ketua LPM','UNIVERSITAS')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `LecturerStructuralPosition` (`id`, `lecturerId`, `positionId`, `facultyId`, `studyProgramId`, `decreeNumber`, `startDate`, `isActive`) VALUES ('lecturer_structural_kaprodi_if','lecturer_dosen1','pos_kaprodi','faculty_fti','prodi_if','SK-KAPRODI-IF-2026','2026-01-01 00:00:00.000',1) ON DUPLICATE KEY UPDATE `isActive` = VALUES(`isActive`);

INSERT INTO `StudySystemRef` (`id`, `code`, `name`) VALUES ('study_system_reg','REG','Reguler') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `StudentClassRef` (`id`, `code`, `name`) VALUES ('student_class_a','A','Kelas A') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `StudentStatusRef` (`id`, `code`, `name`) VALUES ('student_status_aktif','AKTIF','Aktif') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `Student` (`id`, `userId`, `studyProgramId`, `studentClassId`, `studentStatusId`, `studySystemId`, `nim`, `name`, `status`, `currentSemester`) VALUES
('student_mhs1','user_mhs1','prodi_if','student_class_a','student_status_aktif','study_system_reg','20260001','Mahasiswa Satu','AKTIF',1),
('student_mhs2','user_mhs2','prodi_if',NULL,NULL,NULL,'20260002','Mahasiswa Dua','AKTIF',3)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `StudentParent` (`id`, `studentId`, `name`, `relation`, `phone`) VALUES ('parent_mhs1','student_mhs1','Orang Tua Mhs 1','Ayah','081200000001') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `Course` (`id`, `code`, `name`, `sks`, `minPassingGrade`, `isMandatory`) VALUES
('course_if101','IF101','Algoritma dan Pemrograman',3,'C',1),
('course_if102','IF102','Struktur Data',3,'C',1),
('course_if103','IF103','Basis Data',3,'C',1)
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

INSERT INTO `Curriculum` (`id`, `studyProgramId`, `year`, `name`) VALUES ('curriculum_2026_if','prodi_if',2026,'Kurikulum 2026') ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);
INSERT INTO `CurriculumCourse` (`id`, `curriculumId`, `courseId`, `semester`, `isPackage`) VALUES
('curcourse_if101','curriculum_2026_if','course_if101',1,0),
('curcourse_if103','curriculum_2026_if','course_if103',1,0),
('curcourse_if102','curriculum_2026_if','course_if102',2,0)
ON DUPLICATE KEY UPDATE `semester` = VALUES(`semester`);
INSERT INTO `CoursePrerequisite` (`id`, `courseId`, `prerequisiteCourseId`) VALUES ('prereq_if102_if101','course_if102','course_if101') ON DUPLICATE KEY UPDATE `courseId` = VALUES(`courseId`);

INSERT INTO `Class` (`id`, `studyProgramId`, `courseId`, `periodId`, `name`, `capacity`) VALUES
('cls_algo_2026_ganjil','prodi_if','course_if101','period_2026_ganjil','A',40),
('cls_struktur_2026_ganjil','prodi_if','course_if102','period_2026_ganjil','A',40),
('cls_basis_2026_ganjil','prodi_if','course_if103','period_2026_ganjil','A',40)
ON DUPLICATE KEY UPDATE `capacity` = VALUES(`capacity`);

DELETE FROM `ClassSchedule` WHERE `classId` IN ('cls_algo_2026_ganjil','cls_struktur_2026_ganjil','cls_basis_2026_ganjil');
INSERT INTO `ClassSchedule` (`id`, `classId`, `dayOfWeek`, `startTime`, `endTime`, `room`) VALUES
('schedule_algo','cls_algo_2026_ganjil',1,'08:00','10:00','R101'),
('schedule_struktur','cls_struktur_2026_ganjil',3,'08:00','10:00','R102'),
('schedule_basis','cls_basis_2026_ganjil',1,'08:00','10:00','R103');

INSERT INTO `ClassLecturer` (`id`, `classId`, `lecturerId`, `isPrimary`) VALUES
('cl_lect_algo','cls_algo_2026_ganjil','lecturer_dosen1',1),
('cl_lect_basis','cls_basis_2026_ganjil','lecturer_dosen1',1),
('cl_lect_struktur','cls_struktur_2026_ganjil','lecturer_dosen1',1)
ON DUPLICATE KEY UPDATE `isPrimary` = VALUES(`isPrimary`);

INSERT INTO `ClassStudent` (`id`, `classId`, `studentId`) VALUES
('class_student_algo_mhs1','cls_algo_2026_ganjil','student_mhs1'),
('class_student_struktur_mhs1','cls_struktur_2026_ganjil','student_mhs1'),
('class_student_struktur_mhs2','cls_struktur_2026_ganjil','student_mhs2'),
('class_student_algo_mhs2','cls_algo_2026_ganjil','student_mhs2'),
('class_student_basis_mhs2','cls_basis_2026_ganjil','student_mhs2')
ON DUPLICATE KEY UPDATE `studentId` = VALUES(`studentId`);

INSERT INTO `StudyPlan` (`id`, `studentId`, `periodId`, `status`) VALUES
('krs_mhs1_2026_ganjil','student_mhs1','period_2026_ganjil','DRAFT'),
('krs_mhs2_prereq_fail','student_mhs2','period_2026_ganjil','DRAFT'),
('krs_mhs2_conflict','student_mhs2','period_2026_ganjil','DRAFT')
ON DUPLICATE KEY UPDATE `status` = VALUES(`status`);

INSERT INTO `StudyPlanItem` (`id`, `studyPlanId`, `classId`) VALUES
('krs_item_algo','krs_mhs1_2026_ganjil','cls_algo_2026_ganjil'),
('krs_item_mhs2_struktur','krs_mhs2_prereq_fail','cls_struktur_2026_ganjil'),
('krs_item_mhs2_algo','krs_mhs2_conflict','cls_algo_2026_ganjil'),
('krs_item_mhs2_basis','krs_mhs2_conflict','cls_basis_2026_ganjil')
ON DUPLICATE KEY UPDATE `classId` = VALUES(`classId`);

INSERT INTO `StudyProgramSetting` (`id`, `studyProgramId`, `periodId`, `openKrs`, `krsStartDate`, `krsEndDate`, `openKrsValidation`, `openPrintKrs`, `openPrintUts`, `openPrintUas`, `minAttendanceUts`, `minAttendanceUas`, `totalMeetings`, `allowLecturerGenerate`, `allowLecturerEditGrade`) VALUES
('setting_if_2026_ganjil','prodi_if','period_2026_ganjil',1,'2026-01-01 00:00:00.000','2026-12-31 00:00:00.000',1,1,1,1,75,75,16,1,0)
ON DUPLICATE KEY UPDATE `openKrs` = VALUES(`openKrs`);

INSERT INTO `Grade` (`id`, `classStudentId`, `score`, `letter`, `isLocked`) VALUES ('grade_algo_mhs1','class_student_algo_mhs1',85,'A',1) ON DUPLICATE KEY UPDATE `score` = VALUES(`score`);
INSERT INTO `Transcript` (`id`, `studentId`, `gpa`, `totalSks`) VALUES ('transcript_mhs1','student_mhs1',3.4,3) ON DUPLICATE KEY UPDATE `gpa` = VALUES(`gpa`);

SET FOREIGN_KEY_CHECKS = 1;

-- Demo accounts use password: Admin@12345
