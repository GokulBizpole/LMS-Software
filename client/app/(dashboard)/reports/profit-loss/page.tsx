// app/(dashboard)/reports/profit-loss/page.tsx
"use client";

import { useProfitLossReport } from "@/hooks/useProfitLossReport";
import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/utils/formatCurrency";
import { exportReportPdf } from "@/utils/exportPdf";
import { Wallet, PiggyBank, Receipt, AlertTriangle, TrendingUp } from "lucide-react";

export default function ProfitLossReportPage() {
  const {
    summary,
    mode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearRange,
    loading,
    error,
    refetch,
  } = useProfitLossReport();

  const filtersSummary =
    mode === "range" ? `${startDate} to ${endDate}` : "All-time snapshot";

  const handleDownload = () => {
    if (!summary) return;

    exportReportPdf({
      title: "Profit & Loss Report",
      filtersSummary,
      summary: [
        { label: "Total loan amount", value: formatCurrency(summary.totalLoanAmount) },
        { label: "Total collection", value: formatCurrency(summary.totalCollection) },
        { label: "Total expense", value: formatCurrency(summary.totalExpense) },
        { label: "Outstanding", value: formatCurrency(summary.outstandingAmount) },
        { label: "Net profit", value: formatCurrency(summary.netProfit) },
      ],
      columns: ["Line item", "Amount"],
      rows: [
        ["Total loan amount disbursed", formatCurrency(summary.totalLoanAmount)],
        ["Total collection (income)", formatCurrency(summary.totalCollection)],
        ["Total expense", formatCurrency(summary.totalExpense)],
        ["Outstanding amount", formatCurrency(summary.outstandingAmount)],
        ["Net profit (collection − expense)", formatCurrency(summary.netProfit)],
      ],
      filename: "profit-loss-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Profit &amp; Loss Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {mode === "range" ? `${startDate} to ${endDate}` : "All-time snapshot"}
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading || !summary}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          />
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          />
        </div>

        {mode === "range" && (
          <button onClick={clearRange} className="text-sm font-medium text-[#185FA5] hover:underline">
            Clear date range (show all-time)
          </button>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-[110px] bg-[#F1EFE8] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-2">{error}</p>
          <button onClick={refetch} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      ) : summary ? (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <StatCard title="Total loan amount" value={formatCurrency(summary.totalLoanAmount)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
            <StatCard title="Total collection" value={formatCurrency(summary.totalCollection)} icon={PiggyBank} iconBg="#EAF3DE" iconColor="#3B6D11" />
            <StatCard title="Total expense" value={formatCurrency(summary.totalExpense)} icon={Receipt} iconBg="#FAECE7" iconColor="#993C1D" />
            <StatCard title="Outstanding" value={formatCurrency(summary.outstandingAmount)} icon={AlertTriangle} iconBg="#FAEEDA" iconColor="#854F0B" />
            <StatCard title="Net profit" value={formatCurrency(summary.netProfit)} icon={TrendingUp} iconBg="#EAF3DE" iconColor="#3B6D11" />
          </div>

          <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#888780] text-xs border-b border-[#E8E6DF]">
                  <th className="py-2 pr-4 font-medium">Line item</th>
                  <th className="py-2 pr-4 font-medium text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-[#F1EFE8]">
                  <td className="py-3 pr-4 text-[#5F5E5A]">Total loan amount disbursed</td>
                  <td className="py-3 pr-4 text-[#2C2C2A] text-right">{formatCurrency(summary.totalLoanAmount)}</td>
                </tr>
                <tr className="border-b border-[#F1EFE8]">
                  <td className="py-3 pr-4 text-[#5F5E5A]">Total collection (income)</td>
                  <td className="py-3 pr-4 text-[#2C2C2A] text-right">{formatCurrency(summary.totalCollection)}</td>
                </tr>
                <tr className="border-b border-[#F1EFE8]">
                  <td className="py-3 pr-4 text-[#5F5E5A]">Total expense</td>
                  <td className="py-3 pr-4 text-[#2C2C2A] text-right">{formatCurrency(summary.totalExpense)}</td>
                </tr>
                <tr className="border-b border-[#F1EFE8]">
                  <td className="py-3 pr-4 text-[#5F5E5A]">Outstanding amount</td>
                  <td className="py-3 pr-4 text-[#2C2C2A] text-right">{formatCurrency(summary.outstandingAmount)}</td>
                </tr>
                <tr>
                  <td className="py-3 pr-4 text-[#2C2C2A] font-semibold">Net profit</td>
                  <td className="py-3 pr-4 text-[#2C2C2A] font-semibold text-right">{formatCurrency(summary.netProfit)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      ) : null}
    </div>
  );
}
