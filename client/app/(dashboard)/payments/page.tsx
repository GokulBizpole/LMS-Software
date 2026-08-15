// app/(dashboard)/payments/page.tsx
"use client";

import { usePayments, type PaymentPeriod } from "@/hooks/usePayments";
import PaymentTable from "@/components/tables/PaymentTable";
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

      <div className="flex items-center gap-1 flex-wrap">
        {PERIOD_TABS.map((t) => {
          const isActive = period === t.key;
          return (
            <button
              key={t.key}
              onClick={() => {
                setPeriod(t.key);
                setPage(1);
              }}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? "bg-[#FAEEDA] text-[#854F0B] font-medium"
                  : "text-[#45443E] hover:bg-[#ECE9DF]"
              }`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by receipt no, loan no, customer name..."
        className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
      />

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
            <PaymentTable payments={payments} />

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
