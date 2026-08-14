// types/audit.ts

export interface AuditLogAdminRef {
  name: string;
  email: string;
}

export interface AuditLog {
  id: string;
  adminId?: string | null;
  admin?: AuditLogAdminRef | null;
  action: string;
  tableName: string;
  recordId: string;
  ipAddress?: string | null;
  createdAt: string;
}

export interface AuditLogListResponse {
  success: boolean;
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
