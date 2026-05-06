import { Module } from '@nestjs/common';
import { KhsController } from './khs.controller';
import { KhsService } from './khs.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [KhsController], providers: [KhsService, PrismaService] })
export class KhsModule {}
