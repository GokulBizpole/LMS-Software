// components/tables/EodReportTable.tsx
"use client";

import Link from "next/link";
import type { EodReport, EodStatus } from "@/types/eod";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<EodStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  CLOSED: { bg: "#EAF3DE", text: "#3B6D11" },
  REJECTED: { bg: "#FAECE7", text: "#993C1D" },
};

function StatusBadge({ status }: { status: EodStatus }) {
  const c = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

export default function EodReportTable({ reports }: { reports: EodReport[] }) {
  if (reports.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No EOD reports found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full min-w-[820px] text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Date</th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium text-right">Total Collection</th>
            <th className="py-2 px-4 font-medium text-right">Total Expenses</th>
            <th className="py-2 px-4 font-medium text-right">Net Remittance</th>
            <th className="py-2 px-4 font-medium">Status</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {reports.map((r) => (
            <tr key={r.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC]">
              <td className="py-3 px-4 text-[#45443E]">
                <Link href={`/eod/${r.id}`} className="block">
                  {formatDate(r.reportDate)}
                </Link>
              </td>
              <td className="py-3 px-4 text-[#1A1A18]">
                <Link href={`/eod/${r.id}`} className="block">
                  {r.partner ? `${r.partner.partnerCode} · ${r.partner.name}` : "—"}
                </Link>
              </td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">
                <Link href={`/eod/${r.id}`} className="block">
                  {formatCurrency(r.totalCollection)}
                </Link>
              </td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">
                <Link href={`/eod/${r.id}`} className="block">
                  {formatCurrency(r.totalExpenses)}
                </Link>
              </td>
              <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">
                <Link href={`/eod/${r.id}`} className="block">
                  {formatCurrency(r.netRemittance)}
                </Link>
              </td>
              <td className="py-3 px-4">
                <Link href={`/eod/${r.id}`} className="block">
                  <StatusBadge status={r.status} />
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
