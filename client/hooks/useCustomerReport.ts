// hooks/useCustomerReport.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getCustomers } from "@/services/customer.service";
import type { Customer } from "@/types/customer";

const PAGE_SIZE = 10;

export function useCustomerReport() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<Customer["status"] | "all">("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getCustomers({ limit: 1000 });
      setCustomers(result.customers);
    } catch (err) {
      console.error(err);
      setError("Could not load the customer report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return customers.filter((c) => {
      if (status !== "all" && c.status !== status) return false;
      if (term) {
        const haystack = [c.name, c.customerCode, c.phone, c.city, c.state]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [customers, search, status]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, c) => {
        acc.count += 1;
        acc.byStatus[c.status] = (acc.byStatus[c.status] ?? 0) + 1;
        return acc;
      },
      { count: 0, byStatus: {} as Record<Customer["status"], number> }
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    customers: paginated,
    filtered,
    summary,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    loading,
    error,
    refetch: load,
  };
}
