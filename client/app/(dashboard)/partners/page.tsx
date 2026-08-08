
"use client";

import Link from "next/link";
import { usePartners } from "@/hooks/usePartners";
import PartnerTable from "@/components/tables/PartnerTable";

export default function PartnersPage() {
  const {
    partners,
    total,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    loading,
    error,
    refetch,
  } = usePartners();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Partners</h1>
          <p className="text-sm text-[#5F5E5A]">{total} partner{total !== 1 ? "s" : ""}</p>
        </div>
        <Link
          href="/partners/create"
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add partner
        </Link>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, code..."
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
            <PartnerTable partners={partners} />

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