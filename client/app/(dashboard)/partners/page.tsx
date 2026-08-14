
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePartners } from "@/hooks/usePartners";
import PartnerTable from "@/components/tables/PartnerTable";
import PartnerFormModal from "@/components/partners/PartnerFormModal";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#F1EFE8", text: "#5F5E5A" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function PartnerSummaryCard({ partner }: { partner: Partner }) {
  const initials = partner.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <Link
      href={`/partners/${partner.id}`}
      className="rounded-2xl border border-[#E8E6DF] bg-white p-5 hover:border-[#B4B2A9] transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 shrink-0 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#2C2C2A] truncate">{partner.name}</p>
          <p className="text-xs text-[#888780] truncate">
            {partner.partnerCode}
            {partner.address ? ` · ${partner.address}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#F1EFE8] pt-4 mb-4">
        <div>
          <p className="text-xs text-[#888780] mb-1">Investment</p>
          <p className="text-sm font-semibold text-[#2C2C2A]">
            {formatCurrency(partner.investmentAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#888780] mb-1">Balance</p>
          <p className="text-sm font-semibold text-[#2C2C2A]">
            {formatCurrency(partner.currentBalance)}
          </p>
        </div>
      </div>

      <StatusBadge status={partner.status} />
    </Link>
  );
}

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

  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#2C2C2A]">Partners</h1>
          <p className="text-sm text-[#5F5E5A]">{total} partner{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add partner
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, code..."
        className="w-full max-w-sm rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
      />

      {!loading && !error && partners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.slice(0, 3).map((partner) => (
            <PartnerSummaryCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

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

      <PartnerFormModal
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