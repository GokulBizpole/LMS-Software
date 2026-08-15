// app/(dashboard)/loans/page.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useLoans } from "@/hooks/useLoans";
import type { Loan, LoanStatus } from "@/types/loan";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const TABS: { key: "ALL" | LoanStatus; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PENDING", label: "Pending" },
  { key: "ACTIVE", label: "Active" },
  { key: "REJECTED", label: "Rejected" },
  { key: "CLOSED", label: "Closed" },
];

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

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-[#6B6A62] mb-1">{label}</p>
      <p className="text-sm font-semibold text-[#1A1A18]">{value}</p>
    </div>
  );
}

function LoanCard({ loan }: { loan: Loan }) {
  const isPending = loan.status === "PENDING";
  const initials = (loan.customer?.name ?? "?")
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const borderAccent = isPending ? "border-l-4 border-l-[#D98324]" : "";

  return (
    <div
      className={`rounded-2xl border border-[#DAD7CA] bg-white p-5 ${borderAccent}`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="flex items-start gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[#1A1A18]">{loan.loanNumber}</span>
              <StatusBadge status={loan.status} />
            </div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 shrink-0 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-[11px] font-semibold">
                {initials}
              </div>
              <div>
                <p className="text-sm font-medium text-[#1A1A18]">{loan.customer?.name ?? "—"}</p>
                <p className="text-xs text-[#6B6A62]">
                  {loan.customer?.customerCode} · {loan.customer?.phone}
                </p>
              </div>
            </div>
          </div>
        </div>

        {isPending && (
          <div className="text-left sm:text-right">
            <p className="text-xs text-[#6B6A62] mb-1">Submitted by partner</p>
            <p className="text-sm font-medium text-[#1A1A18]">
              {loan.partner?.partnerCode} - {loan.partner?.name}
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-6 border-t border-[#ECE9DF] pt-4">
        {isPending ? (
          <>
            <Stat label="Principal" value={formatCurrency(loan.principalAmount)} />
            <Stat label="Interest" value={`${loan.interestPercentage}%`} />
            <Stat label="Duration" value={`${loan.duration} months`} />
            <Stat label="Installment" value={formatCurrency(loan.installmentAmount)} />
          </>
        ) : (
          <>
            <Stat label="Balance" value={formatCurrency(loan.balanceAmount)} />
            <Stat
              label="Progress"
              value={`${loan.paidInstallments} / ${loan.totalInstallments} paid`}
            />
            {loan.startDate && <Stat label="Started" value={formatDate(loan.startDate)} />}
          </>
        )}

        <Link
          href={`/loans/${loan.id}`}
          className={`ml-auto text-sm font-medium px-4 py-2 rounded-lg ${
            isPending
              ? "bg-[#1A1A18] text-white"
              : "border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF]"
          }`}
        >
          {isPending ? "Review" : "View details"}
        </Link>
      </div>

      {loan.remarks && (
        <p className="text-xs text-[#6B6A62] mt-3">
          Remarks: &quot;{loan.remarks}&quot;
        </p>
      )}
    </div>
  );
}

export default function LoansPage() {
  const { loans, loading, error, refetch } = useLoans();
  const [tab, setTab] = useState<"ALL" | LoanStatus>("PENDING");

  const pendingCount = useMemo(
    () => loans.filter((l) => l.status === "PENDING").length,
    [loans]
  );

  const filteredLoans = useMemo(
    () => (tab === "ALL" ? loans : loans.filter((l) => l.status === tab)),
    [loans, tab]
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Loans</h1>
        <p className="text-sm text-[#45443E]">
          {pendingCount} pending approval - submitted by partners
        </p>
      </div>

      <div className="flex items-center gap-1 flex-wrap">
        {TABS.map((t) => {
          const isActive = tab === t.key;
          const count = t.key === "PENDING" ? pendingCount : null;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
                isActive
                  ? "bg-[#FAEEDA] text-[#854F0B] font-medium"
                  : "text-[#45443E] hover:bg-[#ECE9DF]"
              }`}
            >
              {t.label}
              {count !== null ? ` (${count})` : ""}
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-32 bg-[#ECE9DF] rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-2">{error}</p>
          <button onClick={refetch} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      ) : filteredLoans.length === 0 ? (
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-10 text-center text-sm text-[#6B6A62]">
          No loans found for this filter.
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}
    </div>
  );
}
