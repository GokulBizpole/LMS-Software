// app/(dashboard)/reports/customers/page.tsx
"use client";

import { useCustomerReport } from "@/hooks/useCustomerReport";
import CustomerTable from "@/components/tables/CustomerTable";
import StatCard from "@/components/dashboard/StatCard";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { Users, CheckCircle2, Archive, AlertTriangle } from "lucide-react";

export default function CustomerReportPage() {
  const {
    customers,
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
  } = useCustomerReport();

  const hasActiveFilters = search || status !== "all";

  const clearFilters = () => {
    setSearch("");
    setStatus("all");
  };

  const filtersSummary = [
    status !== "all" && `Status: ${status}`,
    search && `Search: "${search}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDownload = () => {
    exportReportPdf({
      title: "Customer Report",
      filtersSummary: filtersSummary || "None",
      summary: [
        { label: "Total customers", value: String(summary.count) },
        { label: "Active", value: String(summary.byStatus.ACTIVE ?? 0) },
        { label: "Closed", value: String(summary.byStatus.CLOSED ?? 0) },
        { label: "Blocked", value: String(summary.byStatus.BLOCKED ?? 0) },
      ],
      columns: ["Code", "Name", "Phone", "City", "Status", "Registered"],
      rows: filtered.map((c) => [
        c.customerCode,
        c.name,
        c.phone,
        c.city ?? "—",
        c.status,
        formatDate(c.createdAt),
      ]),
      filename: "customer-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Customer Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {summary.count} customer{summary.count !== 1 ? "s" : ""}
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
        <StatCard title="Total customers" value={String(summary.count)} icon={Users} iconBg="#F1EFE8" iconColor="#5F5E5A" />
        <StatCard title="Active" value={String(summary.byStatus.ACTIVE ?? 0)} icon={CheckCircle2} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Closed" value={String(summary.byStatus.CLOSED ?? 0)} icon={Archive} iconBg="#F1EFE8" iconColor="#5F5E5A" />
        <StatCard title="Blocked" value={String(summary.byStatus.BLOCKED ?? 0)} icon={AlertTriangle} iconBg="#FAEEDA" iconColor="#854F0B" />
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, code, phone, city..."
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
          />

          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          >
            <option value="all">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="CLOSED">Closed</option>
            <option value="BLOCKED">Blocked</option>
          </select>
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-[#185FA5] hover:underline">
            Clear filters
          </button>
        )}
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
            <CustomerTable customers={customers} />

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
