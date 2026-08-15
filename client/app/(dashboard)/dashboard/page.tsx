// app/(dashboard)/dashboard/page.tsx
"use client";

import {
  Wallet,
  Landmark,
  TrendingUp,
  Users,
  Handshake,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CompactStatCard from "@/components/dashboard/CompactStatCard";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import { useDashboard } from "@/hooks/useDashboard";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { formatCurrency } from "@/utils/formatCurrency";

export default function DashboardPage() {
  const { data, loading, error, errorType, refetch } = useDashboard();
  const {
    items: activityItems,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useRecentActivity();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="rounded-2xl bg-[#ECE9DF] p-5 min-h-27.5 animate-pulse"
          >
            <div className="h-3 w-24 bg-[#ECE9DF] rounded mb-4" />
            <div className="h-6 w-32 bg-[#ECE9DF] rounded" />
          </div>
        ))}
      </div>
    );
  }

  if (error || !data) {
    const canRetry = errorType !== "unauthorized";
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center">
        <p className="text-[#993C1D] font-medium mb-2">{error ?? "No data available."}</p>
        {canRetry && (
          <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
            Try again
          </button>
        )}
      </div>
    );
  }

  const netProfitMTD = Number(data.monthlyCollection) - Number(data.monthlyExpense);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-[#1A1A18]">Dashboard</h1>

      {/* Row 1 — headline money stats (directly from API) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Collection" value={formatCurrency(data.totalCollection)} icon={Wallet} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <StatCard title="Outstanding Amount" value={formatCurrency(data.outstandingAmount)} icon={Landmark} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Total Loan Amount" value={formatCurrency(data.totalLoanAmount)} icon={Wallet} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Net Profit (MTD)" value={formatCurrency(netProfitMTD)} icon={TrendingUp} iconBg="#EAF3DE" iconColor="#3B6D11" />
      </div>

      {/* Row 2 — today vs monthly */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Today's Collection" value={formatCurrency(data.todayCollection)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Monthly Collection" value={formatCurrency(data.monthlyCollection)} icon={Wallet} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Today's Expense" value={formatCurrency(data.todayExpense)} icon={Wallet} iconBg="#FAECE7" iconColor="#993C1D" />
        <StatCard title="Monthly Expense" value={formatCurrency(data.monthlyExpense)} icon={Wallet} iconBg="#FAECE7" iconColor="#993C1D" />
      </div>

      {/* Row 3 — loan status breakdown (counts only — API gives no per-loan list) */}
      {/* <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Loan status</h3>
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
          <LoanStatusPill label="Active" count={data.activeLoans} color="#3B6D11" bg="#EAF3DE" icon={CheckCircle2} />
          <LoanStatusPill label="Pending" count={data.pendingLoans} color="#854F0B" bg="#FAEEDA" icon={Clock} />
          <LoanStatusPill label="Approved" count={data.approvedLoans} color="#185FA5" bg="#E6F1FB" icon={CheckCircle2} />
          <LoanStatusPill label="Rejected" count={data.rejectedLoans} color="#993C1D" bg="#FAECE7" icon={XCircle} />
          <LoanStatusPill label="Closed" count={data.closedLoans} color="#45443E" bg="#ECE9DF" icon={CheckCircle2} />
        </div>
      </div> */}

      {/* Row 4 — customers & partners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard title="Total Customers" value={String(data.totalCustomers)} icon={Users} bg="#EEEDFE" iconColor="#534AB7" />
        <CompactStatCard title="Total Partners" value={String(data.totalPartners)} icon={Handshake} bg="#E6F1FB" iconColor="#185FA5" />
        <CompactStatCard title="Active Partners" value={String(data.activePartners)} icon={Handshake} bg="#EAF3DE" iconColor="#3B6D11" />
        <CompactStatCard title="Inactive Partners" value={String(data.inactivePartners)} icon={Handshake} bg="#ECE9DF" iconColor="#45443E" />
      </div>

      {/* Row 5 — recent activity (last 10 payments + expenses, merged client-side) */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Recent activity</h3>
        {activityLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : activityError ? (
          <div className="text-center py-6">
            <p className="text-[#993C1D] text-sm mb-2">{activityError}</p>
            <button onClick={refetchActivity} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <RecentActivityTable items={activityItems} />
        )}
      </div>
    </div>
  );
}

function LoanStatusPill({
  label,
  count,
  color,
  bg,
  icon: Icon,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
  icon: React.ElementType;
}) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl p-3" style={{ backgroundColor: bg }}>
      <Icon size={18} style={{ color }} />
      <span className="text-lg font-bold" style={{ color }}>{count}</span>
      <span className="text-[11px] text-[#45443E]">{label}</span>
    </div>
  );
}