// app/(dashboard)/loans/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getLoanById, approveLoan, rejectLoan } from "@/services/loan.service";
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

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-[#ECE9DF] rounded" />
      <div className="h-6 w-56 bg-[#ECE9DF] rounded" />
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#ECE9DF] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function LoanDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    getLoanById(id)
      .then(setLoan)
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load loan.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) {
    return <DetailSkeleton />;
  }

  if (loadError || !loan) {
    return (
      <div className="space-y-4">
        <Link href="/loans" className="text-sm text-[#185FA5]">
          ← Back to loans
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-3">{loadError ?? "Loan not found."}</p>
          <button onClick={load} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isPending = loan.status === "PENDING";

  const handleApprove = async () => {
    if (!id) return;
    setActionError(null);
    setSubmitting("approve");
    try {
      await approveLoan(id);
      router.push("/loans");
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err.message || "Could not approve loan.");
    } finally {
      setSubmitting(null);
    }
  };

  const handleReject = async () => {
    if (!id) return;
    if (!rejectionReason.trim()) {
      setActionError("Rejection reason is required.");
      return;
    }
    setActionError(null);
    setSubmitting("reject");
    try {
      await rejectLoan(id, rejectionReason.trim());
      router.push("/loans");
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err.message || "Could not reject loan.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/loans" className="text-sm text-[#185FA5]">
        ← Back to loans
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-[#1A1A18]">
          {isPending ? `Review loan ${loan.loanNumber}` : `Loan ${loan.loanNumber}`}
        </h1>
        <StatusBadge status={loan.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-[#6B6A62] mb-2">Customer</p>
                <p className="text-sm font-semibold text-[#1A1A18]">{loan.customer?.name}</p>
                <p className="text-xs text-[#6B6A62]">
                  {loan.customer?.customerCode} · {loan.customer?.phone}
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-2">Submitted by partner</p>
                <p className="text-sm font-semibold text-[#1A1A18]">{loan.partner?.name}</p>
                <p className="text-xs text-[#6B6A62]">{loan.partner?.partnerCode}</p>
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
                <Field
                  label="Progress"
                  value={`${loan.paidInstallments} / ${loan.totalInstallments} paid`}
                />
                <Field label="Balance" value={formatCurrency(loan.balanceAmount)} />
              </div>
            </div>

            {loan.remarks && (
              <div className="border-t border-[#ECE9DF] pt-4 mt-4">
                <p className="text-xs text-[#6B6A62] mb-1">Partner remarks</p>
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

          {isPending && (
            <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
              <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Decision</h2>

              {actionError && (
                <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D] mb-4">
                  {actionError}
                </div>
              )}

              <label className="block text-xs text-[#6B6A62] mb-1">
                Rejection reason (required if rejecting)
              </label>
              <input
                type="text"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="e.g. insufficient documents, high risk profile..."
                className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] mb-5"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReject}
                  disabled={submitting !== null}
                  className="flex-1 border border-[#993C1D] text-[#993C1D] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting === "reject" ? "Rejecting..." : "✕ Reject loan"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting !== null}
                  className="flex-1 bg-[#3B6D11] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting === "approve" ? "Approving..." : "✓ Approve loan"}
                </button>
              </div>
            </div>
          )}
        </div>

        {isPending && (
          <div className="rounded-2xl border border-[#DAD7CA] bg-[#ECE9DF] p-6 h-fit">
            <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">What happens next</h2>
            <div className="space-y-4 text-sm text-[#45443E]">
              <div>
                <p className="font-medium text-[#1A1A18] mb-1">On Approve:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Status → ACTIVE</li>
                  <li>EMI schedule unlocked</li>
                  <li>Payments unlocked</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[#1A1A18] mb-1">On Reject:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Status → REJECTED</li>
                  <li>Partner notified with reason</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
