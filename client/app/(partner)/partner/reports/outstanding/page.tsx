// app/(partner)/partner/reports/outstanding/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyOutstandingReport } from "@/services/partnerReport.service";
import LoanTable from "@/components/tables/LoanTable";
import StatCard from "@/components/dashboard/StatCard";
import Pagination from "@/components/ui/Pagination";
import type { Loan } from "@/types/loan";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { AlertTriangle, FileText } from "lucide-react";

export default function PartnerOutstandingReportPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyOutstandingReport()
      .then(setLoans)
      .catch((err) => {
        console.error(err);
        setError("Could not load the outstanding report. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => setPage(1), [pageSize, search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return loans;
    return loans.filter((l) => {
      const haystack = [l.loanNumber, l.customer?.name, l.customer?.customerCode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [loans, search]);

  const summary = useMemo(
    () =>
      filtered.reduce(
        (acc, l) => {
          acc.count += 1;
          acc.totalBalance += Number(l.balanceAmount);
          return acc;
        },
        { count: 0, totalBalance: 0 }
      ),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDownload = () => {
    exportReportPdf({
      title: "Outstanding Report",
      filtersSummary: search ? `Search: "${search}"` : "None",
      summary: [
        { label: "Loans with balance", value: String(summary.count) },
        { label: "Total outstanding", value: formatCurrency(summary.totalBalance) },
      ],
      columns: ["Loan number", "Customer", "Principal", "Balance", "Status", "Created"],
      rows: filtered.map((l) => [
        l.loanNumber,
        l.customer?.name ?? "—",
        formatCurrency(l.principalAmount),
        formatCurrency(l.balanceAmount),
        l.status,
        formatDate(l.createdAt),
      ]),
      filename: "my-outstanding-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Outstanding Report</h1>
          <p className="text-sm text-[#45443E]">
            {summary.count} loan{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalBalance)} outstanding
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading || filtered.length === 0}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard title="Loans with balance" value={String(summary.count)} icon={FileText} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Total outstanding" value={formatCurrency(summary.totalBalance)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#993C1D" />
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search loan, customer..."
        className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
      />

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-[#993C1D] text-sm mb-2">{error}</p>
            <button onClick={load} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <LoanTable loans={paginated} linkPrefix="/partner/loans" />

            <Pagination
              page={page}
              totalPages={totalPages}
              total={filtered.length}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>
    </div>
  );
}
