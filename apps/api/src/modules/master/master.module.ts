import { Module } from '@nestjs/common';
import { MasterController } from './master.controller';
import { MasterService } from './master.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [MasterController], providers: [MasterService, PrismaService] })
export class MasterModule {}
