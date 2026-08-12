// app/(dashboard)/reports/page.tsx
"use client";

import Link from "next/link";
import {
  Users,
  Handshake,
  FileText,
  Wallet,
  PiggyBank,
  AlertTriangle,
  Receipt,
  TrendingUp,
} from "lucide-react";
import { useDashboard } from "@/hooks/useDashboard";
import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency } from "@/utils/formatCurrency";
import { exportReportPdf } from "@/utils/exportPdf";

const REPORT_LINKS = [
  { href: "/reports/collections", label: "Collection Report", description: "Payments received, by status, partner and date." },
  { href: "/reports/loans", label: "Loan Report", description: "Loan book by status, partner and customer." },
  { href: "/reports/partners", label: "Partner Report", description: "Per-partner investment, collection and outstanding." },
  { href: "/reports/customers", label: "Customer Report", description: "Customer master data and status breakdown." },
  { href: "/reports/expenses", label: "Expense Report", description: "Expenses by category, partner and date." },
  { href: "/reports/profit-loss", label: "Profit & Loss Report", description: "Collections vs expenses, net profit." },
];

export default function ReportsDashboardPage() {
  const { data, loading, error, refetch } = useDashboard();

  const netProfit = data ? Number(data.totalCollection) - Number(data.totalExpense) : 0;

  const handleDownload = () => {
    if (!data) return;

    exportReportPdf({
      title: "Reports Dashboard — Overview",
      summary: [
        { label: "Total customers", value: String(data.totalCustomers) },
        { label: "Total partners", value: String(data.totalPartners) },
        { label: "Active loans", value: String(data.activeLoans) },
        { label: "Pending loans", value: String(data.pendingLoans) },
        { label: "Total loan amount", value: formatCurrency(data.totalLoanAmount) },
        { label: "Outstanding amount", value: formatCurrency(data.outstandingAmount) },
        { label: "Total collection", value: formatCurrency(data.totalCollection) },
        { label: "Total expense", value: formatCurrency(data.totalExpense) },
        { label: "Net profit", value: formatCurrency(netProfit) },
      ],
      columns: ["Metric", "Value"],
      rows: [
        ["Total customers", String(data.totalCustomers)],
        ["Total partners", String(data.totalPartners)],
        ["Active loans", String(data.activeLoans)],
        ["Pending loans", String(data.pendingLoans)],
        ["Closed loans", String(data.closedLoans)],
        ["Approved loans", String(data.approvedLoans)],
        ["Rejected loans", String(data.rejectedLoans)],
        ["Total loan amount", formatCurrency(data.totalLoanAmount)],
        ["Outstanding amount", formatCurrency(data.outstandingAmount)],
        ["Total collection", formatCurrency(data.totalCollection)],
        ["Total expense", formatCurrency(data.totalExpense)],
        ["Today's collection", formatCurrency(data.todayCollection)],
        ["Monthly collection", formatCurrency(data.monthlyCollection)],
        ["Today's expense", formatCurrency(data.todayExpense)],
        ["Monthly expense", formatCurrency(data.monthlyExpense)],
        ["Net profit", formatCurrency(netProfit)],
      ],
      filename: "reports-dashboard-overview.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Reports</h1>
          <p className="text-sm text-[#5F5E5A]">Overview across the whole business.</p>
        </div>
        <button
          onClick={handleDownload}
          disabled={!data}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
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
      ) : data ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total customers" value={String(data.totalCustomers)} icon={Users} iconBg="#F1EFE8" iconColor="#5F5E5A" />
          <StatCard title="Total partners" value={String(data.totalPartners)} icon={Handshake} iconBg="#F1EFE8" iconColor="#5F5E5A" />
          <StatCard title="Active loans" value={String(data.activeLoans)} icon={FileText} iconBg="#EEEDFE" iconColor="#534AB7" />
          <StatCard title="Total loan amount" value={formatCurrency(data.totalLoanAmount)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
          <StatCard title="Total collection" value={formatCurrency(data.totalCollection)} icon={PiggyBank} iconBg="#EAF3DE" iconColor="#3B6D11" />
          <StatCard title="Outstanding amount" value={formatCurrency(data.outstandingAmount)} icon={AlertTriangle} iconBg="#FAECE7" iconColor="#993C1D" />
          <StatCard title="Total expense" value={formatCurrency(data.totalExpense)} icon={Receipt} iconBg="#FAECE7" iconColor="#993C1D" />
          <StatCard title="Net profit" value={formatCurrency(netProfit)} icon={TrendingUp} iconBg="#EAF3DE" iconColor="#3B6D11" />
        </div>
      ) : null}

      <div>
        <h2 className="text-sm font-semibold text-[#2C2C2A] mb-3">Detailed reports</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {REPORT_LINKS.map((r) => (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-2xl border border-[#E8E6DF] bg-white p-5 hover:border-[#B4B2A9] transition-colors"
            >
              <p className="text-sm font-semibold text-[#2C2C2A] mb-1">{r.label}</p>
              <p className="text-xs text-[#888780]">{r.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
