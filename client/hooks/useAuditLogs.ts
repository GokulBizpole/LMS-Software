// hooks/useAuditLogs.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getAuditLogs } from "@/services/audit.service";
import type { AuditLog } from "@/types/audit";

export function useAuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [action, setAction] = useState<string>("all");
  const [tableName, setTableName] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getAuditLogs({
        page,
        limit: 10,
        action: action === "all" ? undefined : action,
        tableName: tableName === "all" ? undefined : tableName,
      });
      setLogs(result.logs);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      setError("Could not load audit logs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, action, tableName]);

  useEffect(() => {
    load();
  }, [load]);

  return {
    logs,
    total,
    page,
    setPage,
    totalPages,
    action,
    setAction,
    tableName,
    setTableName,
    loading,
    error,
    refetch: load,
  };
}
