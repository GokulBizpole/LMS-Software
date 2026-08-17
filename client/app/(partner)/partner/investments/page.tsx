// app/(partner)/partner/investments/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PiggyBank, Wallet, TrendingUp } from "lucide-react";
import { getMyProfile } from "@/services/partnerProfile.service";
import StatCard from "@/components/dashboard/StatCard";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

export default function PartnerInvestmentsPage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyProfile()
      .then(setPartner)
      .catch((err) => {
        console.error(err);
        setError("Could not load investment details.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="rounded-2xl bg-[#ECE9DF] p-5 min-h-27.5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center">
        <p className="text-[#993C1D] font-medium mb-2">{error ?? "No data available."}</p>
        <button onClick={load} className="text-sm font-semibold text-[#993C1D] underline">
          Try again
        </button>
      </div>
    );
  }

  const amountUsed = partner.stats?.totalLoanAmount ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Investments</h1>
        <p className="text-sm text-[#45443E]">Your capital and how it&apos;s been used.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Invested" value={formatCurrency(partner.investmentAmount)} icon={PiggyBank} iconBg="#EEEDFE" iconColor="#534AB7" />
        <StatCard title="Amount Used for Loans" value={formatCurrency(amountUsed)} icon={TrendingUp} iconBg="#FAEEDA" iconColor="#854F0B" />
        <StatCard title="Available Balance" value={formatCurrency(partner.currentBalance)} icon={Wallet} iconBg="#EAF3DE" iconColor="#3B6D11" />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Investment usage history</h3>
        <p className="text-xs text-[#6B6A62] mb-4">
          Each loan below represents capital disbursed from your investment.
        </p>
        {!partner.loans || partner.loans.length === 0 ? (
          <div className="flex items-center justify-center h-32 text-sm text-[#6B6A62]">
            No loans disbursed yet.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="py-2 px-4 font-medium">Loan number</th>
                  <th className="py-2 px-4 font-medium">Customer</th>
                  <th className="py-2 px-4 font-medium text-right">Principal</th>
                  <th className="py-2 px-4 font-medium">Status</th>
                  <th className="py-2 px-4 font-medium">Date</th>
                  <th className="py-2 px-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {partner.loans.map((l) => (
                  <tr key={l.id} className="border-b border-[#E5E7EB] last:border-0">
                    <td className="py-3 px-4 text-[#1A1A18] font-medium">{l.loanNumber}</td>
                    <td className="py-3 px-4 text-[#45443E]">
                      {l.customer.name} · {l.customer.customerCode}
                    </td>
                    <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(l.principalAmount)}</td>
                    <td className="py-3 px-4 text-[#45443E]">{l.status}</td>
                    <td className="py-3 px-4 text-[#45443E]">{formatDate(l.createdAt)}</td>
                    <td className="py-3 px-4 text-right">
                      <Link href={`/partner/loans/${l.id}`} className="text-[#185FA5] font-medium hover:underline">
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
