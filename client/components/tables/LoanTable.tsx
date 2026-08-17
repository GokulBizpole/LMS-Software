// components/tables/LoanTable.tsx
import Link from "next/link";
import type { Loan, LoanStatus } from "@/types/loan";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<LoanStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  APPROVED: { bg: "#EAF3DE", text: "#3B6D11" },
  ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
  CLOSED: { bg: "#ECE9DF", text: "#45443E" },
  OVERDUE: { bg: "#FAEEDA", text: "#854F0B" },
  REJECTED: { bg: "#FAECE7", text: "#993C1D" },
};

function StatusBadge({ status }: { status: LoanStatus }) {
  const c = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

export default function LoanTable({
  loans,
  linkPrefix = "/loans",
}: {
  loans: Loan[];
  linkPrefix?: string;
}) {
  if (loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No loans found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Loan number</th>
            <th className="py-2 px-4 font-medium">Customer</th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium text-right">Principal</th>
            <th className="py-2 px-4 font-medium text-right">Total payable</th>
            <th className="py-2 px-4 font-medium text-right">Balance</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Created</th>
            <th className="py-2 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {loans.map((l) => (
            <tr key={l.id} className="border-b border-[#E5E7EB] last:border-0">
              <td className="py-3 px-4 text-[#1A1A18] font-medium">{l.loanNumber}</td>
              <td className="py-3 px-4">
                <p className="text-[#1A1A18]">{l.customer?.name ?? "—"}</p>
                <p className="text-xs text-[#6B6A62]">
                  {l.customer?.customerCode} · {l.customer?.phone}
                </p>
              </td>
              <td className="py-3 px-4 text-[#45443E]">
                {l.partner ? `${l.partner.partnerCode} · ${l.partner.name}` : "—"}
              </td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(l.principalAmount)}</td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(l.totalPayable)}</td>
              <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">{formatCurrency(l.balanceAmount)}</td>
              <td className="py-3 px-4"><StatusBadge status={l.status} /></td>
              <td className="py-3 px-4 text-[#45443E]">{formatDate(l.createdAt)}</td>
              <td className="py-3 px-4 text-right">
                <Link
                  href={`${linkPrefix}/${l.id}`}
                  className="text-[#185FA5] font-medium hover:underline"
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
