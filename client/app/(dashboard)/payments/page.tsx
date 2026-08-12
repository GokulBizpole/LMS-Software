// app/(dashboard)/payments/page.tsx
"use client";

import { usePayments, type PaymentPeriod } from "@/hooks/usePayments";
import PaymentTable from "@/components/tables/PaymentTable";

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
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Payments</h1>
        <p className="text-sm text-[#5F5E5A]">{total} payment{total !== 1 ? "s" : ""}</p>
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
                  : "text-[#5F5E5A] hover:bg-[#F1EFE8]"
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
        className="w-full max-w-sm rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
      />

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
            <PaymentTable payments={payments} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1EFE8]">
                <p className="text-xs text-[#888780]">
                  Page {page} of {totalPages}
                </p>
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
