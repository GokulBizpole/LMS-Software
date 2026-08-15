
"use client";

import { useState } from "react";
import Link from "next/link";
import { usePartners } from "@/hooks/usePartners";
import PartnerTable from "@/components/tables/PartnerTable";
import PartnerFormModal from "@/components/partners/PartnerFormModal";
import Pagination from "@/components/ui/Pagination";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#ECE9DF", text: "#45443E" },
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
      className="rounded-2xl border border-[#DAD7CA] bg-white p-5 hover:border-[#9C9A8D] transition-colors"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 shrink-0 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-sm font-semibold">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A18] truncate">{partner.name}</p>
          <p className="text-xs text-[#6B6A62] truncate">
            {partner.partnerCode}
            {partner.address ? ` · ${partner.address}` : ""}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-[#ECE9DF] pt-4 mb-4">
        <div>
          <p className="text-xs text-[#6B6A62] mb-1">Investment</p>
          <p className="text-sm font-semibold text-[#1A1A18]">
            {formatCurrency(partner.investmentAmount)}
          </p>
        </div>
        <div>
          <p className="text-xs text-[#6B6A62] mb-1">Balance</p>
          <p className="text-sm font-semibold text-[#1A1A18]">
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
    pageSize,
    setPageSize,
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
          <h1 className="text-xl font-bold text-[#1A1A18]">Partners</h1>
          <p className="text-sm text-[#45443E]">{total} partner{total !== 1 ? "s" : ""}</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add partner
        </button>
      </div>

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Search by name, phone, code..."
        className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
      />

      {!loading && !error && partners.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {partners.slice(0, 3).map((partner) => (
            <PartnerSummaryCard key={partner.id} partner={partner} />
          ))}
        </div>
      )}

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
            <PartnerTable partners={partners} />

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