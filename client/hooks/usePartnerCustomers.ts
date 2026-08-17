// hooks/usePartnerCustomers.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyCustomers } from "@/services/partnerCustomer.service";
import type { Customer } from "@/types/customer";

export function usePartnerCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyCustomers({ page, limit: pageSize, search });
      setCustomers(result.customers);
      setTotal(result.total);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      setError("Could not load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search]);

  return {
    customers,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    loading,
    error,
    refetch: load,
  };
}
