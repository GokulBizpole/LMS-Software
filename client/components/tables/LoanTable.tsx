// components/tables/LoanTable.tsx
import Link from "next/link";
import type { Loan, LoanStatus } from "@/types/loan";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<LoanStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  APPROVED: { bg: "#EAF3DE", text: "#3B6D11" },
  ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
  CLOSED: { bg: "#F1EFE8", text: "#5F5E5A" },
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

export default function LoanTable({ loans }: { loans: Loan[] }) {
  if (loans.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-sm text-[#888780]">
        No loans found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#888780] text-xs border-b border-[#E8E6DF]">
            <th className="py-2 pr-4 font-medium">Loan number</th>
            <th className="py-2 pr-4 font-medium">Customer</th>
            <th className="py-2 pr-4 font-medium">Partner</th>
            <th className="py-2 pr-4 font-medium">Principal</th>
            <th className="py-2 pr-4 font-medium">Total payable</th>
            <th className="py-2 pr-4 font-medium">Balance</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Created</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {loans.map((l) => (
            <tr key={l.id} className="border-b border-[#F1EFE8] last:border-0">
              <td className="py-3 pr-4 text-[#2C2C2A] font-medium">{l.loanNumber}</td>
              <td className="py-3 pr-4">
                <p className="text-[#2C2C2A]">{l.customer?.name ?? "—"}</p>
                <p className="text-xs text-[#888780]">
                  {l.customer?.customerCode} · {l.customer?.phone}
                </p>
              </td>
              <td className="py-3 pr-4 text-[#5F5E5A]">
                {l.partner ? `${l.partner.partnerCode} · ${l.partner.name}` : "—"}
              </td>
              <td className="py-3 pr-4 text-[#2C2C2A]">{formatCurrency(l.principalAmount)}</td>
              <td className="py-3 pr-4 text-[#2C2C2A]">{formatCurrency(l.totalPayable)}</td>
              <td className="py-3 pr-4 text-[#2C2C2A] font-medium">{formatCurrency(l.balanceAmount)}</td>
              <td className="py-3 pr-4"><StatusBadge status={l.status} /></td>
              <td className="py-3 pr-4 text-[#5F5E5A]">{formatDate(l.createdAt)}</td>
              <td className="py-3 pr-4 text-right">
                <Link
                  href={`/loans/${l.id}`}
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
