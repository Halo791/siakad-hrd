import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { PrismaService } from './prisma.service';
import { AuthModule } from './modules/auth/auth.module';
import { MasterModule } from './modules/master/master.module';
import { CurriculumModule } from './modules/curriculum/curriculum.module';
import { ClassesModule } from './modules/classes/classes.module';
import { KrsModule } from './modules/krs/krs.module';
import { GradesModule } from './modules/grades/grades.module';
import { KhsModule } from './modules/khs/khs.module';
import { TranscriptsModule } from './modules/transcripts/transcripts.module';
import { ReportsModule } from './modules/reports/reports.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { SettingsModule } from './modules/settings/settings.module';
import { AccessModule } from './modules/access/access.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { PermissionGuard } from './common/guards/permission.guard';
import { AuditLogInterceptor } from './common/interceptors/audit-log.interceptor';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    MasterModule,
    CurriculumModule,
    ClassesModule,
    KrsModule,
    GradesModule,
    KhsModule,
    TranscriptsModule,
    ReportsModule,
    DocumentsModule,
    DashboardModule,
    SettingsModule,
    AccessModule
  ],
  providers: [
    PrismaService,
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: PermissionGuard },
    { provide: APP_INTERCEPTOR, useClass: AuditLogInterceptor }
  ]
})
export class AppModule {}
