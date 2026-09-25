// components/tables/GroupTable.tsx
// Groups list table, shared by the admin and partner Groups pages — same
// visual style as AdminCustomerTable (stacked avatar/name/code cell, hover +
// clickable rows).
"use client";

import { Users } from "lucide-react";
import type { Group } from "@/types/group";
import { formatDate, formatRelativeTime } from "@/utils/formatDate";

function initialsOf(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function CreatedByBadge({ group }: { group: Pick<Group, "createdByType" | "createdByName"> }) {
  const isAdmin = group.createdByType === "ADMIN";
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="text-[#1A1A18]">{group.createdByName}</span>
      <span
        className="text-[10px] font-semibold px-1.5 py-0.5 rounded"
        style={
          isAdmin
            ? { backgroundColor: "#FCE4E4", color: "#E31E24" }
            : { backgroundColor: "#E6F1FB", color: "#185FA5" }
        }
      >
        {isAdmin ? "ADMIN" : "PARTNER"}
      </span>
    </span>
  );
}

export default function GroupTable({
  groups,
  onView,
  showPartner = false,
}: {
  groups: Group[];
  onView: (id: string) => void;
  showPartner?: boolean;
}) {
  if (groups.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No groups found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full min-w-215 text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Group</th>
            <th className="py-2 px-4 font-medium">Group head</th>
            <th className="py-2 px-4 font-medium">Members</th>
            {showPartner && <th className="py-2 px-4 font-medium">Partner</th>}
            <th className="py-2 px-4 font-medium">Created by</th>
            <th className="py-2 px-4 font-medium">Created</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {groups.map((g) => (
            <tr
              key={g.id}
              onClick={() => onView(g.id)}
              className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
            >
              <td className="py-3 px-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 shrink-0 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-[11px] font-semibold">
                    {initialsOf(g.name)}
                  </div>
                  <div>
                    <p className="text-[#1A1A18] font-medium leading-tight">{g.name}</p>
                    <p className="text-xs text-[#6B6A62] leading-tight">{g.groupCode}</p>
                  </div>
                </div>
              </td>
              <td className="py-3 px-4">
                <p className="text-[#1A1A18] leading-tight">{g.groupHead?.name ?? "—"}</p>
                <p className="text-xs text-[#6B6A62] leading-tight">{g.groupHead?.customerCode}</p>
              </td>
              <td className="py-3 px-4">
                <span className="inline-flex items-center gap-1.5 text-[#45443E]">
                  <Users size={14} className="text-[#9C9A8D]" />
                  {g._count?.members ?? 0}
                </span>
              </td>
              {showPartner && (
                <td className="py-3 px-4 text-[#45443E]">{g.partner?.name ?? "—"}</td>
              )}
              <td className="py-3 px-4">
                <CreatedByBadge group={g} />
              </td>
              <td className="py-3 px-4">
                <p className="text-[#45443E]">{formatDate(g.createdAt)}</p>
                <p className="text-xs text-[#9C9A8D]">{formatRelativeTime(g.createdAt)}</p>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
