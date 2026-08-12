// hooks/usePartnerReport.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPartners } from "@/services/partner.service";
import { getPartnerFinancials } from "@/services/report.service";
import type { PartnerReportRow } from "@/types/report";

const PAGE_SIZE = 10;

export function usePartnerReport() {
  const [rows, setRows] = useState<PartnerReportRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"ACTIVE" | "INACTIVE" | "all">("all");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [partnersResult, financials] = await Promise.all([
        getPartners({ limit: 1000 }),
        getPartnerFinancials(),
      ]);

      const financialsByCode = new Map(financials.map((f) => [f.partnerCode, f]));

      const merged: PartnerReportRow[] = partnersResult.partners.map((p) => {
        const f = financialsByCode.get(p.partnerCode);
        return {
          id: p.id,
          partnerCode: p.partnerCode,
          name: p.name,
          phone: p.phone,
          email: p.email,
          status: p.status,
          investmentAmount: Number(p.investmentAmount),
          currentBalance: Number(p.currentBalance),
          totalLoans: f?.totalLoans ?? 0,
          loanAmount: f?.loanAmount ?? 0,
          collection: f?.collection ?? 0,
          outstanding: f?.outstanding ?? 0,
        };
      });

      setRows(merged);
    } catch (err) {
      console.error(err);
      setError("Could not load the partner report. Please try again.");
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
    return rows.filter((p) => {
      if (status !== "all" && p.status !== status) return false;
      if (term) {
        const haystack = `${p.partnerCode} ${p.name} ${p.phone} ${p.email}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [rows, search, status]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc.count += 1;
        acc.totalInvestment += p.investmentAmount;
        acc.totalBalance += p.currentBalance;
        acc.totalLoanAmount += p.loanAmount;
        acc.totalCollection += p.collection;
        acc.totalOutstanding += p.outstanding;
        return acc;
      },
      {
        count: 0,
        totalInvestment: 0,
        totalBalance: 0,
        totalLoanAmount: 0,
        totalCollection: 0,
        totalOutstanding: 0,
      }
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    partners: paginated,
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
