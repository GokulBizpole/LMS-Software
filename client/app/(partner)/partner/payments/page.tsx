// app/(partner)/partner/payments/page.tsx
"use client";

import { useState } from "react";
import { usePartnerPayments, type PartnerPaymentPeriod } from "@/hooks/usePartnerPayments";
import PaymentTable from "@/components/tables/PaymentTable";
import Pagination from "@/components/ui/Pagination";
import CollectPaymentModal from "@/components/partner/CollectPaymentModal";
import { downloadMyReceipt } from "@/services/partnerPayment.service";

const PERIOD_TABS: { key: PartnerPaymentPeriod; label: string }[] = [
  { key: "all", label: "All" },
  { key: "day", label: "Today" },
  { key: "week", label: "This week" },
  { key: "month", label: "This month" },
];

export default function PartnerPaymentsPage() {
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
  } = usePartnerPayments();

  const [showCollect, setShowCollect] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Payments</h1>
          <p className="text-sm text-[#45443E]">{total} payment{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCollect(true)}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Collect payment
        </button>
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
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
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
            <PaymentTable payments={payments} onDownloadReceipt={downloadMyReceipt} />

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

      <CollectPaymentModal
        open={showCollect}
        onClose={() => setShowCollect(false)}
        onSaved={() => {
          setShowCollect(false);
          refetch();
        }}
      />
    </div>
  );
}
