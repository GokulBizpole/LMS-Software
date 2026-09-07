// hooks/useEodReports.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getEodReports } from "@/services/eod.service";
import type { EodReport } from "@/types/eod";

export function useEodReports() {
  const [reports, setReports] = useState<EodReport[]>([]);
  const [total, setTotal] = useState(0);
  const [totalNetRemittance, setTotalNetRemittance] = useState<number | string>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [partnerId, setPartnerId] = useState("all");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getEodReports({
        page,
        limit: pageSize,
        partnerId: partnerId === "all" ? undefined : partnerId,
        status: status === "all" ? undefined : status,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setReports(result.reports);
      setTotal(result.total);
      setTotalNetRemittance(result.totalNetRemittance);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      setError("Could not load EOD reports. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, partnerId, status, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, partnerId, status, startDate, endDate]);

  return {
    reports,
    total,
    totalNetRemittance,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    partnerId,
    setPartnerId,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch: load,
  };
}
