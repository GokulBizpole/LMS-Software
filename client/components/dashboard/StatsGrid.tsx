// components/dashboard/StatsGrid.tsx

import {
  Users,
  Handshake,
  FileText,
  CheckCircle2,
  Archive,
  AlertTriangle,
  Wallet,
  PiggyBank,
  Clock,
  Receipt,
  TrendingUp,
} from "lucide-react";

import StatCard from "./StatCard";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DashboardStats } from "@/types/dashboard";

export default function StatsGrid({
  stats,
}: {
  stats: DashboardStats | null | undefined;
}) {
  // Prevent crash when API data is not loaded yet
  if (!stats) {
    return null;
  }

  // Backend doesn't directly return totalLoans,
  // so calculate it from the available loan statuses.
  const totalLoans =
    stats.activeLoans +
    stats.pendingLoans +
    stats.approvedLoans +
    stats.closedLoans +
    stats.rejectedLoans;

  const cards = [
    {
      title: "Total Customers",
      value: String(stats.totalCustomers),
      icon: Users,
      iconBg: "#F1EFE8",
      iconColor: "#5F5E5A",
    },

    {
      title: "Total Partners",
      value: String(stats.totalPartners),
      icon: Handshake,
      iconBg: "#F1EFE8",
      iconColor: "#5F5E5A",
    },

    {
      title: "Total Loans",
      value: String(totalLoans),
      icon: FileText,
      iconBg: "#EEEDFE",
      iconColor: "#534AB7",
    },

    {
      title: "Active Loans",
      value: String(stats.activeLoans),
      icon: CheckCircle2,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
    },

    {
      title: "Pending Loans",
      value: String(stats.pendingLoans),
      icon: Clock,
      iconBg: "#FAEEDA",
      iconColor: "#854F0B",
    },

    {
      title: "Approved Loans",
      value: String(stats.approvedLoans),
      icon: CheckCircle2,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
    },

    {
      title: "Closed Loans",
      value: String(stats.closedLoans),
      icon: Archive,
      iconBg: "#F1EFE8",
      iconColor: "#5F5E5A",
    },

    {
      title: "Rejected Loans",
      value: String(stats.rejectedLoans),
      icon: AlertTriangle,
      iconBg: "#FAECE7",
      iconColor: "#993C1D",
    },

    {
      title: "Total Loan Amount",
      value: formatCurrency(Number(stats.totalLoanAmount)),
      icon: Wallet,
      iconBg: "#E6F1FB",
      iconColor: "#185FA5",
    },

    {
      title: "Total Collected",
      value: formatCurrency(Number(stats.totalCollection)),
      icon: PiggyBank,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
    },

    {
      title: "Outstanding Amount",
      value: formatCurrency(Number(stats.outstandingAmount)),
      icon: AlertTriangle,
      iconBg: "#FAECE7",
      iconColor: "#993C1D",
    },

    {
      title: "Monthly Collection",
      value: formatCurrency(Number(stats.monthlyCollection)),
      icon: TrendingUp,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
    },

    {
      title: "Monthly Expense",
      value: formatCurrency(Number(stats.monthlyExpense)),
      icon: Receipt,
      iconBg: "#FAECE7",
      iconColor: "#993C1D",
    },

    {
      title: "Total Expenses",
      value: formatCurrency(Number(stats.totalExpense)),
      icon: Receipt,
      iconBg: "#FAECE7",
      iconColor: "#993C1D",
    },

    {
      title: "Today's Collection",
      value: formatCurrency(Number(stats.todayCollection)),
      icon: PiggyBank,
      iconBg: "#EAF3DE",
      iconColor: "#3B6D11",
    },

    {
      title: "Today's Expense",
      value: formatCurrency(Number(stats.todayExpense)),
      icon: Receipt,
      iconBg: "#FAECE7",
      iconColor: "#993C1D",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <StatCard key={card.title} {...card} />
      ))}
    </div>
  );
}