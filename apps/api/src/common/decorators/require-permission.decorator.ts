import { SetMetadata } from '@nestjs/common';

export type PermissionAction =
  | 'read' | 'insert' | 'update' | 'delete' | 'validate' | 'approve' | 'reject'
  | 'print' | 'export' | 'import' | 'generate' | 'lock' | 'unlock';

export const PERMISSION_KEY = 'requiredPermission';

export const RequirePermission = (code: string, action: PermissionAction) =>
  SetMetadata(PERMISSION_KEY, { code, action });
