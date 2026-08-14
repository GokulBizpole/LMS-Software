// app/(dashboard)/reports/loans/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useLoanReport } from "@/hooks/useLoanReport";
import LoanTable from "@/components/tables/LoanTable";
import StatCard from "@/components/dashboard/StatCard";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { getPartners } from "@/services/partner.service";
import { getCustomers } from "@/services/customer.service";
import type { Partner } from "@/types/partner";
import type { Customer } from "@/types/customer";
import type { LoanStatus } from "@/types/loan";
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

export default function LoanReportPage() {
  const {
    loans,
    filtered,
    summary,
    page,
    setPage,
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
    refetch,
  } = useLoanReport();

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
      value: partnerId,
      onChange: (v) => setPartnerId(v),
      options: [
        { value: "all", label: "All partners" },
        ...partners.map((p) => ({ value: p.id, label: `${p.partnerCode} · ${p.name}` })),
      ],
    },
    {
      key: "customer",
      label: "Customer",
      kind: "select",
      value: customerId,
      onChange: (v) => setCustomerId(v),
      options: [
        { value: "all", label: "All customers" },
        ...customers.map((c) => ({ value: c.id, label: `${c.customerCode} · ${c.name}` })),
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
    partnerId !== "all" && `Partner: ${partners.find((p) => p.id === partnerId)?.partnerCode ?? partnerId}`,
    customerId !== "all" && `Customer: ${customers.find((c) => c.id === customerId)?.customerCode ?? customerId}`,
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
      columns: ["Loan number", "Customer", "Partner", "Principal", "Payable", "Balance", "Status", "Created"],
      rows: filtered.map((l) => [
        l.loanNumber,
        l.customer?.name ?? "—",
        l.partner?.name ?? "—",
        formatCurrency(l.principalAmount),
        formatCurrency(l.totalPayable),
        formatCurrency(l.balanceAmount),
        l.status,
        formatDate(l.createdAt),
      ]),
      filename: "loan-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Loan Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {summary.count} loan{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalPrincipal)} principal
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
          placeholder="Search loan, customer, partner..."
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
            <LoanTable loans={loans} />

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
