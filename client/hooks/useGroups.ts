// hooks/useGroups.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getGroups, type GroupScope } from "@/services/group.service";
import type { Group, GroupStats } from "@/types/group";

const emptyStats: GroupStats = {
  totalGroups: 0,
  totalMembers: 0,
  addedThisMonth: 0,
  activeLoans: 0,
  weekCollection: 0,
};

export function useGroups(scope: GroupScope) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [total, setTotal] = useState(0);
  const [stats, setStats] = useState<GroupStats>(emptyStats);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearchState] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getGroups(scope, { page, limit: pageSize, search });
      setGroups(result.groups);
      setTotal(result.total);
      setTotalPages(result.totalPages);
      setStats(result.stats ?? emptyStats);
    } catch (err) {
      console.error(err);
      setError("Could not load groups. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [scope, page, pageSize, search]);

  useEffect(() => {
    const run = () => {
      load();
    };
    run();
  }, [load]);

  // Changing the filter or page size jumps back to page 1.
  const setSearch = (value: string) => {
    setSearchState(value);
    setPage(1);
  };

  const setPageSizeAndReset = (value: number) => {
    setPageSize(value);
    setPage(1);
  };

  return {
    groups,
    total,
    stats,
    page,
    setPage,
    pageSize,
    setPageSize: setPageSizeAndReset,
    totalPages,
    search,
    setSearch,
    loading,
    error,
    refetch: load,
  };
}
