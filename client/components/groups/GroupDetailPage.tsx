// components/groups/GroupDetailPage.tsx
// Partner group page: header with group head + actions, loan/collection
// totals, today's collection banner and each member's weekly payment status.
// Figures come from the server (group detail + overview); member actions
// reuse the existing Collect, Create Loan and Edit Group popups.
"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft, MapPin, Pencil, Trash2, Plus, Crown, Wallet, FilePlus, CalendarDays } from "lucide-react";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import GroupFormModal from "@/components/groups/GroupFormModal";
import LoanFormModal from "@/components/partner/LoanFormModal";
import LoanCollectionModal from "@/components/loans/LoanCollectionModal";
import { deleteMyGroup, getGroupById, getGroupOverview } from "@/services/group.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { GroupDetail, GroupOverview, MemberWeekStatus } from "@/types/group";

const WEEK_STATUS: Record<MemberWeekStatus, { label: string; bg: string; text: string }> = {
  PAID: { label: "Paid", bg: "#EAF3DE", text: "#3B6D11" },
  DUE: { label: "Due", bg: "#FAEEDA", text: "#854F0B" },
  MISSED: { label: "Missed", bg: "#FCE4E4", text: "#E31E24" },
  UPCOMING: { label: "Upcoming", bg: "#E6F1FB", text: "#185FA5" },
  NO_LOAN: { label: "No loan", bg: "#ECE9DF", text: "#6B6A62" },
};

function StatCard({ label, value, color = "#1A1A18" }: { label: string; value: string; color?: string }) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4">
      <p className="text-xs font-medium text-[#6B6A62] mb-1">{label}</p>
      <p className="text-xl font-bold" style={{ color }}>
        {value}
      </p>
    </div>
  );
}

const initialsOf = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

