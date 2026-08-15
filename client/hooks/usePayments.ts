// hooks/usePayments.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getPayments } from "@/services/payment.service";
import type { Payment } from "@/types/payment";

export type PaymentPeriod = "all" | "day" | "week" | "month";

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PaymentPeriod>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPayments({
        page,
        limit: pageSize,
        search,
        period: period === "all" ? undefined : period,
      });
      setPayments(result.payments);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      setError("Could not load payments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, period]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, period]);

  return {
    payments,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    period,
    setPeriod,
    loading,
    error,
    refetch: load,
  };
}
