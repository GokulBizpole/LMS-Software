// components/tables/PartnerTable.tsx
// Admin-only (no Partner-side usage) — redesigned to match the standardized
// admin table pattern: checkbox column (visual only), stacked avatar/name/
// code cell, dot status badge, clickable/hover rows, no separate View button.
"use client";

import { useState } from "react";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { partnerFileUrl } from "@/services/partner.service";
import StatusDot from "@/components/ui/StatusDot";

const STATUS_STYLE: Record<Partner["status"], { color: string; label: string }> = {
  ACTIVE: { color: "#3B6D11", label: "Active" },
  INACTIVE: { color: "#6B6A62", label: "Inactive" },
};

export default function PartnerTable({
  partners,
  onView,
}: {
  partners: Partner[];
  onView: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (partners.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No partners found.
      </div>
    );
  }

  const allSelected = partners.every((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(partners.map((p) => p.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full min-w-215 text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                aria-label="Select all partners"
              />
            </th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium">Phone</th>
            <th className="py-2 px-4 font-medium">Email</th>
            <th className="py-2 px-4 font-medium text-right">Investment</th>
            <th className="py-2 px-4 font-medium text-right">Balance</th>
            <th className="py-2 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {partners.map((p) => {
            const initials = p.name
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const status = STATUS_STYLE[p.status] ?? STATUS_STYLE.INACTIVE;

            return (
              <tr
                key={p.id}
                onClick={() => onView(p.id)}
                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    aria-label={`Select ${p.name}`}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-[11px] font-semibold overflow-hidden">
                      {p.profilePicture ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={partnerFileUrl(p.profilePicture)}
                          alt={p.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        initials
                      )}
                    </div>
                    <div>
                      <p className="text-[#1A1A18] font-medium leading-tight">{p.name}</p>
                      <p className="text-xs text-[#6B6A62] leading-tight">{p.partnerCode}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#45443E]">{p.phone}</td>
                <td className="py-3 px-4 text-[#45443E]">{p.email}</td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(p.investmentAmount)}</td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(p.currentBalance)}</td>
                <td className="py-3 px-4">
                  <StatusDot color={status.color} label={status.label} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
