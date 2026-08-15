// hooks/useLoanReport.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getLoans } from "@/services/loan.service";
import type { Loan, LoanStatus } from "@/types/loan";

function inRange(dateStr: string | null | undefined, start: string, end: string) {
  if (!start && !end) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr).getTime();
  if (start && d < new Date(start).getTime()) return false;
  if (end && d > new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
}

export function useLoanReport() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LoanStatus | "all">("all");
  const [partnerId, setPartnerId] = useState("all");
  const [customerId, setCustomerId] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getLoans({ limit: 1000 });
      setLoans(result.loans);
    } catch (err) {
      console.error(err);
      setError("Could not load the loan report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, status, partnerId, customerId, startDate, endDate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return loans.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (partnerId !== "all" && l.partnerId !== partnerId) return false;
      if (customerId !== "all" && l.customerId !== customerId) return false;
      if (!inRange(l.createdAt, startDate, endDate)) return false;
      if (term) {
        const haystack = [
          l.loanNumber,
          l.customer?.name,
          l.customer?.customerCode,
          l.partner?.name,
          l.partner?.partnerCode,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [loans, search, status, partnerId, customerId, startDate, endDate]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, l) => {
        acc.count += 1;
        acc.totalPrincipal += Number(l.principalAmount);
        acc.totalPayable += Number(l.totalPayable);
        acc.totalBalance += Number(l.balanceAmount);
        acc.byStatus[l.status] = (acc.byStatus[l.status] ?? 0) + 1;
        return acc;
      },
      {
        count: 0,
        totalPrincipal: 0,
        totalPayable: 0,
        totalBalance: 0,
        byStatus: {} as Record<LoanStatus, number>,
      }
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    loans: paginated,
    filtered,
    summary,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    partnerId,
    setPartnerId,
    customerId,
    setCustomerId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch: load,
  };
}