export default function GroupDetailPage({ groupId }: { groupId: string }) {
  const router = useRouter();
  const toast = useToast();
  const [group, setGroup] = useState<GroupDetail | null>(null);
  const [overview, setOverview] = useState<GroupOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [showEdit, setShowEdit] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);
  // "" = Give Loan with no customer pre-selected; an id = that member.
  const [loanCustomerId, setLoanCustomerId] = useState<string | null>(null);
  const [collectionLoanId, setCollectionLoanId] = useState<string | null>(null);

  // Quiet refresh keeps the page in place after an action.
  const load = useCallback(
    (quiet = false) => {
      if (!quiet) {
        setLoading(true);
        setError(null);
      }
      return Promise.all([getGroupById("partner", groupId), getGroupOverview("partner", groupId)])
        .then(([g, o]) => {
          setGroup(g);
          setOverview(o);
        })
        .catch((err) => {
          console.error(err);
          if (!quiet) setError("Could not load group.");
        })
        .finally(() => {
          if (!quiet) setLoading(false);
        });
    },
    [groupId]
  );

  useEffect(() => {
    const run = () => {
      load();
    };
    run();
  }, [load]);

  const handleDelete = async () => {
    if (!group) return;
    setDeleting(true);
    try {
      const { message } = await deleteMyGroup(group.id);
      toast.success(message);
      router.push("/partner/groups");
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete group. Please try again."));
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-24 bg-[#ECE9DF] rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 bg-[#ECE9DF] rounded-2xl" />
          ))}
        </div>
        <div className="h-24 bg-[#ECE9DF] rounded-2xl" />
        <div className="h-72 bg-[#ECE9DF] rounded-2xl" />
      </div>
    );
  }

  if (error || !group || !overview) {
    return (
      <div className="space-y-4">
        <Link href="/partner/groups" className="text-sm text-[#185FA5] hover:underline">
          ← Back to groups
        </Link>
        <div className="rounded-2xl border border-[#E5E7EB] bg-white text-center py-8">
          <p className="text-[#E31E24] text-sm mb-2">{error ?? "Group not found."}</p>
          <button onClick={() => load()} className="text-sm font-semibold text-[#E31E24] underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const today = new Date(overview.today.date);
  const weekday = today.toLocaleDateString("en-IN", { weekday: "long" });
  const statusByCustomer = new Map(overview.members.map((m) => [m.customerId, m]));
  // Group head first, then in the order members were added.
  const members = [...group.members].sort((a, b) =>
    a.customerId === group.groupHeadId ? -1 : b.customerId === group.groupHeadId ? 1 : 0
  );

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-3">
        <Link
          href="/partner/groups"
          aria-label="Back to groups"
          className="w-8 h-8 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B6A62] hover:bg-[#F8FAFC]"
        >
          <ChevronLeft size={16} />
        </Link>
        <p className="text-sm text-[#6B6A62]">
          <Link href="/partner/groups" className="hover:underline">
            Groups
          </Link>{" "}
          / <span className="font-semibold text-[#1A1A18]">{group.name}</span>
        </p>
      </div>

      {/* Header */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5 flex flex-wrap items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-2xl bg-[#FCE4E4] flex items-center justify-center text-[#E31E24] text-lg font-bold">
          {initialsOf(group.name)}
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#1A1A18] truncate">{group.name}</h1>
          <p className="flex flex-wrap items-center gap-x-2 text-sm text-[#6B6A62]">
            <span className="inline-flex items-center gap-1">
              <MapPin size={13} />
              {group.groupHead.city || "—"}
            </span>
            <span className="text-[#C4C1B3]">·</span>
            <span>Weekly collection</span>
            <span className="text-[#C4C1B3]">·</span>
            <span>
              {group.members.length} member{group.members.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[#C4C1B3]">·</span>
            <span>{group.groupCode}</span>
          </p>
        </div>
        <div className="flex items-center gap-2.5 rounded-xl bg-[#F8FAFC] px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#E31E24] text-xs font-semibold">
            {group.groupHead.name.trim()[0]?.toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-[#1A1A18] leading-tight">{group.groupHead.name}</p>
            <p className="text-[11px] text-[#6B6A62]">Group Head</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 ml-auto">
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            aria-label="Edit group"
            title="Edit group"
            className="w-9 h-9 rounded-lg border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
          >
            <Pencil size={15} />
          </button>
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            aria-label="Delete group"
            title="Delete group"
            className="w-9 h-9 rounded-lg bg-[#FCE4E4] flex items-center justify-center text-[#E31E24] hover:bg-[#E31E24]/15"
          >
            <Trash2 size={15} />
          </button>
          <button
            type="button"
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-1.5 border border-[#C4C1B3] text-sm font-semibold px-4 py-2 rounded-lg text-[#1A1A18] hover:bg-[#ECE9DF]"
          >
            <Plus size={15} />
            Add Member
          </button>
          <button
            type="button"
            onClick={() => setLoanCustomerId("")}
            className="flex items-center gap-1.5 bg-[#1A1A18] text-white text-sm font-semibold px-4 py-2 rounded-lg"
          >
            <Plus size={15} />
            Give Loan
          </button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total members" value={String(overview.stats.totalMembers)} />
        <StatCard label="Total loan given" value={formatCurrency(overview.stats.totalLoanGiven)} />
        <StatCard label="Outstanding" value={formatCurrency(overview.stats.outstanding)} color="#E31E24" />
        <StatCard label="Collected till date" value={formatCurrency(overview.stats.collectedTillDate)} color="#3B6D11" />
      </div>

      {/* Today's collection */}
      <div className="rounded-2xl border border-[#E31E24]/60 bg-[#FCE4E4]/60 px-6 py-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-bold tracking-wide text-[#E31E24] uppercase">Today&apos;s collection date</p>
          <p className="text-lg font-bold text-[#1A1A18]">
            {formatDate(today)} ({weekday})
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-[#6B6A62]">Total collected today</p>
          <p className="text-2xl font-bold text-[#E31E24]">{formatCurrency(overview.today.collectedToday)}</p>
          <p className="text-xs text-[#6B6A62]">
            {overview.today.membersDueThisWeek > 0
              ? `${overview.today.membersPaid} of ${overview.today.membersDueThisWeek} member${
                  overview.today.membersDueThisWeek !== 1 ? "s" : ""
                } paid this week`
              : "No installments due this week"}
          </p>
        </div>
      </div>

      {/* Members */}
      <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4">
          <h2 className="text-base font-bold text-[#1A1A18]">Members — weekly payment status</h2>
          <span className="text-xs text-[#6B6A62]">
            {group.members.length} member{group.members.length !== 1 ? "s" : ""}
          </span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-215 text-sm">
            <thead>
              <tr className="text-left text-[11px] font-semibold tracking-wide uppercase text-[#6B6A62] bg-[#F8FAFC]">
                <th className="py-3 px-5">Member</th>
                <th className="py-3 px-5">Loan no</th>
                <th className="py-3 px-5">Weekly amount</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Paid today</th>
                <th className="py-3 px-5 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const o = statusByCustomer.get(m.customerId);
                const status = WEEK_STATUS[o?.weekStatus ?? "NO_LOAN"];
                const isHead = m.customerId === group.groupHeadId;
                const pendingLoan = m.customer.loans?.find((l) => l.status === "PENDING");
                const canCollect = o?.loan?.status === "ACTIVE" || o?.loan?.status === "APPROVED";

                return (
                  <tr key={m.id} className="border-t border-[#E5E7EB] hover:bg-[#F8FAFC]">
                    <td className="py-3.5 px-5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-[#F1F2F4] flex items-center justify-center text-[#1A1A18] text-xs font-bold">
                          {m.customer.name.trim()[0]?.toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-[#1A1A18] leading-tight flex items-center gap-1.5">
                            {m.customer.name}
                            {isHead && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAEEDA] text-[#854F0B]">
                                <Crown size={10} />
                                HEAD
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-[#6B6A62] leading-tight">{m.customer.customerCode}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-5 font-mono text-[13px] text-[#45443E]">
                      {o?.loan ? (
                        <Link href={`/partner/loans/${o.loan.id}`} className="hover:underline">
                          {o.loan.loanNumber}
                        </Link>
                      ) : (
                        "—"
                      )}
                      {pendingLoan && (
                        <p className="font-sans text-[11px] text-[#854F0B]">{pendingLoan.loanNumber} pending approval</p>
                      )}
                    </td>
                    <td className="py-3.5 px-5 text-[#1A1A18]">
                      {o?.loan ? formatCurrency(o.weekAmount) : "—"}
                      {o && o.carriedForward > 0 && (
                        <p className="text-[11px] text-[#E31E24]">
                          {formatCurrency(o.dueNow)} due · incl. {formatCurrency(o.carriedForward)} carried
                        </p>
                      )}
                    </td>
                    <td className="py-3.5 px-5">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: status.bg, color: status.text }}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td className="py-3.5 px-5 text-right font-semibold text-[#1A1A18]">
                      {o && o.paidToday > 0 ? formatCurrency(o.paidToday) : "—"}
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        {o?.loan && (
                          <button
                            type="button"
                            onClick={() => setCollectionLoanId(o.loan!.id)}
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
                        <button
                          type="button"
                          onClick={() => setLoanCustomerId(m.customerId)}
                          disabled={m.customer.status !== "ACTIVE"}
                          title={m.customer.status !== "ACTIVE" ? "Only active customers can get a loan" : "Create loan"}
                          className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF] whitespace-nowrap disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <FilePlus size={13} />
                          Loan
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <GroupFormModal
        open={showEdit}
        scope="partner"
        group={group}
        onClose={() => setShowEdit(false)}
        onSaved={() => {
          setShowEdit(false);
          load(true);
        }}
      />

      <LoanFormModal
        open={loanCustomerId !== null}
        initialCustomerId={loanCustomerId || undefined}
        onClose={() => setLoanCustomerId(null)}
        onSaved={() => {
          setLoanCustomerId(null);
          load(true);
        }}
      />

      <LoanCollectionModal
        open={collectionLoanId !== null}
        loanId={collectionLoanId}
        scope="partner"
        onClose={() => setCollectionLoanId(null)}
        onCollected={() => load(true)}
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete group"
        message="Delete this group? Its members stay as customers — only the group is removed."
        confirming={deleting}
      />
    </div>
  );
}
