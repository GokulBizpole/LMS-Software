// app/(dashboard)/reports/customers/page.tsx
"use client";

import { useCustomerReport } from "@/hooks/useCustomerReport";
import CustomerTable from "@/components/tables/CustomerTable";
import StatCard from "@/components/dashboard/StatCard";
import Pagination from "@/components/ui/Pagination";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
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
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    loading,
    error,
    refetch,
  } = useCustomerReport();

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
        { value: "CLOSED", label: "Closed" },
        { value: "BLOCKED", label: "Blocked" },
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
          <h1 className="text-xl font-bold text-[#1A1A18]">Customer Report</h1>
          <p className="text-sm text-[#45443E]">
            {summary.count} customer{summary.count !== 1 ? "s" : ""}
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
        <StatCard title="Total customers" value={String(summary.count)} icon={Users} iconBg="#ECE9DF" iconColor="#45443E" />
        <StatCard title="Active" value={String(summary.byStatus.ACTIVE ?? 0)} icon={CheckCircle2} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Closed" value={String(summary.byStatus.CLOSED ?? 0)} icon={Archive} iconBg="#ECE9DF" iconColor="#45443E" />
        <StatCard title="Blocked" value={String(summary.byStatus.BLOCKED ?? 0)} icon={AlertTriangle} iconBg="#FAEEDA" iconColor="#854F0B" />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name, code, phone, city..."
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
            <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <CustomerTable customers={customers} />

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
