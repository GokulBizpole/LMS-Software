// components/tables/PaymentTable.tsx
"use client";

import { useState } from "react";
import type { Payment, PaymentStatus } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { downloadReceipt } from "@/services/payment.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";

function StatusBadge({ status }: { status: PaymentStatus }) {
  const map: Record<PaymentStatus, { bg: string; text: string }> = {
    PAID: { bg: "#EAF3DE", text: "#3B6D11" },
    PENDING: { bg: "#FAEEDA", text: "#854F0B" },
    LATE: { bg: "#FAECE7", text: "#E31E24" },
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

export default function PaymentTable({
  payments,
  onDownloadReceipt,
}: {
  payments: Payment[];
  onDownloadReceipt?: (paymentId: string) => void;
}) {
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const toast = useToast();

  // No onDownloadReceipt passed means this is one of the admin-side call
  // sites (partner call sites always pass their own handler) — download the
  // receipt as an authenticated blob instead of a raw <a href> to the API,
  // which can't attach the Bearer token and gets rejected with 401.
  const handleDefaultDownload = async (paymentId: string) => {
    setDownloadingId(paymentId);
    try {
      await downloadReceipt(paymentId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not download receipt. Please try again."));
    } finally {
      setDownloadingId(null);
    }
  };

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No payments found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full min-w-300   text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Receipt</th>
            <th className="py-2 px-4 font-medium">Loan</th>
            <th className="py-2 px-4 font-medium">Customer</th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium">Installment</th>
            <th className="py-2 px-4 font-medium text-right">Amount</th>
            <th className="py-2 px-4 font-medium text-right">Penalty</th>
            <th className="py-2 px-4 font-medium text-right">Total received</th>
            <th className="py-2 px-4 font-medium">Method</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Paid on</th>
            <th className="py-2 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {payments.map((p) => (
            <tr key={p.id} className="border-b border-[#E5E7EB] last:border-0">
              <td className="py-3 px-4 text-[#1A1A18] font-medium">{p.receiptNumber}</td>
              <td className="py-3 px-4 text-[#45443E]">{p.loan.loanNumber}</td>
              <td className="py-3 px-4">
                <p className="text-[#1A1A18]">{p.loan.customer.name}</p>
                <p className="text-xs text-[#6B6A62]">
                  {p.loan.customer.customerCode} · {p.loan.customer.phone}
                </p>
              </td>
              <td className="py-3 px-4 text-[#45443E]">
                {p.loan.partner ? `${p.loan.partner.partnerCode} · ${p.loan.partner.name}` : "—"}
              </td>
              <td className="py-3 px-4 text-[#45443E]">#{p.installmentNumber}</td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(p.amount)}</td>
              <td className="py-3 px-4 text-[#45443E] text-right">{formatCurrency(p.penalty)}</td>
              <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">{formatCurrency(p.totalReceived)}</td>
              <td className="py-3 px-4 text-[#45443E]">{p.paymentMethod.replace("_", " ")}</td>
              <td className="py-3 px-4"><StatusBadge status={p.paymentStatus} /></td>
              <td className="py-3 px-4 text-[#45443E]">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
              <td className="py-3 px-4 text-right">
                <button
                  type="button"
                  onClick={() => (onDownloadReceipt ? onDownloadReceipt(p.id) : handleDefaultDownload(p.id))}
                  disabled={downloadingId === p.id}
                  className="text-[#185FA5] font-medium hover:underline disabled:opacity-50"
                >
                  {downloadingId === p.id ? "Downloading..." : "Receipt"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
