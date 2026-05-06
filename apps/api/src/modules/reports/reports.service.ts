import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma.service';
import PDFDocument = require('pdfkit');
import * as ExcelJS from 'exceljs';

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async exportKrsCsv(studyPlanId: string): Promise<string> {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: studyPlanId },
      include: { student: true, period: true, items: { include: { class: { include: { course: true } } } } }
    });
    if (!plan) throw new NotFoundException('KRS not found');

    const header = 'nim,nama,periode,kode_mk,nama_mk,sks,kelas';
    const rows = plan.items.map((i) =>
      [plan.student.nim, plan.student.name, plan.period.code, i.class.course.code, i.class.course.name, i.class.course.sks, i.class.name].join(',')
    );
    return [header, ...rows].join('\n');
  }

  async exportTranscriptCsv(studentId: string): Promise<string> {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');

    const grades = await this.prisma.grade.findMany({
      where: { classStudent: { studentId }, isLocked: true },
      include: { classStudent: { include: { class: { include: { course: true } } } } }
    });

    const header = 'nim,nama,kode_mk,nama_mk,sks,nilai_angka,nilai_huruf';
    const rows = grades.map((g) =>
      [student.nim, student.name, g.classStudent.class.course.code, g.classStudent.class.course.name, g.classStudent.class.course.sks, g.score, g.letter].join(',')
    );
    return [header, ...rows].join('\n');
  }

  async exportKrsXlsx(studyPlanId: string): Promise<Buffer> {
    const plan = await this.prisma.studyPlan.findUnique({
      where: { id: studyPlanId },
      include: { student: true, period: true, items: { include: { class: { include: { course: true } } } } }
    });
    if (!plan) throw new NotFoundException('KRS not found');

    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('KRS');
    ws.addRow(['NIM', 'Nama', 'Periode', 'Kode MK', 'Nama MK', 'SKS', 'Kelas']);
    for (const i of plan.items) {
      ws.addRow([plan.student.nim, plan.student.name, plan.period.code, i.class.course.code, i.class.course.name, i.class.course.sks, i.class.name]);
    }
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async exportTranscriptXlsx(studentId: string): Promise<Buffer> {
    const student = await this.prisma.student.findUnique({ where: { id: studentId } });
    if (!student) throw new NotFoundException('Student not found');
    const grades = await this.prisma.grade.findMany({
      where: { classStudent: { studentId }, isLocked: true },
      include: { classStudent: { include: { class: { include: { course: true } } } } }
    });
    const wb = new ExcelJS.Workbook();
    const ws = wb.addWorksheet('Transkrip');
    ws.addRow(['NIM', 'Nama', 'Kode MK', 'Nama MK', 'SKS', 'Nilai Angka', 'Nilai Huruf']);
    for (const g of grades) {
      ws.addRow([student.nim, student.name, g.classStudent.class.course.code, g.classStudent.class.course.name, g.classStudent.class.course.sks, g.score, g.letter]);
    }
    const buf = await wb.xlsx.writeBuffer();
    return Buffer.from(buf);
  }

  async exportKhsPdf(studentId: string, periodId: string): Promise<Buffer> {
    const khs = await this.prisma.khs.findFirst({
      where: { studentId, periodId },
      include: { student: true, period: true }
    });
    if (!khs) throw new NotFoundException('KHS not found');

    const doc = new PDFDocument({ margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));

    doc.fontSize(18).text('Kartu Hasil Studi (KHS)', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`NIM: ${khs.student.nim}`);
    doc.text(`Nama: ${khs.student.name}`);
    doc.text(`Periode: ${khs.period.code} - ${khs.period.name}`);
    doc.text(`IPS: ${khs.ips.toFixed(2)}`);
    doc.text(`IPK: ${khs.ipk.toFixed(2)}`);
    doc.end();

    return await new Promise<Buffer>((resolve) => {
      doc.on('end', () => resolve(Buffer.concat(chunks)));
    });
  }
}
