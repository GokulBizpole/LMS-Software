// app/(dashboard)/reports/collections/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { useCollectionReport } from "@/hooks/useCollectionReport";
import PaymentTable from "@/components/tables/PaymentTable";
import StatCard from "@/components/dashboard/StatCard";
import Pagination from "@/components/ui/Pagination";
import { getPartners } from "@/services/partner.service";
import { getCustomers } from "@/services/customer.service";
import type { Partner } from "@/types/partner";
import type { Customer } from "@/types/customer";
import type { PaymentStatus } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { PiggyBank, Receipt, Users, AlertTriangle, Download, FileDown } from "lucide-react";

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
    pageSize,
    setPageSize,
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

  // Reports UI only — computed client-side from the already-fetched `filtered`
  // set, no new API/data-fetching.
  const uniqueCustomers = useMemo(
    () => new Set(filtered.map((p) => p.loan.customer.customerCode)).size,
    [filtered]
  );

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
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Collection Report</h1>
          <p className="text-sm text-[#45443E]">Payments received, by status, partner and date.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 bg-[#FCE4E4] text-sm font-medium px-4 py-2 rounded-lg text-[#E31E24] hover:bg-[#E31E24]/15"
          >
            <FileDown size={15} />
            Export CSV
          </button>
          <button
            onClick={handleDownload}
            disabled={loading || filtered.length === 0}
            className="flex items-center gap-2 bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            <Download size={15} />
            Download PDF
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 space-y-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search receipt, loan, customer..."
          className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
        />

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">From date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">To date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
            />
          </div>
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">Partner</label>
            <select
              value={partnerCode}
              onChange={(e) => setPartnerCode(e.target.value)}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] bg-white"
            >
              <option value="all">All partners</option>
              {partners.map((p) => (
                <option key={p.id} value={p.partnerCode}>
                  {p.partnerCode} · {p.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">Customer</label>
            <select
              value={customerCode}
              onChange={(e) => setCustomerCode(e.target.value)}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] bg-white"
            >
              <option value="all">All customers</option>
              {customers.map((c) => (
                <option key={c.id} value={c.customerCode}>
                  {c.customerCode} · {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as typeof status)}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] bg-white"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="bg-[#E31E24] text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-[#E31E24]/90"
          >
            Apply filters
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total collected" value={formatCurrency(summary.totalReceived)} icon={PiggyBank} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Number of receipts" value={String(summary.count)} icon={Receipt} iconBg="#ECE9DF" iconColor="#45443E" />
        <StatCard title="Unique customers" value={String(uniqueCustomers)} icon={Users} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Total penalty" value={formatCurrency(summary.totalPenalty)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#E31E24" />
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
            <p className="text-[#E31E24] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#E31E24] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <PaymentTable payments={payments} />

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
