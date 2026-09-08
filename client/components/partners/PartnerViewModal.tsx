// components/partners/PartnerViewModal.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import {
  ViewModalShell,
  ViewModalSummary,
  ViewModalTabs,
  ViewModalSection,
  ViewModalField,
  ViewModalFooterStrip,
} from "@/components/ui/ViewModal";
import { deletePartner, getPartnerById, partnerFileUrl } from "@/services/partner.service";
import PartnerFormModal from "@/components/partners/PartnerFormModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Partner, PartnerLoanSummary } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const TABS = [
  { key: "overview", label: "Overview" },
  { key: "loans", label: "Loans" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
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
    <span className="text-[11px] font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

function StatTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-[#DAD7CA] bg-[#ECE9DF] p-4">
      <p className="text-xs text-[#45443E] mb-1">{label}</p>
      <p className="text-lg font-bold text-[#1A1A18]">{value}</p>
    </div>
  );
}

export default function PartnerViewModal({
  open,
  partnerId,
  onClose,
  onChanged,
}: {
  open: boolean;
  partnerId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tab, setTab] = useState<TabKey>("overview");

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open || !partnerId) return;

    const load = () => {
      setTab("overview");
      setLoading(true);
      setError(null);
      getPartnerById(partnerId)
        .then(setPartner)
        .catch((err) => {
          console.error(err);
          setError("Could not load partner.");
        })
        .finally(() => setLoading(false));
    };
    load();
  }, [open, partnerId]);

  const handleDelete = async () => {
    if (!partner) return;
    setDeleting(true);
    try {
      const { message } = await deletePartner(partner.id);
      toast.success(message);
      setShowDeleteConfirm(false);
      onClose();
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete partner. Please try again."));
      setDeleting(false);
    }
  };

  const initials = partner?.name
    ? partner.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <>
      <ViewModalShell
        open={open}
        onClose={onClose}
        title="View Partner"
        maxWidth="max-w-3xl"
        actions={
          partner && (
            <>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="text-sm font-medium px-3 py-1.5 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF]"
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-[#993C1D] text-[#993C1D] hover:bg-[#FAECE7]"
              >
                <Trash2 size={14} />
                Delete
              </button>
            </>
          )
        }
      >
        {loading ? (
          <div className="p-6 space-y-3 animate-pulse">
            <div className="h-16 bg-[#ECE9DF] rounded-xl" />
            <div className="h-32 bg-[#ECE9DF] rounded-xl" />
          </div>
        ) : error || !partner ? (
          <div className="p-6 text-center text-sm text-[#993C1D]">{error ?? "Partner not found."}</div>
        ) : (
          <>
            <ViewModalSummary
              initials={initials}
              avatarBg="#EEEDFE"
              avatarColor="#534AB7"
              photoUrl={partner.profilePicture ? partnerFileUrl(partner.profilePicture) : null}
              name={partner.name}
              badge={<StatusBadge status={partner.status} />}
              subtitle={`${partner.partnerCode} · ${partner.phone}`}
            />

            <ViewModalTabs tabs={[...TABS]} active={tab} onChange={(k) => setTab(k as TabKey)} />

            <div className="p-6 space-y-4">
              {tab === "overview" && (
                <>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <StatTile label="Investment amount" value={formatCurrency(partner.investmentAmount)} />
                    <StatTile label="Current balance" value={formatCurrency(partner.currentBalance)} />
                    <StatTile label="Total loan amount" value={formatCurrency(partner.stats?.totalLoanAmount ?? 0)} />
                    <StatTile label="Total loans" value={String(partner.stats?.totalLoans ?? 0)} />
                    <StatTile label="Active loans" value={String(partner.stats?.activeLoans ?? 0)} />
                    <StatTile label="Closed loans" value={String(partner.stats?.closedLoans ?? 0)} />
                  </div>

                  <ViewModalSection title="Contact Details">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                      <ViewModalField label="Phone" value={partner.phone} />
                      <ViewModalField label="Email" value={partner.email} />
                      <ViewModalField label="Address" value={partner.address} />
                    </div>
                  </ViewModalSection>
                </>
              )}

              {tab === "loans" &&
                (!partner.loans || partner.loans.length === 0 ? (
                  <div className="flex items-center justify-center h-24 text-sm text-[#6B6A62]">
                    No loans given yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                    <table className="w-full min-w-160 text-sm">
                      <thead>
                        <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                          <th className="py-2 px-4 font-medium">Loan no</th>
                          <th className="py-2 px-4 font-medium">Customer</th>
                          <th className="py-2 px-4 font-medium text-right">Principal</th>
                          <th className="py-2 px-4 font-medium">Status</th>
                          <th className="py-2 px-4 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white">
                        {partner.loans.map((loan) => (
                          <tr key={loan.id} className="border-b border-[#E5E7EB] last:border-0">
                            <td className="py-3 px-4 text-[#1A1A18] font-medium">{loan.loanNumber}</td>
                            <td className="py-3 px-4 text-[#45443E]">{loan.customer.name}</td>
                            <td className="py-3 px-4 text-[#1A1A18] text-right">
                              {formatCurrency(loan.principalAmount)}
                            </td>
                            <td className="py-3 px-4">
                              <LoanStatusBadge status={loan.status} />
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Link href={`/loans/${loan.id}`} className="text-[#185FA5] font-medium hover:underline">
                                Open
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ))}
            </div>

            {tab === "overview" && (
              <ViewModalFooterStrip
                registered={formatDate(partner.createdAt)}
                updated={formatDate(partner.updatedAt)}
              />
            )}
          </>
        )}
      </ViewModalShell>

      {partner && (
        <PartnerFormModal
          open={showEdit}
          onClose={() => setShowEdit(false)}
          partner={partner}
          onSaved={(updated) => {
            setPartner(updated);
            setShowEdit(false);
            onChanged?.();
          }}
        />
      )}

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete partner"
        message="Delete this partner? This cannot be undone."
        confirming={deleting}
      />
    </>
  );
}
