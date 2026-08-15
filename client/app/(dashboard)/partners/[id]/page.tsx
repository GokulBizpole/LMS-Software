// app/(dashboard)/partners/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getPartnerById } from "@/services/partner.service";
import PartnerFormModal from "@/components/partners/PartnerFormModal";
import type { Partner, PartnerLoanSummary } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

const LOAN_STATUS_STYLES: Record<PartnerLoanSummary["status"], { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  APPROVED: { bg: "#EAF3DE", text: "#3B6D11" },
  ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
  CLOSED: { bg: "#ECE9DF", text: "#45443E" },
  OVERDUE: { bg: "#FAEEDA", text: "#854F0B" },
  REJECTED: { bg: "#FAECE7", text: "#993C1D" },
};

function LoanStatusBadge({ status }: { status: PartnerLoanSummary["status"] }) {
  const c = LOAN_STATUS_STYLES[status] ?? LOAN_STATUS_STYLES.PENDING;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#DAD7CA] bg-[#ECE9DF] p-5">
      <p className="text-xs text-[#45443E] mb-1">{label}</p>
      <p className="text-xl font-bold text-[#1A1A18]">{value}</p>
    </div>
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

export default function PartnerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);

  useEffect(() => {
    if (!id) return;
    getPartnerById(id)
      .then(setPartner)
      .catch((err) => {
        console.error(err);
        setError("Could not load partner.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-40 bg-[#ECE9DF] rounded-2xl animate-pulse" />;
  }

  if (error || !partner) {
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
        {error ?? "Partner not found."}
      </div>
    );
  }

  const initials = partner.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/partners")}
        className="text-sm text-[#185FA5]"
      >
        ← Back to partners
      </button>

      {/* Profile header */}
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-lg font-semibold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#1A1A18]">{partner.name}</h1>
              <StatusBadge status={partner.status} />
            </div>
            <p className="text-sm text-[#45443E]">
              {partner.partnerCode} · {partner.phone}
              {partner.address ? ` · ${partner.address}` : ""}
            </p>
          </div>
        </div>
        <button
          onClick={() => setShowEdit(true)}
          className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E]"
        >
          Edit
        </button>
      </div>

      {/* Investment & loan stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatTile label="Investment amount" value={formatCurrency(partner.investmentAmount)} />
        <StatTile label="Current balance" value={formatCurrency(partner.currentBalance)} />
        <StatTile label="Total loan amount" value={formatCurrency(partner.stats?.totalLoanAmount ?? 0)} />
        <StatTile label="Total loans provided" value={String(partner.stats?.totalLoans ?? 0)} />
        <StatTile label="Active loans" value={String(partner.stats?.activeLoans ?? 0)} />
        <StatTile label="Closed loans" value={String(partner.stats?.closedLoans ?? 0)} />
      </div>

      {/* Contact details */}
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Contact details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <Field label="Phone" value={partner.phone} />
          <Field label="Email" value={partner.email} />
          <Field label="Address" value={partner.address} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-[#ECE9DF] p-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Joined" value={formatDate(partner.createdAt)} />
          <Field label="Last updated" value={formatDate(partner.updatedAt)} />
        </div>
      </div>

      {/* Borrowers */}
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">
          Customers who received loans through this partner
        </h2>

        {!partner.loans || partner.loans.length === 0 ? (
          <div className="flex items-center justify-center h-[100px] text-sm text-[#6B6A62]">
            No loans given yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[#6B6A62] text-xs border-b border-[#DAD7CA]">
                  <th className="py-2 pr-4 font-medium">Loan no</th>
                  <th className="py-2 pr-4 font-medium">Customer</th>
                  <th className="py-2 pr-4 font-medium">Principal</th>
                  <th className="py-2 pr-4 font-medium">Interest</th>
                  <th className="py-2 pr-4 font-medium">Duration</th>
                  <th className="py-2 pr-4 font-medium">Installment</th>
                  <th className="py-2 pr-4 font-medium">Payment status</th>
                  <th className="py-2 pr-4 font-medium">Loan status</th>
                  <th className="py-2 pr-4 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {partner.loans.map((loan) => (
                  <tr key={loan.id} className="border-b border-[#ECE9DF] last:border-0">
                    <td className="py-3 pr-4 text-[#1A1A18] font-medium">{loan.loanNumber}</td>
                    <td className="py-3 pr-4">
                      <p className="text-[#1A1A18]">{loan.customer.name}</p>
                      <p className="text-xs text-[#6B6A62]">
                        {loan.customer.customerCode} · {loan.customer.phone}
                      </p>
                    </td>
                    <td className="py-3 pr-4 text-[#1A1A18]">{formatCurrency(loan.principalAmount)}</td>
                    <td className="py-3 pr-4 text-[#45443E]">{loan.interestPercentage}%</td>
                    <td className="py-3 pr-4 text-[#45443E]">{loan.duration} mo</td>
                    <td className="py-3 pr-4 text-[#1A1A18]">{formatCurrency(loan.installmentAmount)}</td>
                    <td className="py-3 pr-4 text-[#45443E]">
                      {loan.paidInstallments} / {loan.totalInstallments} paid
                    </td>
                    <td className="py-3 pr-4">
                      <LoanStatusBadge status={loan.status} />
                    </td>
                    <td className="py-3 pr-4 text-right">
                      <Link
                        href={`/loans/${loan.id}`}
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
        )}
      </div>

      <PartnerFormModal
        open={showEdit}
        onClose={() => setShowEdit(false)}
        partner={partner}
        onSaved={(updated) => {
          setPartner(updated);
          setShowEdit(false);
        }}
      />
    </div>
  );
}