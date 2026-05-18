import { INestApplication, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { randomUUID } from 'crypto';
import * as mysql from 'mysql2/promise';
import { Pool, PoolConnection, RowDataPacket } from 'mysql2/promise';

type Queryable = Pool | PoolConnection;
type Direction = 'asc' | 'desc';
type ModelName =
  | 'academicAdvisor'
  | 'academicPeriod'
  | 'academicYear'
  | 'auditLog'
  | 'bill'
  | 'class'
  | 'classLecturer'
  | 'classSchedule'
  | 'classStudent'
  | 'consultation'
  | 'course'
  | 'coursePrerequisite'
  | 'curriculum'
  | 'curriculumCourse'
  | 'degreeLevelRef'
  | 'faculty'
  | 'grade'
  | 'khs'
  | 'lecturer'
  | 'lecturerStructuralPosition'
  | 'mbkmActivity'
  | 'mbkmConversion'
  | 'payment'
  | 'permission'
  | 'role'
  | 'rolePermission'
  | 'student'
  | 'studentActivity'
  | 'studentClassRef'
  | 'studentDocument'
  | 'studentParent'
  | 'studentStatusRef'
  | 'studyPlan'
  | 'studyPlanItem'
  | 'studyProgram'
  | 'studyProgramSetting'
  | 'studySystemRef'
  | 'structuralPosition'
  | 'transcript'
  | 'university'
  | 'user'
  | 'userRole'
  | 'virtualAccount';

type Relation = {
  model: ModelName;
  type: 'one' | 'many';
  localKey: string;
  foreignKey: string;
};

type ModelMeta = {
  table: string;
  relations: Record<string, Relation>;
};

type FindArgs = {
  where?: Record<string, any>;
  include?: Record<string, any>;
  select?: Record<string, any>;
  orderBy?: any;
  take?: number;
  skip?: number;
};

const MODEL: Record<ModelName, ModelMeta> = {
  academicAdvisor: { table: 'AcademicAdvisor', relations: {} },
  academicPeriod: {
    table: 'AcademicPeriod',
    relations: {
      academicYear: { model: 'academicYear', type: 'one', localKey: 'academicYearId', foreignKey: 'id' },
      khs: { model: 'khs', type: 'many', localKey: 'id', foreignKey: 'periodId' },
      studyPlans: { model: 'studyPlan', type: 'many', localKey: 'id', foreignKey: 'periodId' }
    }
  },
  academicYear: {
    table: 'AcademicYear',
    relations: {
      periods: { model: 'academicPeriod', type: 'many', localKey: 'id', foreignKey: 'academicYearId' }
    }
  },
  auditLog: {
    table: 'AuditLog',
    relations: {
      user: { model: 'user', type: 'one', localKey: 'userId', foreignKey: 'id' }
    }
  },
  bill: {
    table: 'Bill',
    relations: {
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' },
      payments: { model: 'payment', type: 'many', localKey: 'id', foreignKey: 'billId' },
      virtualAccounts: { model: 'virtualAccount', type: 'many', localKey: 'id', foreignKey: 'billId' }
    }
  },
  class: {
    table: 'Class',
    relations: {
      course: { model: 'course', type: 'one', localKey: 'courseId', foreignKey: 'id' },
      period: { model: 'academicPeriod', type: 'one', localKey: 'periodId', foreignKey: 'id' },
      schedules: { model: 'classSchedule', type: 'many', localKey: 'id', foreignKey: 'classId' },
      lecturers: { model: 'classLecturer', type: 'many', localKey: 'id', foreignKey: 'classId' },
      classStudents: { model: 'classStudent', type: 'many', localKey: 'id', foreignKey: 'classId' },
      students: { model: 'classStudent', type: 'many', localKey: 'id', foreignKey: 'classId' },
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' }
    }
  },
  classLecturer: {
    table: 'ClassLecturer',
    relations: {
      class: { model: 'class', type: 'one', localKey: 'classId', foreignKey: 'id' },
      lecturer: { model: 'lecturer', type: 'one', localKey: 'lecturerId', foreignKey: 'id' }
    }
  },
  classSchedule: {
    table: 'ClassSchedule',
    relations: {
      class: { model: 'class', type: 'one', localKey: 'classId', foreignKey: 'id' }
    }
  },
  classStudent: {
    table: 'ClassStudent',
    relations: {
      class: { model: 'class', type: 'one', localKey: 'classId', foreignKey: 'id' },
      grades: { model: 'grade', type: 'many', localKey: 'id', foreignKey: 'classStudentId' },
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  consultation: {
    table: 'Consultation',
    relations: {
      lecturer: { model: 'lecturer', type: 'one', localKey: 'lecturerId', foreignKey: 'id' },
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  course: {
    table: 'Course',
    relations: {
      classes: { model: 'class', type: 'many', localKey: 'id', foreignKey: 'courseId' },
      prerequisites: { model: 'coursePrerequisite', type: 'many', localKey: 'id', foreignKey: 'courseId' }
    }
  },
  coursePrerequisite: {
    table: 'CoursePrerequisite',
    relations: {
      course: { model: 'course', type: 'one', localKey: 'courseId', foreignKey: 'id' },
      prerequisiteCourse: { model: 'course', type: 'one', localKey: 'prerequisiteCourseId', foreignKey: 'id' }
    }
  },
  curriculum: {
    table: 'Curriculum',
    relations: {
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' }
    }
  },
  curriculumCourse: {
    table: 'CurriculumCourse',
    relations: {
      course: { model: 'course', type: 'one', localKey: 'courseId', foreignKey: 'id' },
      curriculum: { model: 'curriculum', type: 'one', localKey: 'curriculumId', foreignKey: 'id' }
    }
  },
  degreeLevelRef: { table: 'DegreeLevelRef', relations: {} },
  faculty: {
    table: 'Faculty',
    relations: {
      studyPrograms: { model: 'studyProgram', type: 'many', localKey: 'id', foreignKey: 'facultyId' },
      university: { model: 'university', type: 'one', localKey: 'universityId', foreignKey: 'id' }
    }
  },
  grade: {
    table: 'Grade',
    relations: {
      classStudent: { model: 'classStudent', type: 'one', localKey: 'classStudentId', foreignKey: 'id' }
    }
  },
  khs: {
    table: 'Khs',
    relations: {
      period: { model: 'academicPeriod', type: 'one', localKey: 'periodId', foreignKey: 'id' },
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  lecturer: {
    table: 'Lecturer',
    relations: {
      classLinks: { model: 'classLecturer', type: 'many', localKey: 'id', foreignKey: 'lecturerId' },
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' },
      structuralPositions: { model: 'lecturerStructuralPosition', type: 'many', localKey: 'id', foreignKey: 'lecturerId' },
      user: { model: 'user', type: 'one', localKey: 'userId', foreignKey: 'id' }
    }
  },
  lecturerStructuralPosition: {
    table: 'LecturerStructuralPosition',
    relations: {
      faculty: { model: 'faculty', type: 'one', localKey: 'facultyId', foreignKey: 'id' },
      lecturer: { model: 'lecturer', type: 'one', localKey: 'lecturerId', foreignKey: 'id' },
      position: { model: 'structuralPosition', type: 'one', localKey: 'positionId', foreignKey: 'id' },
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' }
    }
  },
  mbkmActivity: {
    table: 'MbkmActivity',
    relations: {
      conversions: { model: 'mbkmConversion', type: 'many', localKey: 'id', foreignKey: 'mbkmActivityId' },
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  mbkmConversion: {
    table: 'MbkmConversion',
    relations: {
      activity: { model: 'mbkmActivity', type: 'one', localKey: 'mbkmActivityId', foreignKey: 'id' },
      course: { model: 'course', type: 'one', localKey: 'courseId', foreignKey: 'id' }
    }
  },
  payment: {
    table: 'Payment',
    relations: {
      bill: { model: 'bill', type: 'one', localKey: 'billId', foreignKey: 'id' }
    }
  },
  permission: {
    table: 'Permission',
    relations: {
      rolePermissions: { model: 'rolePermission', type: 'many', localKey: 'id', foreignKey: 'permissionId' }
    }
  },
  role: {
    table: 'Role',
    relations: {
      rolePermissions: { model: 'rolePermission', type: 'many', localKey: 'id', foreignKey: 'roleId' },
      userRoles: { model: 'userRole', type: 'many', localKey: 'id', foreignKey: 'roleId' },
      users: { model: 'user', type: 'many', localKey: 'id', foreignKey: 'roleId' }
    }
  },
  rolePermission: {
    table: 'RolePermission',
    relations: {
      permission: { model: 'permission', type: 'one', localKey: 'permissionId', foreignKey: 'id' },
      role: { model: 'role', type: 'one', localKey: 'roleId', foreignKey: 'id' }
    }
  },
  student: {
    table: 'Student',
    relations: {
      bills: { model: 'bill', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      classStudents: { model: 'classStudent', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      documents: { model: 'studentDocument', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      khs: { model: 'khs', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      mbkmActivities: { model: 'mbkmActivity', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      parents: { model: 'studentParent', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      studentClass: { model: 'studentClassRef', type: 'one', localKey: 'studentClassId', foreignKey: 'id' },
      studentStatus: { model: 'studentStatusRef', type: 'one', localKey: 'studentStatusId', foreignKey: 'id' },
      studyPlans: { model: 'studyPlan', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' },
      studySystem: { model: 'studySystemRef', type: 'one', localKey: 'studySystemId', foreignKey: 'id' },
      transcripts: { model: 'transcript', type: 'many', localKey: 'id', foreignKey: 'studentId' },
      user: { model: 'user', type: 'one', localKey: 'userId', foreignKey: 'id' }
    }
  },
  studentActivity: {
    table: 'StudentActivity',
    relations: {
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  studentClassRef: { table: 'StudentClassRef', relations: {} },
  studentDocument: {
    table: 'StudentDocument',
    relations: {
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  studentParent: {
    table: 'StudentParent',
    relations: {
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  studentStatusRef: { table: 'StudentStatusRef', relations: {} },
  studyPlan: {
    table: 'StudyPlan',
    relations: {
      items: { model: 'studyPlanItem', type: 'many', localKey: 'id', foreignKey: 'studyPlanId' },
      period: { model: 'academicPeriod', type: 'one', localKey: 'periodId', foreignKey: 'id' },
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  studyPlanItem: {
    table: 'StudyPlanItem',
    relations: {
      class: { model: 'class', type: 'one', localKey: 'classId', foreignKey: 'id' },
      studyPlan: { model: 'studyPlan', type: 'one', localKey: 'studyPlanId', foreignKey: 'id' }
    }
  },
  studyProgram: {
    table: 'StudyProgram',
    relations: {
      classes: { model: 'class', type: 'many', localKey: 'id', foreignKey: 'studyProgramId' },
      degreeLevelRef: { model: 'degreeLevelRef', type: 'one', localKey: 'degreeLevelId', foreignKey: 'id' },
      faculty: { model: 'faculty', type: 'one', localKey: 'facultyId', foreignKey: 'id' },
      lecturers: { model: 'lecturer', type: 'many', localKey: 'id', foreignKey: 'studyProgramId' },
      students: { model: 'student', type: 'many', localKey: 'id', foreignKey: 'studyProgramId' }
    }
  },
  studyProgramSetting: {
    table: 'StudyProgramSetting',
    relations: {
      period: { model: 'academicPeriod', type: 'one', localKey: 'periodId', foreignKey: 'id' },
      studyProgram: { model: 'studyProgram', type: 'one', localKey: 'studyProgramId', foreignKey: 'id' }
    }
  },
  studySystemRef: { table: 'StudySystemRef', relations: {} },
  structuralPosition: { table: 'StructuralPosition', relations: {} },
  transcript: {
    table: 'Transcript',
    relations: {
      student: { model: 'student', type: 'one', localKey: 'studentId', foreignKey: 'id' }
    }
  },
  university: {
    table: 'University',
    relations: {
      faculties: { model: 'faculty', type: 'many', localKey: 'id', foreignKey: 'universityId' },
      users: { model: 'user', type: 'many', localKey: 'id', foreignKey: 'universityId' }
    }
  },
  user: {
    table: 'User',
    relations: {
      auditLogs: { model: 'auditLog', type: 'many', localKey: 'id', foreignKey: 'userId' },
      lecturer: { model: 'lecturer', type: 'one', localKey: 'id', foreignKey: 'userId' },
      role: { model: 'role', type: 'one', localKey: 'roleId', foreignKey: 'id' },
      student: { model: 'student', type: 'one', localKey: 'id', foreignKey: 'userId' },
      university: { model: 'university', type: 'one', localKey: 'universityId', foreignKey: 'id' },
      userRoles: { model: 'userRole', type: 'many', localKey: 'id', foreignKey: 'userId' }
    }
  },
  userRole: {
    table: 'UserRole',
    relations: {
      role: { model: 'role', type: 'one', localKey: 'roleId', foreignKey: 'id' },
      user: { model: 'user', type: 'one', localKey: 'userId', foreignKey: 'id' }
    }
  },
  virtualAccount: {
    table: 'VirtualAccount',
    relations: {
      bill: { model: 'bill', type: 'one', localKey: 'billId', foreignKey: 'id' }
    }
  }
};

function camelToModel(name: ModelName): ModelName {
  return name;
}

function parseDatabaseUrl(url: string) {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: parsed.port ? Number(parsed.port) : 3306,
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    database: parsed.pathname.replace(/^\//, ''),
    waitForConnections: true,
    connectionLimit: Number(parsed.searchParams.get('connection_limit') || 4),
    namedPlaceholders: false,
    dateStrings: false
  };
}

function cleanData(data: Record<string, any>) {
  return Object.fromEntries(Object.entries(data).filter(([, value]) => value !== undefined));
}

function id() {
  return randomUUID().replace(/-/g, '');
}

class Delegate {
  constructor(
    private readonly model: ModelName,
    private readonly db: Queryable
  ) {}

  async findMany(args: FindArgs = {}): Promise<any[]> {
    const rows = await this.findRaw(args.where);
    const filtered = await this.filterNestedWhere(rows, args.where);
    const sorted = await this.sortRows(filtered, args.orderBy);
    const sliced = sorted.slice(args.skip ?? 0, args.take ? (args.skip ?? 0) + args.take : undefined);
    const included = await this.applyInclude(sliced, args.include);
    return included.map((row) => this.applySelect(row, args.select));
  }

  async findFirst(args: FindArgs = {}): Promise<any | null> {
    return (await this.findMany(args))[0] ?? null;
  }

  async findUnique(args: FindArgs): Promise<any | null> {
    const rows = await this.findMany({ ...args, orderBy: undefined });
    return rows[0] ?? null;
  }

  async findUniqueOrThrow(args: FindArgs): Promise<any> {
    const row = await this.findUnique(args);
    if (!row) throw new Error(`${MODEL[this.model].table} record not found`);
    return row;
  }

  async count(args: Pick<FindArgs, 'where'> = {}) {
    return (await this.findMany({ where: args.where })).length;
  }

  async create(args: { data: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }) {
    const data = cleanData({ id: id(), ...args.data });
    const columns = Object.keys(data);
    const values = Object.values(data);
    const placeholders = columns.map(() => '?').join(', ');
    await this.db.execute(
      `INSERT INTO \`${MODEL[this.model].table}\` (${columns.map((x) => `\`${x}\``).join(', ')}) VALUES (${placeholders})`,
      values
    );
    return this.findUnique({ where: { id: data.id }, include: args.include, select: args.select });
  }

  async createMany(args: { data: Array<Record<string, any>> }) {
    for (const entry of args.data) await this.create({ data: entry });
    return { count: args.data.length };
  }

  async update(args: { where: Record<string, any>; data: Record<string, any>; include?: Record<string, any>; select?: Record<string, any> }) {
    const existing = await this.findUnique({ where: args.where });
    if (!existing) throw new Error(`${MODEL[this.model].table} record not found`);
    const data = cleanData(args.data);
    const columns = Object.keys(data);
    if (columns.length) {
      await this.db.execute(
        `UPDATE \`${MODEL[this.model].table}\` SET ${columns.map((x) => `\`${x}\` = ?`).join(', ')} WHERE \`id\` = ?`,
        [...columns.map((x) => data[x]), existing.id]
      );
    }
    return this.findUnique({ where: { id: existing.id }, include: args.include, select: args.select });
  }

  async updateMany(args: { where?: Record<string, any>; data: Record<string, any> }) {
    const rows = await this.findMany({ where: args.where });
    for (const row of rows) await this.update({ where: { id: row.id }, data: args.data });
    return { count: rows.length };
  }

  async delete(args: { where: Record<string, any> }) {
    const existing = await this.findUnique({ where: args.where });
    if (!existing) throw new Error(`${MODEL[this.model].table} record not found`);
    await this.db.execute(`DELETE FROM \`${MODEL[this.model].table}\` WHERE \`id\` = ?`, [existing.id]);
    return existing;
  }

  async deleteMany(args: { where?: Record<string, any> } = {}) {
    const rows = await this.findMany({ where: args.where });
    for (const row of rows) await this.delete({ where: { id: row.id } });
    return { count: rows.length };
  }

  async upsert(args: {
    where: Record<string, any>;
    update: Record<string, any>;
    create: Record<string, any>;
    include?: Record<string, any>;
    select?: Record<string, any>;
  }) {
    const existing = await this.findUnique({ where: args.where });
    if (existing) return this.update({ where: { id: existing.id }, data: args.update, include: args.include, select: args.select });
    return this.create({ data: args.create, include: args.include, select: args.select });
  }

  private async findRaw(where?: Record<string, any>) {
    const clauses: string[] = [];
    const values: any[] = [];
    for (const [key, value] of Object.entries(where ?? {})) {
      if (value === undefined || MODEL[this.model].relations[key]) continue;
      if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
        if ('in' in value) {
          const list = value.in ?? [];
          if (!list.length) return [];
          clauses.push(`\`${key}\` IN (${list.map(() => '?').join(', ')})`);
          values.push(...list);
        } else {
          const composite = Object.values(value)[0] as Record<string, any> | undefined;
          if (composite && typeof composite === 'object') {
            for (const [innerKey, innerValue] of Object.entries(composite)) {
              clauses.push(`\`${innerKey}\` = ?`);
              values.push(innerValue);
            }
          }
        }
      } else {
        clauses.push(`\`${key}\` = ?`);
        values.push(value);
      }
    }
    const sql = `SELECT * FROM \`${MODEL[this.model].table}\`${clauses.length ? ` WHERE ${clauses.join(' AND ')}` : ''}`;
    const [rows] = await this.db.execute<RowDataPacket[]>(sql, values);
    return rows.map((row) => ({ ...row }));
  }

  private async filterNestedWhere(rows: any[], where?: Record<string, any>) {
    let out = rows;
    for (const [key, value] of Object.entries(where ?? {})) {
      const relation = MODEL[this.model].relations[key];
      if (!relation || !value || typeof value !== 'object') continue;
      const delegate = new Delegate(relation.model, this.db);
      const filtered: any[] = [];
      for (const row of out) {
        const related = relation.type === 'one'
          ? await delegate.findFirst({ where: { [relation.foreignKey]: row[relation.localKey], ...value } })
          : await delegate.findMany({ where: { [relation.foreignKey]: row[relation.localKey], ...value } });
        if (relation.type === 'one' ? Boolean(related) : related.length > 0) filtered.push(row);
      }
      out = filtered;
    }
    return out;
  }

  private async applyInclude(rows: any[], include?: Record<string, any>) {
    if (!include) return rows;
    const output: any[] = [];
    for (const row of rows) {
      const item = { ...row };
      for (const [key, rawConfig] of Object.entries(include)) {
        if (!rawConfig) continue;
        const relation = MODEL[this.model].relations[key];
        if (!relation) continue;
        const config = rawConfig === true ? {} : rawConfig;
        const delegate = new Delegate(relation.model, this.db);
        const relationWhere = { ...(config.where ?? {}), [relation.foreignKey]: item[relation.localKey] };
        const args = {
          where: relationWhere,
          include: config.include,
          select: config.select,
          orderBy: config.orderBy
        };
        item[key] = relation.type === 'one' ? await delegate.findFirst(args) : await delegate.findMany(args);
      }
      output.push(item);
    }
    return output;
  }

  private applySelect(row: any, select?: Record<string, any>) {
    if (!select) return row;
    const selected: Record<string, any> = {};
    for (const [key, value] of Object.entries(select)) {
      if (!value) continue;
      if (value === true) selected[key] = row[key];
      else if (row[key] !== undefined) selected[key] = row[key];
    }
    return selected;
  }

  private async sortRows(rows: any[], orderBy?: any) {
    if (!orderBy) return rows;
    const orders = Array.isArray(orderBy) ? orderBy : [orderBy];
    const hydrated = await this.ensureOrderRelations(rows, orders);
    return hydrated.sort((a, b) => {
      for (const order of orders) {
        const path = this.orderPath(order);
        const dir = this.orderDir(order);
        const av = this.valueAt(a, path);
        const bv = this.valueAt(b, path);
        if (av === bv) continue;
        const result = String(av ?? '').localeCompare(String(bv ?? ''), undefined, { numeric: true });
        return dir === 'desc' ? -result : result;
      }
      return 0;
    });
  }

  private async ensureOrderRelations(rows: any[], orders: any[]) {
    let result = rows;
    for (const order of orders) {
      const path = this.orderPath(order);
      if (path.length > 1 && MODEL[this.model].relations[path[0]]) {
        result = await this.applyInclude(result, { [path[0]]: true });
      }
    }
    return result;
  }

  private orderPath(order: any): string[] {
    const key = Object.keys(order)[0];
    const value = order[key];
    if (value === 'asc' || value === 'desc') return [key];
    return [key, ...this.orderPath(value)];
  }

  private orderDir(order: any): Direction {
    const key = Object.keys(order)[0];
    const value = order[key];
    if (value === 'asc' || value === 'desc') return value;
    return this.orderDir(value);
  }

  private valueAt(row: any, path: string[]) {
    return path.reduce((acc, key) => acc?.[key], row);
  }
}

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private pool!: Pool;

  academicAdvisor!: Delegate;
  academicPeriod!: Delegate;
  academicYear!: Delegate;
  auditLog!: Delegate;
  bill!: Delegate;
  classLecturer!: Delegate;
  classSchedule!: Delegate;
  classStudent!: Delegate;
  consultation!: Delegate;
  course!: Delegate;
  coursePrerequisite!: Delegate;
  curriculum!: Delegate;
  curriculumCourse!: Delegate;
  degreeLevelRef!: Delegate;
  faculty!: Delegate;
  grade!: Delegate;
  khs!: Delegate;
  lecturer!: Delegate;
  lecturerStructuralPosition!: Delegate;
  mbkmActivity!: Delegate;
  mbkmConversion!: Delegate;
  payment!: Delegate;
  permission!: Delegate;
  role!: Delegate;
  rolePermission!: Delegate;
  student!: Delegate;
  studentActivity!: Delegate;
  studentClassRef!: Delegate;
  studentDocument!: Delegate;
  studentParent!: Delegate;
  studentStatusRef!: Delegate;
  studyPlan!: Delegate;
  studyPlanItem!: Delegate;
  studyProgram!: Delegate;
  studyProgramSetting!: Delegate;
  studySystemRef!: Delegate;
  structuralPosition!: Delegate;
  transcript!: Delegate;
  university!: Delegate;
  user!: Delegate;
  userRole!: Delegate;
  virtualAccount!: Delegate;
  ['class']!: Delegate;

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }

  async $connect() {
    if (this.pool) return;
    const url = process.env.DATABASE_URL;
    if (!url) throw new Error('DATABASE_URL is required');
    this.pool = mysql.createPool(parseDatabaseUrl(url));
    for (const modelName of Object.keys(MODEL) as ModelName[]) {
      (this as any)[camelToModel(modelName)] = new Delegate(modelName, this.pool);
    }
  }

  async $disconnect() {
    if (this.pool) await this.pool.end();
  }

  async $transaction<T>(callback: (tx: this) => Promise<T>) {
    const connection = await this.pool.getConnection();
    const tx = Object.create(this) as this;
    for (const modelName of Object.keys(MODEL) as ModelName[]) {
      (tx as any)[modelName] = new Delegate(modelName, connection);
    }
    try {
      await connection.beginTransaction();
      const result = await callback(tx);
      await connection.commit();
      return result;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  async enableShutdownHooks(_app: INestApplication) {
    // mysql2 pool is closed through onModuleDestroy.
  }
}
