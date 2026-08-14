// app/(dashboard)/reports/partners/page.tsx
"use client";

import { usePartnerReport } from "@/hooks/usePartnerReport";
import PartnerReportTable from "@/components/tables/PartnerReportTable";
import StatCard from "@/components/dashboard/StatCard";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { formatCurrency } from "@/utils/formatCurrency";
import { exportReportPdf } from "@/utils/exportPdf";
import { Handshake, Wallet, PiggyBank, AlertTriangle } from "lucide-react";

export default function PartnerReportPage() {
  const {
    partners,
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
    refetch,
  } = usePartnerReport();

  const filterFields: FilterFieldSpec[] = [
    {
      key: "status",
      label: "Status",
      kind: "select",
      value: status,
      onChange: (v) => setStatus(v as typeof status),
      options: [
        { value: "all", label: "All statuses" },
        { value: "ACTIVE", label: "Active" },
        { value: "INACTIVE", label: "Inactive" },
      ],
    },
  ];

  const filtersSummary = [
    status !== "all" && `Status: ${status}`,
    search && `Search: "${search}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDownload = () => {
    exportReportPdf({
      title: "Partner Report",
      filtersSummary: filtersSummary || "None",
      summary: [
        { label: "Partners", value: String(summary.count) },
        { label: "Total investment", value: formatCurrency(summary.totalInvestment) },
        { label: "Total collection", value: formatCurrency(summary.totalCollection) },
        { label: "Total outstanding", value: formatCurrency(summary.totalOutstanding) },
      ],
      columns: ["Code", "Name", "Status", "Investment", "Balance", "Loans", "Loan amount", "Collected", "Outstanding"],
      rows: filtered.map((p) => [
        p.partnerCode,
        p.name,
        p.status,
        formatCurrency(p.investmentAmount),
        formatCurrency(p.currentBalance),
        String(p.totalLoans),
        formatCurrency(p.loanAmount),
        formatCurrency(p.collection),
        formatCurrency(p.outstanding),
      ]),
      filename: "partner-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Partner Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {summary.count} partner{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalInvestment)} invested
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading || filtered.length === 0}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Partners" value={String(summary.count)} icon={Handshake} iconBg="#F1EFE8" iconColor="#5F5E5A" />
        <StatCard title="Total investment" value={formatCurrency(summary.totalInvestment)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Total collection" value={formatCurrency(summary.totalCollection)} icon={PiggyBank} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Total outstanding" value={formatCurrency(summary.totalOutstanding)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#993C1D" />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, code, phone..."
          className="w-full max-w-sm rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
        />
        <FilterPopover fields={filterFields} />
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F1EFE8] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-[#993C1D] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <PartnerReportTable partners={partners} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1EFE8]">
                <p className="text-xs text-[#888780]">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
