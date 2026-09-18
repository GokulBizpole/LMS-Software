// hooks/useCustomers.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getCustomers } from "@/services/customer.service";
import type { Customer } from "@/types/customer";

// The backend's GET /customers has no status filter — only page/limit/search.
// To power the Active/Blocked quick-filter and the summary stat cards without
// touching backend logic, we fetch the full search-matching set once (via the
// same existing endpoint, just a large limit) and do status-filtering +
// pagination client-side.
const FETCH_LIMIT = 1000;

export type CustomerStatusFilter = "ALL" | "ACTIVE" | "BLOCKED";

export interface CustomerStats {
  total: number;
  active: number;
  blocked: number;
  addedThisMonth: number;
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function useCustomers() {
  const [allMatching, setAllMatching] = useState<Customer[]>([]);
  const [statsSource, setStatsSource] = useState<Customer[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CustomerStatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [searched, everything] = await Promise.all([
        getCustomers({ limit: FETCH_LIMIT, search }),
        // Stat cards reflect the whole dataset regardless of the search box.
        search ? getCustomers({ limit: FETCH_LIMIT }) : Promise.resolve(null),
      ]);
      setAllMatching(searched.customers);
      setStatsSource(everything ? everything.customers : searched.customers);
    } catch (err) {
      console.error(err);
      setError("Could not load customers. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, statusFilter]);

  const removeCustomer = useCallback((id: string) => {
    setAllMatching((prev) => prev.filter((c) => c.id !== id));
    setStatsSource((prev) => prev.filter((c) => c.id !== id));
  }, []);

  const filteredCustomers = useMemo(() => {
    if (statusFilter === "ALL") return allMatching;
    return allMatching.filter((c) => c.status === statusFilter);
  }, [allMatching, statusFilter]);

  const total = filteredCustomers.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const customers = useMemo(
    () => filteredCustomers.slice((page - 1) * pageSize, page * pageSize),
    [filteredCustomers, page, pageSize]
  );

  const stats: CustomerStats = useMemo(
    () => ({
      total: statsSource.length,
      active: statsSource.filter((c) => c.status === "ACTIVE").length,
      blocked: statsSource.filter((c) => c.status === "BLOCKED").length,
      addedThisMonth: statsSource.filter((c) => isThisMonth(c.createdAt)).length,
    }),
    [statsSource]
  );

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
    statusFilter,
    setStatusFilter,
    stats,
    loading,
    error,
    refetch: load,
    removeCustomer,
  };
}
