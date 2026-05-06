import { Module } from '@nestjs/common';
import { GradesController } from './grades.controller';
import { GradesService } from './grades.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [GradesController], providers: [GradesService, PrismaService] })
export class GradesModule {}
