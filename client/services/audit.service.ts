// services/audit.service.ts
import api from "@/lib/axios";
import type { AuditLogListResponse } from "@/types/audit";

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  action?: string;
  tableName?: string;
}

export async function getAuditLogs(
  params: GetAuditLogsParams = {}
): Promise<AuditLogListResponse> {
  const { data } = await api.get<AuditLogListResponse>("/audit-logs", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load audit logs");
  }

  return data;
}
