// components/groups/GroupViewModal.tsx
// Group details popup. Edit/Delete are rendered only for the partner scope —
// admins have view + create access to groups, nothing more.
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Trash2, Crown, FilePlus, Wallet, CalendarDays } from "lucide-react";
import {
  ViewModalShell,
  ViewModalSummary,
  ViewModalSection,
  ViewModalField,
  ViewModalFooterStrip,
} from "@/components/ui/ViewModal";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusDot from "@/components/ui/StatusDot";
import GroupFormModal from "@/components/groups/GroupFormModal";
import { CreatedByBadge } from "@/components/tables/GroupTable";
import { StatusBadge as LoanStatusBadge } from "@/components/tables/LoanTable";
import LoanFormModal from "@/components/partner/LoanFormModal";
import LoanCollectionModal from "@/components/loans/LoanCollectionModal";
import { deleteMyGroup, getGroupById, type GroupScope } from "@/services/group.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatDate } from "@/utils/formatDate";
import { formatCurrency } from "@/utils/formatCurrency";
import type { GroupDetail } from "@/types/group";

const STATUS_STYLE: Record<string, { color: string; label: string }> = {
  ACTIVE: { color: "#3B6D11", label: "Active" },
  BLOCKED: { color: "#E31E24", label: "Blocked" },
  CLOSED: { color: "#6B6A62", label: "Closed" },
};

