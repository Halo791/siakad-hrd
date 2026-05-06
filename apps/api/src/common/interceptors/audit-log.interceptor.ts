import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(private readonly prisma: PrismaService) {}

  private sanitize(value: unknown): unknown {
    if (!value || typeof value !== 'object') return value;
    if (Array.isArray(value)) return value.map((x) => this.sanitize(x));

    const blocked = new Set(['password', 'passwordHash', 'refreshToken', 'accessToken']);
    const out: Record<string, unknown> = {};
    Object.entries(value as Record<string, unknown>).forEach(([k, v]) => {
      out[k] = blocked.has(k) ? '***' : this.sanitize(v);
    });
    return out;
  }

  private async writeLog(input: {
    userId: string;
    action: string;
    url: string;
    entityId: string;
    metadata: Record<string, unknown>;
  }) {
    await this.prisma.auditLog.create({
      data: {
        userId: input.userId,
        action: input.action,
        entity: input.url,
        entityId: input.entityId,
        metadata: input.metadata as Prisma.InputJsonValue
      }
    });
  }

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = context.switchToHttp().getRequest();
    const res = context.switchToHttp().getResponse();
    const userId = req.user?.userId;
    const method = req.method;
    const url = req.url;
    const start = Date.now();
    const entityId = req.params?.id || '-';

    return next.handle().pipe(
      tap(async () => {
        if (!userId) return;
        void this.writeLog({
          userId,
          action: method,
          url,
          entityId,
          metadata: {
            statusCode: res?.statusCode ?? null,
            durationMs: Date.now() - start,
            ip: req.ip,
            userAgent: req.headers?.['user-agent'] || null,
            body: this.sanitize(req.body),
            query: this.sanitize(req.query)
          }
        });
      }),
      catchError((err: unknown) => {
        if (userId) {
          const statusCode = typeof err === 'object' && err !== null && 'status' in err
            ? (err as { status?: number }).status
            : 500;
          const message = typeof err === 'object' && err !== null && 'message' in err
            ? (err as { message?: string | string[] }).message
            : 'Unknown error';

          void this.writeLog({
            userId,
            action: `${method}_ERROR`,
            url,
            entityId,
            metadata: {
              statusCode,
              durationMs: Date.now() - start,
              ip: req.ip,
              userAgent: req.headers?.['user-agent'] || null,
              body: this.sanitize(req.body),
              query: this.sanitize(req.query),
              error: this.sanitize(message)
            }
          });
        }
        return throwError(() => err);
      })
    );
  }
}
