import { Module } from '@nestjs/common';
import { KrsController } from './krs.controller';
import { KrsService } from './krs.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [KrsController], providers: [KrsService, PrismaService] })
export class KrsModule {}
