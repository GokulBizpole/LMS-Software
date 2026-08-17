// app/(partner)/partner/reports/page.tsx
"use client";

import Link from "next/link";
import { FileText, Wallet, AlertTriangle } from "lucide-react";

const REPORTS = [
  {
    href: "/partner/reports/loans",
    title: "Loan Report",
    description: "All loans you've submitted, with status, terms and balances.",
    icon: FileText,
    iconBg: "#EEEDFE",
    iconColor: "#534AB7",
  },
  {
    href: "/partner/reports/collections",
    title: "Collection / Payment History",
    description: "Every payment you've collected across all your loans.",
    icon: Wallet,
    iconBg: "#EAF3DE",
    iconColor: "#3B6D11",
  },
  {
    href: "/partner/reports/outstanding",
    title: "Outstanding Report",
    description: "Loans with a pending balance, sorted by amount owed.",
    icon: AlertTriangle,
    iconBg: "#FAECE7",
    iconColor: "#993C1D",
  },
];

export default function PartnerReportsHubPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Reports</h1>
        <p className="text-sm text-[#45443E]">Download and review reports for your own book.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {REPORTS.map((r) => {
          const Icon = r.icon;
          return (
            <Link
              key={r.href}
              href={r.href}
              className="rounded-2xl border border-[#DAD7CA] bg-white p-5 hover:shadow-sm transition-shadow"
            >
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center mb-4"
                style={{ backgroundColor: r.iconBg }}
              >
                <Icon size={18} style={{ color: r.iconColor }} />
              </div>
              <h3 className="text-sm font-semibold text-[#1A1A18] mb-1">{r.title}</h3>
              <p className="text-xs text-[#6B6A62]">{r.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
