// components/tables/EodReportTable.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import type { EodReport, EodStatus } from "@/types/eod";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import StatusDot from "@/components/ui/StatusDot";

const STATUS_STYLE: Record<EodStatus, { color: string; label: string }> = {
  PENDING: { color: "#854F0B", label: "Pending" },
  CLOSED: { color: "#3B6D11", label: "Closed" },
  REJECTED: { color: "#E31E24", label: "Rejected" },
};

export default function EodReportTable({
  reports,
  onView,
}: {
  reports: EodReport[];
  onView: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No EOD reports found.
      </div>
    );
  }

  const allSelected = reports.every((r) => selected.has(r.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(reports.map((r) => r.id)));
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
                aria-label="Select all EOD reports"
              />
            </th>
            <th className="py-2 px-4 font-medium">Date</th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium text-right">Total Collection</th>
            <th className="py-2 px-4 font-medium text-right">Total Expenses</th>
            <th className="py-2 px-4 font-medium text-right">Net Remittance</th>
            <th className="py-2 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {reports.map((r) => {
            // Pending reports still need the full decision page (Approve/Reject
            // lives there, not in the read-only View modal) — everything else
            // opens the quick-view modal.
            const isPending = r.status === "PENDING";
            const status = STATUS_STYLE[r.status] ?? STATUS_STYLE.PENDING;

            return (
              <tr
                key={r.id}
                onClick={isPending ? undefined : () => onView(r.id)}
                className={`border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors ${
                  isPending ? "" : "cursor-pointer"
                }`}
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(r.id)}
                    onChange={() => toggleOne(r.id)}
                    className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    aria-label={`Select EOD report ${r.id}`}
                  />
                </td>
                <td className="py-3 px-4 text-[#45443E]">{formatDate(r.reportDate)}</td>
                <td className="py-3 px-4 text-[#1A1A18]">
                  {r.partner ? `${r.partner.partnerCode} · ${r.partner.name}` : "—"}
                </td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(r.totalCollection)}</td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(r.totalExpenses)}</td>
                <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">{formatCurrency(r.netRemittance)}</td>
                <td className="py-3 px-4">
                  {isPending ? (
                    <Link href={`/eod/${r.id}`} className="inline-block" onClick={(e) => e.stopPropagation()}>
                      <StatusDot color={status.color} label={status.label} />
                    </Link>
                  ) : (
                    <StatusDot color={status.color} label={status.label} />
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
