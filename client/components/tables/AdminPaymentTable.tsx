// components/tables/AdminPaymentTable.tsx
// Admin Payments list page only — standardized checkbox column, status dot,
// hover row. Kept as a separate component from tables/PaymentTable.tsx,
// which stays untouched for its many other call sites (Partner payments/
// collections pages, CustomerViewModal, admin reports/collections).
//
// No row-click-to-view: there's no per-payment view destination today, so
// "Receipt" (a real download action, not a View button) is kept as-is.
"use client";

import { useState } from "react";
import type { Payment, PaymentStatus } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import StatusDot from "@/components/ui/StatusDot";

const STATUS_STYLE: Record<PaymentStatus, { color: string; label: string }> = {
  PAID: { color: "#3B6D11", label: "Paid" },
  PENDING: { color: "#854F0B", label: "Pending" },
  LATE: { color: "#993C1D", label: "Late" },
};

export default function AdminPaymentTable({ payments }: { payments: Payment[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (payments.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No payments found.
      </div>
    );
  }

  const allSelected = payments.every((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(payments.map((p) => p.id)));
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
      <table className="w-full min-w-310 text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                aria-label="Select all payments"
              />
            </th>
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
            <th className="py-2 px-4 font-medium text-right">Action</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {payments.map((p) => {
            const status = STATUS_STYLE[p.paymentStatus] ?? STATUS_STYLE.PENDING;

            return (
              <tr key={p.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(p.id)}
                    onChange={() => toggleOne(p.id)}
                    className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    aria-label={`Select receipt ${p.receiptNumber}`}
                  />
                </td>
                <td className="py-3 px-4 text-[#1A1A18] font-medium">{p.receiptNumber}</td>
                <td className="py-3 px-4 text-[#45443E]">{p.loan.loanNumber}</td>
                <td className="py-3 px-4">
                  <p className="text-[#1A1A18] leading-tight">{p.loan.customer.name}</p>
                  <p className="text-xs text-[#6B6A62] leading-tight">
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
                <td className="py-3 px-4">
                  <StatusDot color={status.color} label={status.label} />
                </td>
                <td className="py-3 px-4 text-[#45443E]">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                <td className="py-3 px-4 text-right">
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
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