export default function GroupViewModal({
  open,
  scope,
  groupId,
  onClose,
  onChanged,
}: {
  open: boolean;
  scope: GroupScope;
  groupId: string | null;
  onClose: () => void;
  onChanged?: () => void;
}) {
  const canManage = scope === "partner";
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // Member the "Create Loan" popup was opened for (partner only — loans are
  // created by partners and go to Admin for approval).
  const [loanCustomerId, setLoanCustomerId] = useState<string | null>(null);
  // Loan whose weekly collection / schedule popup is open.
  const [collectionLoanId, setCollectionLoanId] = useState<string | null>(null);
  const toast = useToast();

  useEffect(() => {
    if (!open || !groupId) return;

    const load = () => {
      setLoading(true);
      setError(null);
      setShowDeleteConfirm(false);
      setLoanCustomerId(null);
      setCollectionLoanId(null);
      getGroupById(scope, groupId)
        .then(setGroup)
        .catch((err) => {
          console.error(err);
          setError("Could not load group.");
        })
        .finally(() => setLoading(false));
    };
    load();
  }, [open, scope, groupId]);

  // Re-fetch without the loading skeleton so the members list just updates
  // in place (e.g. to show a newly created loan).
  const refreshGroup = () => {
    if (!groupId) return;
    getGroupById(scope, groupId)
      .then(setGroup)
      .catch((err) => console.error(err));
  };

  const handleDelete = async () => {
    if (!group) return;
    setDeleting(true);
    try {
      const { message } = await deleteMyGroup(group.id);
      toast.success(message);
      setShowDeleteConfirm(false);
      onChanged?.();
      onClose();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete group. Please try again."));
    } finally {
      setDeleting(false);
    }
  };

  const initials = group?.name
    ? group.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  const members = group
    ? [...group.members].sort((a, b) =>
        a.customerId === group.groupHeadId ? -1 : b.customerId === group.groupHeadId ? 1 : 0
      )
    : [];

  return (
    <>
      <ViewModalShell
        open={open}
        // Popups opened on top of this one handle Escape themselves; don't
        // let it close the group view underneath too.
        onClose={showEdit || loanCustomerId || collectionLoanId ? () => {} : onClose}
        title="View Group"
        maxWidth="max-w-3xl"
        actions={
          canManage &&
          group && (
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
                className="flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg bg-[#FCE4E4] text-[#E31E24] hover:bg-[#E31E24]/15"
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
        ) : error || !group ? (
          <div className="p-6 text-center text-sm text-[#E31E24]">{error ?? "Group not found."}</div>
        ) : (
          <>
            <ViewModalSummary
              initials={initials}
              avatarBg="#EEEDFE"
              avatarColor="#534AB7"
              name={group.name}
              badge={
                <span className="text-xs font-medium px-2 py-1 rounded-md bg-[#EEEDFE] text-[#534AB7]">
                  {group.groupCode}
                </span>
              }
              subtitle={`${group.members.length} member${group.members.length !== 1 ? "s" : ""}`}
            />

            <div className="p-6 space-y-4">
              <ViewModalSection title="Group Details">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
                  <ViewModalField label="Group code" value={group.groupCode} />
                  <ViewModalField label="Group name" value={group.name} />
                  <ViewModalField
                    label="Group head"
                    value={`${group.groupHead.name} (${group.groupHead.customerCode})`}
                  />
                  {scope === "admin" && (
                    <ViewModalField
                      label="Partner"
                      value={group.partner ? `${group.partner.name} (${group.partner.partnerCode})` : null}
                    />
                  )}
                  <ViewModalField label="Created by" value={<CreatedByBadge group={group} />} />
                  <ViewModalField label="Total members" value={String(group.members.length)} />
                </div>
              </ViewModalSection>

              <ViewModalSection title="Members">
                <div className="overflow-x-auto rounded-xl border border-[#E5E7EB] mt-1">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                        <th className="py-2 px-4 font-medium">Customer</th>
                        <th className="py-2 px-4 font-medium">Phone</th>
                        <th className="py-2 px-4 font-medium">City</th>
                        <th className="py-2 px-4 font-medium">Status</th>
                        <th className="py-2 px-4 font-medium">Latest loan</th>
                        <th className="py-2 px-4 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {members.map((m) => {
                        const isHead = m.customerId === group.groupHeadId;
                        const status = STATUS_STYLE[m.customer.status] ?? STATUS_STYLE.CLOSED;
                        const latestLoan = m.customer.loans?.[0];
                        // Newest loan that has a live schedule (not pending/rejected);
                        // can be older than latestLoan when a carry-over loan is pending.
                        const scheduleLoan = m.customer.loans?.find(
                          (l) => l.status !== "PENDING" && l.status !== "REJECTED"
                        );
                        const canCollect =
                          canManage &&
                          (scheduleLoan?.status === "ACTIVE" || scheduleLoan?.status === "APPROVED");
                        return (
                          <tr key={m.id} className="border-b border-[#E5E7EB] last:border-0">
                            <td className="py-2.5 px-4">
                              <p className="text-[#1A1A18] font-medium leading-tight flex items-center gap-1.5">
                                {m.customer.name}
                                {isHead && (
                                  <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAEEDA] text-[#854F0B]">
                                    <Crown size={10} />
                                    HEAD
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#6B6A62] leading-tight">{m.customer.customerCode}</p>
                            </td>
                            <td className="py-2.5 px-4 text-[#45443E]">{m.customer.phone}</td>
                            <td className="py-2.5 px-4 text-[#45443E]">{m.customer.city ?? "—"}</td>
                            <td className="py-2.5 px-4">
                              <StatusDot color={status.color} label={status.label} />
                            </td>
                            <td className="py-2.5 px-4">
                              {latestLoan ? (
                                <div className="flex flex-col items-start gap-1">
                                  <LoanStatusBadge status={latestLoan.status} />
                                  <Link
                                    href={`${scope === "partner" ? "/partner/loans" : "/loans"}/${latestLoan.id}`}
                                    className="text-xs text-[#185FA5] hover:underline whitespace-nowrap"
                                  >
                                    {latestLoan.loanNumber} · {formatCurrency(Number(latestLoan.principalAmount))}
                                  </Link>
                                </div>
                              ) : (
                                <span className="text-[#9C9A8D]">—</span>
                              )}
                            </td>
                            <td className="py-2.5 px-4 text-right">
                              <div className="inline-flex items-center gap-1.5">
                              {scheduleLoan && (
                                <button
                                  type="button"
                                  onClick={() => setCollectionLoanId(scheduleLoan.id)}
                                  className={`inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg whitespace-nowrap ${
                                    canCollect
                                      ? "bg-[#1A1A18] text-white hover:bg-[#1A1A18]/85"
                                      : "border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF]"
                                  }`}
                                >
                                  {canCollect ? <Wallet size={13} /> : <CalendarDays size={13} />}
                                  {canCollect ? "Collect" : "Schedule"}
                                </button>
                              )}
                              {canManage && (
                                <button
                                  type="button"
                                  onClick={() => setLoanCustomerId(m.customerId)}
                                  disabled={m.customer.status !== "ACTIVE"}
                                  title={m.customer.status !== "ACTIVE" ? "Only active customers can get a loan" : undefined}
                                  className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                                >
                                  <FilePlus size={13} />
                                  Create Loan
                                </button>
                              )}
                              {!scheduleLoan && !canManage && <span className="text-[#9C9A8D]">—</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </ViewModalSection>
            </div>

            <ViewModalFooterStrip
              registered={formatDate(group.createdAt)}
              updated={formatDate(group.updatedAt)}
            />
          </>
        )}
      </ViewModalShell>

      {canManage && group && (
        <GroupFormModal
          open={showEdit}
          scope={scope}
          group={group}
          onClose={() => setShowEdit(false)}
          onSaved={(updated) => {
            setGroup(updated);
            setShowEdit(false);
            onChanged?.();
          }}
        />
      )}

      {/* Existing partner loan form, unchanged — pre-selected to the member.
          Group membership isn't touched by creating a loan. */}
      {canManage && (
        <LoanFormModal
          open={open && loanCustomerId !== null}
          initialCustomerId={loanCustomerId ?? undefined}
          onClose={() => setLoanCustomerId(null)}
          onSaved={() => {
            setLoanCustomerId(null);
            refreshGroup();
            onChanged?.();
          }}
        />
      )}

      {/* Weekly collection (partner) / read-only schedule (admin). The group
          refreshes after a collection so latest-loan status stays current. */}
      <LoanCollectionModal
        open={open && collectionLoanId !== null}
        loanId={collectionLoanId}
        scope={scope}
        onClose={() => setCollectionLoanId(null)}
        onCollected={() => {
          refreshGroup();
          onChanged?.();
        }}
      />

      {canManage && (
        <ConfirmDialog
          open={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          title="Delete group"
          message="Delete this group? Its members stay as customers — only the group is removed."
          confirming={deleting}
        />
      )}
    </>
  );
}
