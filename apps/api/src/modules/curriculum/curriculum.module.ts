import { Module } from '@nestjs/common';
import { CurriculumController } from './curriculum.controller';
import { CurriculumService } from './curriculum.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [CurriculumController], providers: [CurriculumService, PrismaService] })
export class CurriculumModule {}
