// app/(dashboard)/payments/page.tsx
"use client";

import { Search } from "lucide-react";
import { usePayments, type PaymentPeriod } from "@/hooks/usePayments";
import AdminPaymentTable from "@/components/tables/AdminPaymentTable";
import Pagination from "@/components/ui/Pagination";

const PERIOD_TABS: { key: PaymentPeriod; label: string }[] = [
  { key: "all", label: "All" },
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

export default function PaymentsPage() {
  const {
    payments,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    period,
    setPeriod,
    loading,
    error,
    refetch,
  } = usePayments();

  return (
    <div className="-m-6 bg-[#F8FAFC] p-6 space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Payments</h1>
        <p className="text-sm text-[#45443E]">{total} payment{total !== 1 ? "s" : ""}</p>
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by receipt no, loan no, customer name..."
            className="w-full rounded-lg border border-[#9C9A8D] pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center rounded-lg border border-[#C4C1B3] p-0.5">
          {PERIOD_TABS.map((t) => {
            const isActive = period === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setPeriod(t.key);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  isActive
                    ? "bg-[#1A1A18] text-white"
                    : "text-[#45443E] hover:bg-[#ECE9DF]"
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F8FAFC] rounded animate-pulse" />
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
            <AdminPaymentTable payments={payments} />

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
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
