// components/groups/GroupCard.tsx
// Card for the partner Groups list: area (group head's city), active badge,
// group head, member/loan totals and this week's collection.
"use client";

import { MapPin } from "lucide-react";
import type { Group } from "@/types/group";

// Whole rupees for the compact card figures (₹1,00,000).
const rupees = (value: number) =>
  `₹${Math.round(value).toLocaleString("en-IN")}`;

export default function GroupCard({ group, onView }: { group: Group; onView: (id: string) => void }) {
  const stats = group.loanStats ?? { activeLoans: 0, totalLoan: 0, outstanding: 0, weekCollected: 0 };
  const isActive = stats.activeLoans > 0;
  const headInitial = group.groupHead?.name?.trim()?.[0]?.toUpperCase() ?? "?";
  const area = group.groupHead?.city;

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#1A1A18] truncate">{group.name}</h3>
          <p className="flex items-center gap-1 text-xs text-[#6B6A62] mt-0.5 truncate">
            <MapPin size={12} className="shrink-0" />
            {area || "—"}
            <span className="text-[#C4C1B3]">·</span>
            {group.groupCode}
          </p>
        </div>
        <span
          className="shrink-0 text-[11px] font-semibold px-2 py-0.5 rounded-full"
          style={
            isActive
              ? { backgroundColor: "#EAF3DE", color: "#3B6D11" }
              : { backgroundColor: "#ECE9DF", color: "#6B6A62" }
          }
        >
          {isActive ? "Active" : "No active loans"}
        </span>
      </div>

      <div className="flex items-center gap-3 rounded-xl bg-[#F8FAFC] px-3 py-2.5">
        <div className="w-8 h-8 shrink-0 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#E31E24] text-xs font-semibold">
          {headInitial}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-[#1A1A18] truncate">{group.groupHead?.name ?? "—"}</p>
          <p className="text-[11px] text-[#6B6A62]">Group Head</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div>
          <p className="text-[11px] text-[#6B6A62]">Members</p>
          <p className="text-sm font-bold text-[#1A1A18]">{group._count?.members ?? 0}</p>
        </div>
        <div className="text-center">
          <p className="text-[11px] text-[#6B6A62]">Total loan</p>
          <p className="text-sm font-bold text-[#1A1A18]">{rupees(stats.totalLoan)}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] text-[#6B6A62]">Outstanding</p>
          <p className="text-sm font-bold text-[#1A1A18]">{rupees(stats.outstanding)}</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-[#E5E7EB] pt-3 mt-auto">
        <p className="text-xs text-[#6B6A62]">
          This week: <span className="font-semibold text-[#1A1A18]">{rupees(stats.weekCollected)}</span> collected
        </p>
        <button
          type="button"
          onClick={() => onView(group.id)}
          className="text-sm font-semibold text-[#E31E24] hover:underline whitespace-nowrap"
        >
          View →
        </button>
      </div>
    </div>
  );
}
