// app/(dashboard)/reports/collections/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useCollectionReport } from "@/hooks/useCollectionReport";
import PaymentTable from "@/components/tables/PaymentTable";
import StatCard from "@/components/dashboard/StatCard";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { getPartners } from "@/services/partner.service";
import { getCustomers } from "@/services/customer.service";
import type { Partner } from "@/types/partner";
import type { Customer } from "@/types/customer";
import type { PaymentStatus } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { PiggyBank, AlertTriangle, Receipt, ListChecks } from "lucide-react";

const STATUS_OPTIONS: { key: PaymentStatus | "all"; label: string }[] = [
  { key: "all", label: "All statuses" },
  { key: "PAID", label: "Paid" },
  { key: "PENDING", label: "Pending" },
  { key: "LATE", label: "Late" },
];

export default function CollectionReportPage() {
  const {
    payments,
    filtered,
    summary,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    partnerCode,
    setPartnerCode,
    customerCode,
    setCustomerCode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch,
  } = useCollectionReport();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  useEffect(() => {
    getPartners({ limit: 1000 }).then((r) => setPartners(r.partners)).catch(() => setPartners([]));
    getCustomers({ limit: 1000 }).then((r) => setCustomers(r.customers)).catch(() => setCustomers([]));
  }, []);

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
      key: "partner",
      label: "Partner",
      kind: "select",
      value: partnerCode,
      onChange: (v) => setPartnerCode(v),
      options: [
        { value: "all", label: "All partners" },
        ...partners.map((p) => ({ value: p.partnerCode, label: `${p.partnerCode} · ${p.name}` })),
      ],
    },
    {
      key: "customer",
      label: "Customer",
      kind: "select",
      value: customerCode,
      onChange: (v) => setCustomerCode(v),
      options: [
        { value: "all", label: "All customers" },
        ...customers.map((c) => ({ value: c.customerCode, label: `${c.customerCode} · ${c.name}` })),
      ],
    },
    {
      key: "date",
      label: "Date",
      kind: "dateRange",
      startValue: startDate,
      endValue: endDate,
      onStartChange: (v) => setStartDate(v),
      onEndChange: (v) => setEndDate(v),
    },
  ];

  const filtersSummary = [
    startDate && `From ${startDate}`,
    endDate && `To ${endDate}`,
    status !== "all" && `Status: ${status}`,
    partnerCode !== "all" && `Partner: ${partnerCode}`,
    customerCode !== "all" && `Customer: ${customerCode}`,
    search && `Search: "${search}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDownload = () => {
    exportReportPdf({
      title: "Collection Report",
      filtersSummary: filtersSummary || "None",
      summary: [
        { label: "Payments", value: String(summary.count) },
        { label: "Total received", value: formatCurrency(summary.totalReceived) },
        { label: "Total penalty", value: formatCurrency(summary.totalPenalty) },
        { label: "Paid", value: String(summary.byStatus.PAID ?? 0) },
        { label: "Pending", value: String(summary.byStatus.PENDING ?? 0) },
        { label: "Late", value: String(summary.byStatus.LATE ?? 0) },
      ],
      columns: [
        "Receipt", "Loan", "Customer", "Partner", "Amount", "Penalty", "Total received", "Method", "Status", "Paid on",
      ],
      rows: filtered.map((p) => [
        p.receiptNumber,
        p.loan.loanNumber,
        p.loan.customer.name,
        p.loan.partner ? p.loan.partner.name : "—",
        formatCurrency(p.amount),
        formatCurrency(p.penalty),
        formatCurrency(p.totalReceived),
        p.paymentMethod,
        p.paymentStatus,
        p.paidAt ? formatDate(p.paidAt) : "—",
      ]),
      filename: "collection-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Collection Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {summary.count} payment{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalReceived)} received
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
        <StatCard title="Total received" value={formatCurrency(summary.totalReceived)} icon={PiggyBank} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Total penalty" value={formatCurrency(summary.totalPenalty)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#993C1D" />
        <StatCard title="Payments" value={String(summary.count)} icon={Receipt} iconBg="#F1EFE8" iconColor="#5F5E5A" />
        <StatCard title="Paid / Pending / Late" value={`${summary.byStatus.PAID ?? 0} / ${summary.byStatus.PENDING ?? 0} / ${summary.byStatus.LATE ?? 0}`} icon={ListChecks} iconBg="#EEEDFE" iconColor="#534AB7" />
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt, loan, customer..."
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
            <PaymentTable payments={payments} />

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
