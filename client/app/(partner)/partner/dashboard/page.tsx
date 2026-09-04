// app/(partner)/partner/dashboard/page.tsx
"use client";

import Link from "next/link";
import { Users, FileText, Wallet, Landmark, TrendingUp, Clock } from "lucide-react";
import StatCard from "@/components/dashboard/StatCard";
import CompactStatCard from "@/components/dashboard/CompactStatCard";
import { usePartnerDashboard } from "@/hooks/usePartnerDashboard";
import { useAuth } from "@/hooks/useAuth";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export default function PartnerDashboardPage() {
  const { user } = useAuth();
  const { data, loading, error, errorType, refetch } = usePartnerDashboard();

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">
          Welcome, {user?.name ?? "Partner"}
        </h1>
        <p className="text-sm text-[#45443E]">Here&apos;s an overview of your book.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Loan Amount" value={formatCurrency(data.totalLoanAmount)} icon={Wallet} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Total Outstanding" value={formatCurrency(data.outstandingAmount)} icon={Landmark} iconBg="#E6F1FB" iconColor="#185FA5" />
        <StatCard title="Total Collected" value={formatCurrency(data.totalCollection)} icon={TrendingUp} iconBg="#EAF3DE" iconColor="#3B6D11" />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <CompactStatCard title="Total Customers" value={String(data.totalCustomers)} icon={Users} bg="#EEEDFE" iconColor="#534AB7" />
        <CompactStatCard title="Active Loans" value={String(data.activeLoans)} icon={FileText} bg="#EAF3DE" iconColor="#3B6D11" />
        <CompactStatCard title="Pending Loans" value={String(data.pendingLoans)} icon={Clock} bg="#FAEEDA" iconColor="#854F0B" />
        <CompactStatCard title="Today's Collection" value={formatCurrency(data.todayCollection)} icon={Wallet} bg="#E6F1FB" iconColor="#185FA5" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Recent customers</h3>
            <Link href="/partner/customers" className="text-xs font-medium text-[#185FA5] hover:underline">
              View all
            </Link>
          </div>
          {data.recentCustomers.length === 0 ? (
            <p className="text-sm text-[#6B6A62] py-6 text-center">No customers yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentCustomers.map((c) => (
                <Link
                  key={c.id}
                  href={`/partner/customers/${c.id}`}
                  className="flex items-center justify-between text-sm hover:bg-[#F8FAFC] rounded-lg px-2 py-1.5 -mx-2"
                >
                  <div>
                    <p className="text-[#1A1A18]">{c.name}</p>
                    <p className="text-xs text-[#6B6A62]">{c.customerCode}</p>
                  </div>
                  <span className="text-xs text-[#6B6A62]">{formatDate(c.createdAt)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Recent loans</h3>
            <Link href="/partner/loans" className="text-xs font-medium text-[#185FA5] hover:underline">
              View all
            </Link>
          </div>
          {data.recentLoans.length === 0 ? (
            <p className="text-sm text-[#6B6A62] py-6 text-center">No loans yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentLoans.map((l) => (
                <Link
                  key={l.id}
                  href={`/partner/loans/${l.id}`}
                  className="flex items-center justify-between text-sm hover:bg-[#F8FAFC] rounded-lg px-2 py-1.5 -mx-2"
                >
                  <div>
                    <p className="text-[#1A1A18]">{l.customer.name}</p>
                    <p className="text-xs text-[#6B6A62]">{l.loanNumber}</p>
                  </div>
                  <span className="text-xs text-[#45443E]">{formatCurrency(l.principalAmount)}</span>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Recent payments</h3>
            <Link href="/partner/payments" className="text-xs font-medium text-[#185FA5] hover:underline">
              View all
            </Link>
          </div>
          {data.recentPayments.length === 0 ? (
            <p className="text-sm text-[#6B6A62] py-6 text-center">No payments yet.</p>
          ) : (
            <div className="space-y-3">
              {data.recentPayments.map((p) => (
                <div key={p.id} className="flex items-center justify-between text-sm px-2 py-1.5">
                  <div>
                    <p className="text-[#1A1A18]">{p.loan.customer.name}</p>
                    <p className="text-xs text-[#6B6A62]">{p.receiptNumber}</p>
                  </div>
                  <span className="text-xs font-medium text-[#3B6D11]">{formatCurrency(p.totalReceived)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
