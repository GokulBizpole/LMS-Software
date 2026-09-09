// app/(dashboard)/dashboard/page.tsx
"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Wallet,
  Landmark,
  TrendingUp,
  Users,
  Handshake,
  Clock,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CompactStatCard from "@/components/dashboard/CompactStatCard";
import RecentActivityTable from "@/components/dashboard/RecentActivityTable";
import CollectionTrendChart from "@/components/dashboard/CollectionTrendChart";
import QuickActions from "@/components/dashboard/QuickActions";
import { useDashboard } from "@/hooks/useDashboard";
import { useRecentActivity } from "@/hooks/useRecentActivity";
import { useAuthContext } from "@/contexts/AuthContext";
import { formatCurrency } from "@/utils/formatCurrency";
import { DASHBOARD_PERIOD_OPTIONS } from "@/types/dashboard";

function DashboardLoadingView() {
  return (
    <div className="flex flex-col items-center justify-center gap-5 py-24">
      <Image src="/logo.svg" alt="SKA Trust" width={64} height={64} />
      <div className="w-8 h-8 rounded-full border-2 border-[#DAD7CA] border-t-[#185FA5] animate-spin" />
      <p className="text-sm text-[#45443E]">Loading your workspace…</p>
    </div>
  );
}

function PeriodSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = DASHBOARD_PERIOD_OPTIONS.find((o) => o.value === value)?.label ?? "This month";

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-1.5 text-sm font-medium text-[#1A1A18] border border-[#9C9A8D] rounded-lg px-3 py-2 hover:bg-[#ECE9DF]"
      >
        {current}
        <ChevronDown size={14} />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border border-[#DAD7CA] bg-white shadow-lg py-1">
            {DASHBOARD_PERIOD_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => {
                  onChange(o.value);
                  setOpen(false);
                }}
                className={`w-full text-left text-sm px-3 py-2 hover:bg-[#ECE9DF] ${
                  o.value === value ? "text-[#185FA5] font-medium" : "text-[#1A1A18]"
                }`}
              >
                {o.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function DashboardPage() {
  const { data, loading, error, errorType, period, setPeriod, refetch } = useDashboard();
  const {
    items: activityItems,
    loading: activityLoading,
    error: activityError,
    refetch: refetchActivity,
  } = useRecentActivity();
  const { user } = useAuthContext();

  if (loading) {
    return <DashboardLoadingView />;
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

  const firstName = user?.name?.split(" ")[0] ?? "";
  const periodLabel = DASHBOARD_PERIOD_OPTIONS.find((o) => o.value === period)?.label.toLowerCase() ?? "last period";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Dashboard</h1>
          <p className="text-sm text-[#45443E]">
            Welcome back{firstName ? `, ${firstName}` : ""} — here&apos;s what&apos;s happening today.
          </p>
        </div>
        <PeriodSelect value={period} onChange={(v) => setPeriod(v as typeof period)} />
      </div>

      {/* Row 1 — headline money stats, trend vs prior equivalent period */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Collection"
          value={formatCurrency(data.totalCollection)}
          icon={Wallet}
          iconBg="#EAF3DE"
          iconColor="#3B6D11"
          trend={data.trends.totalCollection}
          trendLabel={`vs ${periodLabel === "this month" ? "last month" : `prior ${periodLabel.replace("this ", "")}`}`}
        />
        <StatCard
          title="Outstanding Amount"
          value={formatCurrency(data.outstandingAmount)}
          icon={Landmark}
          iconBg="#E6F1FB"
          iconColor="#185FA5"
          trend={data.trends.outstandingAmount}
          trendLabel="vs period start"
        />
        <StatCard
          title="Total Loan Amount"
          value={formatCurrency(data.totalLoanAmount)}
          icon={Wallet}
          iconBg="#EEEDFE"
          iconColor="#534AB7"
          trend={data.trends.totalLoanAmount}
          trendLabel={`vs ${periodLabel === "this month" ? "last month" : `prior ${periodLabel.replace("this ", "")}`}`}
        />
        <StatCard
          title="Net Profit (MTD)"
          value={formatCurrency(data.netProfit)}
          icon={TrendingUp}
          iconBg="#EAF3DE"
          iconColor="#3B6D11"
          trend={data.trends.netProfit}
          trendLabel="vs last month"
        />
      </div>

      {/* Row 2 — today vs monthly, always fixed granularity */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Today's Collection"
          value={formatCurrency(data.todayCollection)}
          icon={Wallet}
          iconBg="#E6F1FB"
          iconColor="#185FA5"
          trend={data.trends.todayCollection}
          trendLabel="vs yesterday"
          fallback="no activity yet today"
        />
        <StatCard
          title="Monthly Collection"
          value={formatCurrency(data.monthlyCollection)}
          icon={Wallet}
          iconBg="#E6F1FB"
          iconColor="#185FA5"
          trend={data.trends.monthlyCollection}
          trendLabel="vs last month"
        />
        <StatCard
          title="Today's Expense"
          value={formatCurrency(data.todayExpense)}
          icon={Wallet}
          iconBg="#FAECE7"
          iconColor="#993C1D"
          trend={data.trends.todayExpense}
          trendLabel="vs yesterday"
          fallback="no activity yet today"
        />
        <StatCard
          title="Monthly Expense"
          value={formatCurrency(data.monthlyExpense)}
          icon={Wallet}
          iconBg="#FAECE7"
          iconColor="#993C1D"
          trend={data.trends.monthlyExpense}
          trendLabel="vs last month"
          fallback="no expense recorded"
        />
      </div>

      {/* Row 3 — customers & partners */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard title="Total Customers" value={String(data.totalCustomers)} icon={Users} bg="#EEEDFE" iconColor="#534AB7" />
        <CompactStatCard title="Total Partners" value={String(data.totalPartners)} icon={Handshake} bg="#E6F1FB" iconColor="#185FA5" />
        <CompactStatCard title="Active Partners" value={String(data.activePartners)} icon={CheckCircle2} bg="#EAF3DE" iconColor="#3B6D11" />
        <CompactStatCard title="Inactive Partners" value={String(data.inactivePartners)} icon={Clock} bg="#ECE9DF" iconColor="#6B6A62" />
      </div>

      {/* Row 4 — recent activity + collection trend / quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Recent activity</h3>
            <a href="/reports" className="text-sm font-medium text-[#185FA5] hover:underline">
              View all →
            </a>
          </div>
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

        <div className="space-y-4">
          <CollectionTrendChart data={data.weeklyTrend} total={data.weeklyTotal} />
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
