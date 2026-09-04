// app/(partner)/partner/loans/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { getMyLoanById } from "@/services/partnerLoan.service";
import CollectPaymentModal from "@/components/partner/CollectPaymentModal";
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
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-[#6B6A62] mb-1">{label}</p>
      <p className="text-sm text-[#1A1A18]">{value || "—"}</p>
    </div>
  );
}

export default function PartnerLoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCollect, setShowCollect] = useState(false);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    getMyLoanById(id)
      .then(setLoan)
      .catch((err) => {
        console.error(err);
        setError("Could not load loan.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-4 w-32 bg-[#ECE9DF] rounded" />
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 h-40" />
      </div>
    );
  }

  if (error || !loan) {
    return (
      <div className="space-y-4">
        <Link href="/partner/loans" className="text-sm text-[#185FA5]">
          ← Back to loans
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-3">{error ?? "Loan not found."}</p>
          <button onClick={load} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const canCollect = loan.status === "ACTIVE" || loan.status === "APPROVED";

  return (
    <div className="space-y-6">
      <Link href="/partner/loans" className="text-sm text-[#185FA5]">
        ← Back to loans
      </Link>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-[#1A1A18]">Loan {loan.loanNumber}</h1>
          <StatusBadge status={loan.status} />
        </div>
        {canCollect && (
          <button
            onClick={() => setShowCollect(true)}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            Record payment
          </button>
        )}
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
          <div>
            <p className="text-xs text-[#6B6A62] mb-2">Customer</p>
            <p className="text-sm font-semibold text-[#1A1A18]">{loan.customer?.name}</p>
            <p className="text-xs text-[#6B6A62]">
              {loan.customer?.customerCode} · {loan.customer?.phone}
            </p>
          </div>
        </div>

        <div className="border-t border-[#ECE9DF] pt-4">
          <p className="text-xs text-[#6B6A62] mb-3">Loan terms</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mb-4">
            <Field label="Principal amount" value={formatCurrency(loan.principalAmount)} />
            <Field
              label="Interest / Duration"
              value={`${loan.interestPercentage}% - ${loan.duration} ${loan.paymentFrequency === "MONTHLY" ? "months" : "weeks"}`}
            />
            <Field label="Total payable" value={formatCurrency(loan.totalPayable)} />
            <Field
              label="Installment"
              value={`${formatCurrency(loan.installmentAmount)}/${loan.paymentFrequency === "MONTHLY" ? "mo" : "wk"}`}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
            <Field label="Start date" value={loan.startDate ? formatDate(loan.startDate) : null} />
            <Field label="End date" value={loan.endDate ? formatDate(loan.endDate) : null} />
            <Field label="Progress" value={`${loan.paidInstallments} / ${loan.totalInstallments} paid`} />
            <Field label="Balance" value={formatCurrency(loan.balanceAmount)} />
          </div>
        </div>

        {loan.remarks && (
          <div className="border-t border-[#ECE9DF] pt-4 mt-4">
            <p className="text-xs text-[#6B6A62] mb-1">Remarks</p>
            <p className="text-sm text-[#1A1A18]">&quot;{loan.remarks}&quot;</p>
          </div>
        )}

        {loan.status === "REJECTED" && loan.rejectionReason && (
          <div className="border-t border-[#ECE9DF] pt-4 mt-4">
            <p className="text-xs text-[#6B6A62] mb-1">Rejection reason</p>
            <p className="text-sm text-[#993C1D]">{loan.rejectionReason}</p>
          </div>
        )}
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Repayment schedule</h2>
        {!loan.schedules || loan.schedules.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-[#6B6A62]">
            No schedule available.
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                  <th className="py-2 px-4 font-medium">#</th>
                  <th className="py-2 px-4 font-medium">Due date</th>
                  <th className="py-2 px-4 font-medium text-right">Amount</th>
                  <th className="py-2 px-4 font-medium text-right">Penalty</th>
                  <th className="py-2 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {loan.schedules.map((s) => (
                  <tr key={s.id} className="border-b border-[#E5E7EB] last:border-0">
                    <td className="py-3 px-4 text-[#1A1A18]">#{s.installmentNo}</td>
                    <td className="py-3 px-4 text-[#45443E]">{formatDate(s.dueDate)}</td>
                    <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(s.amount)}</td>
                    <td className="py-3 px-4 text-[#45443E] text-right">{formatCurrency(s.penalty)}</td>
                    <td className="py-3 px-4">
                      <span
                        className="text-[11px] font-medium px-2 py-1 rounded-md"
                        style={
                          s.isPaid
                            ? { backgroundColor: "#EAF3DE", color: "#3B6D11" }
                            : { backgroundColor: "#FAEEDA", color: "#854F0B" }
                        }
                      >
                        {s.isPaid ? "Paid" : "Pending"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <CollectPaymentModal
        open={showCollect}
        onClose={() => setShowCollect(false)}
        initialLoanId={loan.id}
        onSaved={() => {
          setShowCollect(false);
          load();
        }}
      />
    </div>
  );
}
