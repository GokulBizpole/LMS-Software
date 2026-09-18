// hooks/usePartners.ts
"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";

// GET /partners has no status filter server-side — only page/limit/search.
// Same approach as useCustomers: fetch the full search-matching set once via
// the existing endpoint, then filter/paginate client-side.
const FETCH_LIMIT = 1000;

export type PartnerStatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

export interface PartnerStats {
  total: number;
  active: number;
  inactive: number;
  addedThisMonth: number;
}

function isThisMonth(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
}

export function usePartners() {
  const [allMatching, setAllMatching] = useState<Partner[]>([]);
  const [statsSource, setStatsSource] = useState<Partner[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<PartnerStatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [searched, everything] = await Promise.all([
        getPartners({ limit: FETCH_LIMIT, search }),
        search ? getPartners({ limit: FETCH_LIMIT }) : Promise.resolve(null),
      ]);
      setAllMatching(searched.partners);
      setStatsSource(everything ? everything.partners : searched.partners);
    } catch (err) {
      console.error(err);
      setError("Could not load partners. Please try again.");
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

  const filteredPartners = useMemo(() => {
    if (statusFilter === "ALL") return allMatching;
    return allMatching.filter((p) => p.status === statusFilter);
  }, [allMatching, statusFilter]);

  const total = filteredPartners.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const partners = useMemo(
    () => filteredPartners.slice((page - 1) * pageSize, page * pageSize),
    [filteredPartners, page, pageSize]
  );

  const stats: PartnerStats = useMemo(
    () => ({
      total: statsSource.length,
      active: statsSource.filter((p) => p.status === "ACTIVE").length,
      inactive: statsSource.filter((p) => p.status === "INACTIVE").length,
      addedThisMonth: statsSource.filter((p) => isThisMonth(p.createdAt)).length,
    }),
    [statsSource]
  );

  return {
    partners,
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
  };
}
