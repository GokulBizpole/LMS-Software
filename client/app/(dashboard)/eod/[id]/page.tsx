// app/(dashboard)/eod/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getEodReportById, approveEodReport, rejectEodReport } from "@/services/eod.service";
import type { EodReport, EodStatus } from "@/types/eod";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<EodStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  CLOSED: { bg: "#EAF3DE", text: "#3B6D11" },
  REJECTED: { bg: "#FAECE7", text: "#993C1D" },
};

function StatusBadge({ status }: { status: EodStatus }) {
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

export default function EodReportDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [report, setReport] = useState<EodReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [rejectionReason, setRejectionReason] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState<"approve" | "reject" | null>(null);

  const load = () => {
    if (!id) return;
    setLoading(true);
    setLoadError(null);
    getEodReportById(id)
      .then(setReport)
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load EOD report.");
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

  if (loadError || !report) {
    return (
      <div className="space-y-4">
        <Link href="/eod" className="text-sm text-[#185FA5]">
          ← Back to EOD reports
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-3">{loadError ?? "EOD report not found."}</p>
          <button onClick={load} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      </div>
    );
  }

  const isPending = report.status === "PENDING";

  const handleApprove = async () => {
    if (!id) return;
    setActionError(null);
    setSubmitting("approve");
    try {
      await approveEodReport(id);
      router.push("/eod");
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err.message || "Could not approve EOD report.");
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
      await rejectEodReport(id, rejectionReason.trim());
      router.push("/eod");
    } catch (err: any) {
      setActionError(err?.response?.data?.message || err.message || "Could not reject EOD report.");
    } finally {
      setSubmitting(null);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/eod" className="text-sm text-[#185FA5]">
        ← Back to EOD reports
      </Link>

      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-[#1A1A18]">
          {isPending ? "Review EOD report" : `EOD report — ${formatDate(report.reportDate)}`}
        </h1>
        <StatusBadge status={report.status} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
              <div>
                <p className="text-xs text-[#6B6A62] mb-2">Partner</p>
                <p className="text-sm font-semibold text-[#1A1A18]">{report.partner?.name}</p>
                <p className="text-xs text-[#6B6A62]">{report.partner?.partnerCode}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-2">Report date</p>
                <p className="text-sm font-semibold text-[#1A1A18]">{formatDate(report.reportDate)}</p>
              </div>
            </div>

            <div className="border-t border-[#ECE9DF] pt-4">
              <p className="text-xs text-[#6B6A62] mb-3">Summary</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                <Field label="Total collection" value={formatCurrency(report.totalCollection)} />
                <Field label="Total expenses" value={formatCurrency(report.totalExpenses)} />
                <Field label="Net remittance" value={formatCurrency(report.netRemittance)} />
              </div>
            </div>

            {report.status === "REJECTED" && report.rejectionReason && (
              <div className="border-t border-[#ECE9DF] pt-4 mt-4">
                <p className="text-xs text-[#6B6A62] mb-1">Rejection reason</p>
                <p className="text-sm text-[#993C1D]">{report.rejectionReason}</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">
              Expenses ({report.expenses.length})
            </h2>

            {report.expenses.length === 0 ? (
              <p className="text-sm text-[#6B6A62]">No expenses were added for this day.</p>
            ) : (
              <div className="space-y-3">
                {report.expenses.map((e) => (
                  <div
                    key={e.id}
                    className="flex items-center justify-between border-b border-[#ECE9DF] last:border-0 pb-3 last:pb-0"
                  >
                    <div>
                      <p className="text-sm text-[#1A1A18] font-medium">{e.category}</p>
                      {e.description && <p className="text-xs text-[#6B6A62]">{e.description}</p>}
                    </div>
                    <p className="text-sm text-[#1A1A18] font-medium">{formatCurrency(e.amount)}</p>
                  </div>
                ))}
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
                placeholder="e.g. mismatched collection amount, missing receipts..."
                className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] mb-5"
              />

              <div className="flex items-center gap-3">
                <button
                  onClick={handleReject}
                  disabled={submitting !== null}
                  className="flex-1 border border-[#993C1D] text-[#993C1D] text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting === "reject" ? "Rejecting..." : "✕ Reject report"}
                </button>
                <button
                  onClick={handleApprove}
                  disabled={submitting !== null}
                  className="flex-1 bg-[#3B6D11] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {submitting === "approve" ? "Approving..." : "✓ Approve report"}
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
                  <li>Status → CLOSED</li>
                  <li>Partner notified</li>
                </ul>
              </div>
              <div>
                <p className="font-medium text-[#1A1A18] mb-1">On Reject:</p>
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Status → REJECTED</li>
                  <li>Partner can edit and resubmit</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
