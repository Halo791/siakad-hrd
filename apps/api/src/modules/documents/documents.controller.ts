import { BadRequestException, Body, Controller, Delete, Get, NotFoundException, Param, Post, Req, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { mkdirSync } from 'fs';
import { IsString } from 'class-validator';
import { Response } from 'express';
import { RequirePermission } from '../../common/decorators/require-permission.decorator';
import { DocumentsService } from './documents.service';

class UploadDocDto {
  @IsString()
  studentId!: string;

  @IsString()
  category!: string;
}

@Controller('documents')
export class DocumentsController {
  constructor(private readonly service: DocumentsService) {}

  @RequirePermission('DOCUMENT', 'read')
  @Get('student/:studentId')
  list(@Param('studentId') studentId: string) {
    return this.service.list(studentId);
  }

  @RequirePermission('DOCUMENT', 'insert')
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 5 * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        const allowed = ['.pdf', '.jpg', '.jpeg', '.png', '.doc', '.docx', '.xlsx'];
        const ext = extname(file.originalname).toLowerCase();
        if (!allowed.includes(ext)) {
          return cb(new BadRequestException('Unsupported file type'), false);
        }
        cb(null, true);
      },
      storage: diskStorage({
        destination: (_req, _file, cb) => {
          const dest = '/tmp/siakad-uploads';
          mkdirSync(dest, { recursive: true });
          cb(null, dest);
        },
        filename: (_req, file, cb) => {
          const uniq = randomUUID();
          cb(null, `${uniq}${extname(file.originalname)}`);
        }
      })
    })
  )
  upload(@UploadedFile() file: Express.Multer.File, @Body() dto: UploadDocDto, @Req() req: { user?: { userId?: string } }) {
    if (!file) throw new BadRequestException('file is required');
    return this.service.create({
      studentId: dto.studentId,
      category: dto.category,
      fileName: file.originalname,
      filePath: file.path,
      uploadedBy: req.user?.userId
    });
  }

  @RequirePermission('DOCUMENT', 'read')
  @Get(':id/download')
  async download(@Param('id') id: string, @Res() res: Response) {
    const doc = await this.service.getById(id);
    if (!doc) throw new NotFoundException('Document not found');
    return res.download(doc.filePath, doc.fileName);
  }

  @RequirePermission('DOCUMENT', 'delete')
  @Delete(':id')
  async remove(@Param('id') id: string) {
    const removed = await this.service.remove(id);
    if (!removed) throw new NotFoundException('Document not found');
    return removed;
  }
}
