// hooks/usePartnerPayments.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyPayments } from "@/services/partnerPayment.service";
import type { Payment } from "@/types/payment";

export type PartnerPaymentPeriod = "all" | "day" | "week" | "month";

export function usePartnerPayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [period, setPeriod] = useState<PartnerPaymentPeriod>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyPayments({
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
