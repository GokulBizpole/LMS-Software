// app/(partner)/partner/reports/loans/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyLoanReport } from "@/services/partnerReport.service";
import LoanTable from "@/components/tables/LoanTable";
import StatCard from "@/components/dashboard/StatCard";
import Pagination from "@/components/ui/Pagination";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import type { Loan, LoanStatus } from "@/types/loan";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { FileText, Wallet, AlertTriangle, CheckCircle2 } from "lucide-react";

const STATUS_OPTIONS: { key: LoanStatus | "all"; label: string }[] = [
  { key: "all", label: "All statuses" },
  { key: "PENDING", label: "Pending" },
  { key: "APPROVED", label: "Approved" },
  { key: "ACTIVE", label: "Active" },
  { key: "CLOSED", label: "Closed" },
  { key: "OVERDUE", label: "Overdue" },
  { key: "REJECTED", label: "Rejected" },
];

export default function PartnerLoanReportPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<LoanStatus | "all">("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyLoanReport()
      .then(setLoans)
      .catch((err) => {
        console.error(err);
        setError("Could not load the loan report. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => setPage(1), [pageSize, search, status, startDate, endDate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return loans.filter((l) => {
      if (status !== "all" && l.status !== status) return false;
      if (startDate && new Date(l.createdAt).getTime() < new Date(startDate).getTime()) return false;
      if (endDate && new Date(l.createdAt).getTime() > new Date(endDate).getTime() + 86400000 - 1) return false;
      if (term) {
        const haystack = [l.loanNumber, l.customer?.name, l.customer?.customerCode]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [loans, search, status, startDate, endDate]);

  const summary = useMemo(
    () =>
      filtered.reduce(
        (acc, l) => {
          acc.count += 1;
          acc.totalPrincipal += Number(l.principalAmount);
          acc.totalPayable += Number(l.totalPayable);
          acc.totalBalance += Number(l.balanceAmount);
          return acc;
        },
        { count: 0, totalPrincipal: 0, totalPayable: 0, totalBalance: 0 }
      ),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const filterFields: FilterFieldSpec[] = [
    {
      key: "status",
      label: "Status",
      kind: "select",
      value: status,
      onChange: (v) => setStatus(v as typeof status),
      options: STATUS_OPTIONS.map((s) => ({ value: s.key, label: s.label })),
    },
    {
      key: "date",
      label: "Date",
      kind: "dateRange",
      startValue: startDate,
      endValue: endDate,
      onStartChange: setStartDate,
      onEndChange: setEndDate,
    },
  ];

  const filtersSummary = [
    startDate && `From ${startDate}`,
    endDate && `To ${endDate}`,
    status !== "all" && `Status: ${status}`,
    search && `Search: "${search}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDownload = () => {
    exportReportPdf({
      title: "Loan Report",
      filtersSummary: filtersSummary || "None",
      summary: [
        { label: "Loans", value: String(summary.count) },
        { label: "Total principal", value: formatCurrency(summary.totalPrincipal) },
        { label: "Total payable", value: formatCurrency(summary.totalPayable) },
        { label: "Total balance", value: formatCurrency(summary.totalBalance) },
      ],
      columns: ["Loan number", "Customer", "Principal", "Payable", "Balance", "Status", "Created"],
      rows: filtered.map((l) => [
        l.loanNumber,
        l.customer?.name ?? "—",
        formatCurrency(l.principalAmount),
        formatCurrency(l.totalPayable),
        formatCurrency(l.balanceAmount),
        l.status,
        formatDate(l.createdAt),
      ]),
      filename: "my-loan-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Loan Report</h1>
          <p className="text-sm text-[#45443E]">
            {summary.count} loan{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalPrincipal)} principal
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

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total loans" value={String(summary.count)} icon={FileText} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Total principal" value={formatCurrency(summary.totalPrincipal)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Total payable" value={formatCurrency(summary.totalPayable)} icon={CheckCircle2} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Outstanding balance" value={formatCurrency(summary.totalBalance)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#993C1D" />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search loan, customer..."
          className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
        />
        <FilterPopover fields={filterFields} />
      </div>

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
