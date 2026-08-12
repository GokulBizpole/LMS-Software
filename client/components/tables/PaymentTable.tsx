// components/tables/PaymentTable.tsx
import type { Payment, PaymentStatus } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { bg: string; text: string }> = {
    PAID: { bg: "#EAF3DE", text: "#3B6D11" },
    PENDING: { bg: "#FAEEDA", text: "#854F0B" },
    LATE: { bg: "#FAECE7", text: "#993C1D" },
  };
  const c = map[status] ?? map.PENDING;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

export default function PaymentTable({ payments }: { payments: Payment[] }) {
  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-[160px] text-sm text-[#888780]">
        No payments found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#888780] text-xs border-b border-[#E8E6DF]">
            <th className="py-2 pr-4 font-medium">Receipt</th>
            <th className="py-2 pr-4 font-medium">Loan</th>
            <th className="py-2 pr-4 font-medium">Customer</th>
            <th className="py-2 pr-4 font-medium">Partner</th>
            <th className="py-2 pr-4 font-medium">Installment</th>
            <th className="py-2 pr-4 font-medium">Amount</th>
            <th className="py-2 pr-4 font-medium">Penalty</th>
            <th className="py-2 pr-4 font-medium">Total received</th>
            <th className="py-2 pr-4 font-medium">Method</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Paid on</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((p) => (
            <tr key={p.id} className="border-b border-[#F1EFE8] last:border-0">
              <td className="py-3 pr-4 text-[#2C2C2A] font-medium">{p.receiptNumber}</td>
              <td className="py-3 pr-4 text-[#5F5E5A]">{p.loan.loanNumber}</td>
              <td className="py-3 pr-4">
                <p className="text-[#2C2C2A]">{p.loan.customer.name}</p>
                <p className="text-xs text-[#888780]">
                  {p.loan.customer.customerCode} · {p.loan.customer.phone}
                </p>
              </td>
              <td className="py-3 pr-4 text-[#5F5E5A]">
                {p.loan.partner ? `${p.loan.partner.partnerCode} · ${p.loan.partner.name}` : "—"}
              </td>
              <td className="py-3 pr-4 text-[#5F5E5A]">#{p.installmentNumber}</td>
              <td className="py-3 pr-4 text-[#2C2C2A]">{formatCurrency(p.amount)}</td>
              <td className="py-3 pr-4 text-[#5F5E5A]">{formatCurrency(p.penalty)}</td>
              <td className="py-3 pr-4 text-[#2C2C2A] font-medium">{formatCurrency(p.totalReceived)}</td>
              <td className="py-3 pr-4 text-[#5F5E5A]">{p.paymentMethod.replace("_", " ")}</td>
              <td className="py-3 pr-4"><StatusBadge status={p.paymentStatus} /></td>
              <td className="py-3 pr-4 text-[#5F5E5A]">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
              <td className="py-3 pr-4 text-right">
                <a
                  href={`${process.env.NEXT_PUBLIC_API_BASE_URL}/payments/${p.id}/receipt`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#185FA5] font-medium hover:underline"
                >
                  Receipt
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
