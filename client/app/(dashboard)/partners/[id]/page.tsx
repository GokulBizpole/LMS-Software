// app/(dashboard)/partners/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPartnerById } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#F1EFE8", text: "#5F5E5A" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-[#888780] mb-1">{label}</p>
      <p className="text-sm text-[#2C2C2A]">{value || "—"}</p>
    </div>
  );
}

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getPartnerById(id)
      .then(setPartner)
      .catch((err) => {
        console.error(err);
        setError("Could not load partner.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-40 bg-[#F1EFE8] rounded-2xl animate-pulse" />;
  }

  if (error || !partner) {
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
        {error ?? "Partner not found."}
      </div>
    );
  }

  const initials = partner.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/partners")}
        className="text-sm text-[#185FA5]"
      >
        ← Back to partners
      </button>

      {/* Profile header */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-lg font-semibold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#2C2C2A]">{partner.name}</h1>
              <StatusBadge status={partner.status} />
            </div>
            <p className="text-sm text-[#5F5E5A]">
              {partner.partnerCode} · {partner.phone}
              {partner.address ? ` · ${partner.address}` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/partners/${partner.id}/edit`}
          className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A]"
        >
          Edit
        </Link>
      </div>

      {/* Investment stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-[#E8E6DF] bg-[#F1EFE8] p-5">
          <p className="text-xs text-[#5F5E5A] mb-1">Investment amount</p>
          <p className="text-xl font-semibold text-[#2C2C2A]">
            {formatCurrency(partner.investmentAmount)}
          </p>
        </div>
        <div className="rounded-2xl border border-[#E8E6DF] bg-[#F1EFE8] p-5">
          <p className="text-xs text-[#5F5E5A] mb-1">Current balance</p>
          <p className="text-xl font-semibold text-[#2C2C2A]">
            {formatCurrency(partner.currentBalance)}
          </p>
        </div>
      </div>

      {/* Contact details */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Contact details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <Field label="Phone" value={partner.phone} />
          <Field label="Email" value={partner.email} />
          <Field label="Address" value={partner.address} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-[#F1EFE8] p-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Joined" value={formatDate(partner.createdAt)} />
          <Field label="Last updated" value={formatDate(partner.updatedAt)} />
        </div>
      </div>

      {/*
        NOTE: "Loans given by this partner" section isn't wired up —
        needs GET /loans?partnerId=... endpoint. Add once confirmed.
      */}
    </div>
  );
}