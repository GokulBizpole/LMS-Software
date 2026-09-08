// components/loans/LoanViewModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ViewModalShell,
  ViewModalSummary,
  ViewModalSection,
  ViewModalField,
  ViewModalFooterStrip,
  ViewModalOpenFullPage,
} from "@/components/ui/ViewModal";
import { getLoanById } from "@/services/loan.service";
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
    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function LoanViewModal({
  open,
  loanId,
  onClose,
}: {
  open: boolean;
  loanId: string | null;
  onClose: () => void;
}) {
  const [loan, setLoan] = useState<Loan | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !loanId) return;

    const load = () => {
      setLoading(true);
      setError(null);
      getLoanById(loanId)
        .then(setLoan)
        .catch((err) => {
          console.error(err);
          setError("Could not load loan.");
        })
        .finally(() => setLoading(false));
    };
    load();
  }, [open, loanId]);

  const initials = loan?.customer?.name
    ? loan.customer.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <ViewModalShell
      open={open}
      onClose={onClose}
      title="View Loan"
      maxWidth="max-w-2xl"
      actions={loan && <ViewModalOpenFullPage href={`/loans/${loan.id}`} />}
    >
      {loading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-16 bg-[#ECE9DF] rounded-xl" />
          <div className="h-32 bg-[#ECE9DF] rounded-xl" />
        </div>
      ) : error || !loan ? (
        <div className="p-6 text-center text-sm text-[#993C1D]">{error ?? "Loan not found."}</div>
      ) : (
        <>
          <ViewModalSummary
            initials={initials}
            avatarBg="#E6F1FB"
            avatarColor="#185FA5"
            name={loan.customer?.name ?? "—"}
            badge={<StatusBadge status={loan.status} />}
            subtitle={`${loan.loanNumber} · Partner: ${loan.partner?.name ?? "—"}`}
          />

          <div className="p-6 space-y-4">
            <ViewModalSection title="Loan Terms">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <ViewModalField label="Principal amount" value={formatCurrency(loan.principalAmount)} />
                <ViewModalField
                  label="Interest / Duration"
                  value={`${loan.interestPercentage}% · ${loan.duration} ${loan.paymentFrequency === "MONTHLY" ? "months" : "weeks"}`}
                />
                <ViewModalField label="Total payable" value={formatCurrency(loan.totalPayable)} />
                <ViewModalField label="Installment" value={formatCurrency(loan.installmentAmount)} />
                <ViewModalField label="Balance" value={formatCurrency(loan.balanceAmount)} />
                <ViewModalField
                  label="Progress"
                  value={`${loan.paidInstallments} / ${loan.totalInstallments} paid`}
                />
              </div>
            </ViewModalSection>

            {loan.remarks && (
              <ViewModalSection title="Partner Remarks">
                <p className="text-sm text-[#1A1A18] pt-1">&quot;{loan.remarks}&quot;</p>
              </ViewModalSection>
            )}

            {loan.status === "REJECTED" && loan.rejectionReason && (
              <ViewModalSection title="Rejection Reason">
                <p className="text-sm text-[#993C1D] pt-1">{loan.rejectionReason}</p>
              </ViewModalSection>
            )}
          </div>

          <ViewModalFooterStrip
            registered={formatDate(loan.createdAt)}
            updated={formatDate(loan.updatedAt)}
          />
        </>
      )}
    </ViewModalShell>
  );
}
