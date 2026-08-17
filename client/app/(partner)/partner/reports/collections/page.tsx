// app/(partner)/partner/reports/collections/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { getMyCollectionReport } from "@/services/partnerReport.service";
import { downloadMyReceipt } from "@/services/partnerPayment.service";
import PaymentTable from "@/components/tables/PaymentTable";
import StatCard from "@/components/dashboard/StatCard";
import Pagination from "@/components/ui/Pagination";
import type { Payment } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { Wallet, Receipt } from "lucide-react";

export default function PartnerCollectionReportPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyCollectionReport()
      .then(setPayments)
      .catch((err) => {
        console.error(err);
        setError("Could not load the collection report. Please try again.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);
  useEffect(() => setPage(1), [pageSize, search]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return payments;
    return payments.filter((p) => {
      const haystack = [p.receiptNumber, p.loan.loanNumber, p.loan.customer.name, p.loan.customer.customerCode]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(term);
    });
  }, [payments, search]);

  const summary = useMemo(
    () =>
      filtered.reduce(
        (acc, p) => {
          acc.count += 1;
          acc.totalReceived += Number(p.totalReceived);
          return acc;
        },
        { count: 0, totalReceived: 0 }
      ),
    [filtered]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const handleDownload = () => {
    exportReportPdf({
      title: "Collection / Payment History Report",
      filtersSummary: search ? `Search: "${search}"` : "None",
      summary: [
        { label: "Payments", value: String(summary.count) },
        { label: "Total collected", value: formatCurrency(summary.totalReceived) },
      ],
      columns: ["Receipt", "Loan", "Customer", "Installment", "Amount", "Total received", "Method", "Paid on"],
      rows: filtered.map((p) => [
        p.receiptNumber,
        p.loan.loanNumber,
        p.loan.customer.name,
        String(p.installmentNumber),
        formatCurrency(p.amount),
        formatCurrency(p.totalReceived),
        p.paymentMethod.replace("_", " "),
        p.paidAt ? formatDate(p.paidAt) : "—",
      ]),
      filename: "my-collection-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Collection / Payment History</h1>
          <p className="text-sm text-[#45443E]">
            {summary.count} payment{summary.count !== 1 ? "s" : ""} · {formatCurrency(summary.totalReceived)} collected
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
        <StatCard title="Total payments" value={String(summary.count)} icon={Receipt} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Total collected" value={formatCurrency(summary.totalReceived)} icon={Wallet} iconBg="#EAF3DE" iconColor="#3B6D11" />
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by receipt no, loan no, customer name..."
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
            <PaymentTable payments={paginated} onDownloadReceipt={downloadMyReceipt} />

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
