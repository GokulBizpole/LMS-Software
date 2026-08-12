// app/(dashboard)/reports/expenses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseTable from "@/components/tables/ExpenseTable";
import StatCard from "@/components/dashboard/StatCard";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { exportReportPdf } from "@/utils/exportPdf";
import { Receipt, ListChecks } from "lucide-react";

export default function ExpenseReportPage() {
  const {
    expenses,
    total,
    totalAmount,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    category,
    setCategory,
    partnerId,
    setPartnerId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch,
  } = useExpenses();

  const [partners, setPartners] = useState<Partner[]>([]);

  useEffect(() => {
    getPartners({ limit: 1000 }).then((r) => setPartners(r.partners)).catch(() => setPartners([]));
  }, []);

  const hasActiveFilters =
    search || category !== "all" || partnerId !== "all" || startDate || endDate;

  const clearFilters = () => {
    setSearch("");
    setCategory("all");
    setPartnerId("all");
    setStartDate("");
    setEndDate("");
    setPage(1);
  };

  const filtersSummary = [
    startDate && `From ${startDate}`,
    endDate && `To ${endDate}`,
    category !== "all" && `Category: ${category}`,
    partnerId !== "all" && `Partner: ${partners.find((p) => p.id === partnerId)?.partnerCode ?? partnerId}`,
    search && `Search: "${search}"`,
  ]
    .filter(Boolean)
    .join(" · ");

  const handleDownload = () => {
    exportReportPdf({
      title: "Expense Report",
      filtersSummary: filtersSummary || "None",
      summary: [
        { label: "Expenses", value: String(total) },
        { label: "Total amount", value: formatCurrency(totalAmount) },
      ],
      columns: ["Date", "Category", "Partner", "Description", "Amount"],
      rows: expenses.map((e) => [
        formatDate(e.expenseDate),
        e.category,
        e.partner ? `${e.partner.partnerCode} · ${e.partner.name}` : "—",
        e.description || "—",
        formatCurrency(e.amount),
      ]),
      filename: "expense-report.pdf",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Expense Report</h1>
          <p className="text-sm text-[#5F5E5A]">
            {total} expense{total !== 1 ? "s" : ""} · {formatCurrency(totalAmount)} total
          </p>
        </div>
        <button
          onClick={handleDownload}
          disabled={loading || expenses.length === 0}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          Download PDF
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total expenses" value={String(total)} icon={ListChecks} iconBg="#F1EFE8" iconColor="#5F5E5A" />
        <StatCard title="Total amount" value={formatCurrency(totalAmount)} icon={Receipt} iconBg="#FAECE7" iconColor="#993C1D" />
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search description, partner..."
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm sm:col-span-2 lg:col-span-1"
          />

          <select
            value={category}
            onChange={(e) => {
              setCategory(e.target.value as typeof category);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          >
            <option value="all">All categories</option>
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={partnerId}
            onChange={(e) => {
              setPartnerId(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          >
            <option value="all">All partners</option>
            {partners.map((p) => (
              <option key={p.id} value={p.id}>{p.partnerCode} · {p.name}</option>
            ))}
          </select>

          <input
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          />

          <input
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          />
        </div>

        {hasActiveFilters && (
          <button onClick={clearFilters} className="text-sm font-medium text-[#185FA5] hover:underline">
            Clear filters
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F1EFE8] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-[#993C1D] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <ExpenseTable expenses={expenses} onChanged={refetch} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1EFE8]">
                <p className="text-xs text-[#888780]">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
