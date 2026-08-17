// app/(partner)/partner/customers/page.tsx
"use client";

import { useState } from "react";
import { usePartnerCustomers } from "@/hooks/usePartnerCustomers";
import CustomerTable from "@/components/tables/CustomerTable";
import PartnerCustomerFormModal from "@/components/partner/CustomerFormModal";
import Pagination from "@/components/ui/Pagination";

export default function PartnerCustomersPage() {
  const {
    customers,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    loading,
    error,
    refetch,
  } = usePartnerCustomers();

  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Customers</h1>
          <p className="text-sm text-[#45443E]">{total} total customer{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add customer
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, code..."
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
            <CustomerTable customers={customers} linkPrefix="/partner/customers" />

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

      <PartnerCustomerFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={() => {
          setShowCreate(false);
          refetch();
        }}
      />
    </div>
  );
}
