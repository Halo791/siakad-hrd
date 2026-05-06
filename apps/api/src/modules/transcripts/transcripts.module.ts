import { Module } from '@nestjs/common';
import { TranscriptsController } from './transcripts.controller';
import { TranscriptsService } from './transcripts.service';
import { PrismaService } from '../../prisma.service';

@Module({ controllers: [TranscriptsController], providers: [TranscriptsService, PrismaService] })
export class TranscriptsModule {}
