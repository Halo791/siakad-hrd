import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import { unlink } from 'fs/promises';

@Injectable()
export class DocumentsService {
  constructor(private readonly prisma: PrismaService) {}

  list(studentId: string) {
    return this.prisma.studentDocument.findMany({ where: { studentId }, orderBy: { uploadedAt: 'desc' } });
  }

  create(data: {
    studentId: string;
    category: string;
    fileName: string;
    filePath: string;
    uploadedBy?: string;
  }) {
    return this.prisma.studentDocument.create({ data });
  }

  getById(id: string) {
    return this.prisma.studentDocument.findUnique({ where: { id } });
  }

  async remove(id: string) {
    const doc = await this.prisma.studentDocument.findUnique({ where: { id } });
    if (!doc) return null;

    try {
      await unlink(doc.filePath);
    } catch {
      // Ignore if file already removed from disk.
    }

    await this.prisma.studentDocument.delete({ where: { id } });
    return { id };
  }
}
