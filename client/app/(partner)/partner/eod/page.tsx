// app/(partner)/partner/eod/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { getMyEodPreview, submitMyEod, type SubmitEodExpense } from "@/services/partnerEod.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/expense";
import type { EodPreview, EodStatus } from "@/types/eod";
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

interface ExpenseRow {
  key: number;
  category: ExpenseCategory;
  amount: string;
  description: string;
}

let rowKeySeq = 0;
const newRow = (): ExpenseRow => ({
  key: rowKeySeq++,
  category: "OFFICE",
  amount: "",
  description: "",
});

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

export default function PartnerEodPage() {
  const { user } = useAuthContext();
  const toast = useToast();

  const [reportDate, setReportDate] = useState(todayDateString());
  const [preview, setPreview] = useState<EodPreview | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const [rows, setRows] = useState<ExpenseRow[]>([newRow()]);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadPreview = (date: string) => {
    setLoadingPreview(true);
    setPreviewError(null);
    getMyEodPreview(date)
      .then((data) => {
        setPreview(data);
        if (data.existing && data.existing.status === "REJECTED" && data.existing.expenses.length > 0) {
          setRows(
            data.existing.expenses.map((e) => ({
              key: rowKeySeq++,
              category: e.category,
              amount: String(e.amount),
              description: e.description ?? "",
            }))
          );
        } else if (!data.existing) {
          setRows([newRow()]);
        }
      })
      .catch((err) => {
        console.error(err);
        setPreviewError("Could not load EOD details for this date.");
      })
      .finally(() => setLoadingPreview(false));
  };

  useEffect(() => {
    loadPreview(reportDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reportDate]);

  const updateRow = (key: number, field: keyof ExpenseRow, value: string) => {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, [field]: value } : r)));
  };

  const addRow = () => setRows((prev) => [...prev, newRow()]);
  const removeRow = (key: number) => setRows((prev) => prev.filter((r) => r.key !== key));

  const totalCollection = preview?.totalCollection ?? 0;
  const totalExpenses = rows.reduce((sum, r) => sum + (Number(r.amount) || 0), 0);
  const netRemittance = totalCollection - totalExpenses;

  const existing = preview?.existing ?? null;
  const isLocked = existing != null && existing.status !== "REJECTED";
  const isResubmit = existing != null && existing.status === "REJECTED";

  const handleSubmit = async () => {
    setFormError(null);

    if (rows.length === 0) {
      setFormError("Add at least the day's expenses, or remove none if there were none.");
    }

    for (const row of rows) {
      if (!row.category) {
        setFormError("Every expense needs a category.");
        return;
      }
      if (!row.amount || Number(row.amount) <= 0) {
        setFormError("Every expense needs a valid amount greater than 0.");
        return;
      }
    }

    const payloadExpenses: SubmitEodExpense[] = rows.map((r) => ({
      category: r.category,
      amount: Number(r.amount),
      description: r.description || undefined,
    }));

    setSubmitting(true);
    try {
      const { message } = await submitMyEod({ reportDate, expenses: payloadExpenses });
      toast.success(message);
      loadPreview(reportDate);
    } catch (err) {
      setFormError(getErrorMessage(err, "Could not submit EOD report."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">End of Day Report</h1>
        <p className="text-sm text-[#45443E]">
          {user?.name} · Submit today&apos;s collection and expenses for admin review.
        </p>
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <label className="block text-xs text-[#6B6A62] mb-1">Report date</label>
        <input
          type="date"
          value={reportDate}
          max={todayDateString()}
          onChange={(e) => setReportDate(e.target.value)}
          className="rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
        />
      </div>

      {loadingPreview ? (
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 space-y-3 animate-pulse">
          <div className="h-10 bg-[#ECE9DF] rounded" />
          <div className="h-10 bg-[#ECE9DF] rounded" />
        </div>
      ) : previewError ? (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          <p className="mb-3">{previewError}</p>
          <button onClick={() => loadPreview(reportDate)} className="text-sm font-semibold underline">
            Try again
          </button>
        </div>
      ) : (
        <>
          <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
            <div className="flex items-center gap-3 mb-4">
              <h2 className="text-sm font-semibold text-[#1A1A18]">
                Report for {formatDate(reportDate)}
              </h2>
              {existing && <StatusBadge status={existing.status} />}
            </div>

            {isResubmit && existing?.rejectionReason && (
              <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D] mb-4">
                <p className="font-medium mb-0.5">This report was rejected:</p>
                <p>{existing.rejectionReason}</p>
                <p className="mt-1 text-xs">Update the expenses below and resubmit.</p>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Total collection</p>
                <p className="text-lg font-semibold text-[#1A1A18]">{formatCurrency(totalCollection)}</p>
                <p className="text-xs text-[#6B6A62]">Calculated automatically from today&apos;s payments</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Total expenses</p>
                <p className="text-lg font-semibold text-[#1A1A18]">{formatCurrency(totalExpenses)}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Net remittance</p>
                <p className="text-lg font-semibold text-[#1A1A18]">{formatCurrency(netRemittance)}</p>
              </div>
            </div>
          </div>

          {isLocked ? (
            <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
              <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">
                Expenses ({existing!.expenses.length})
              </h2>
              {existing!.expenses.length === 0 ? (
                <p className="text-sm text-[#6B6A62]">No expenses were added for this day.</p>
              ) : (
                <div className="space-y-3">
                  {existing!.expenses.map((e) => (
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
              <p className="text-xs text-[#6B6A62] mt-4">
                {existing!.status === "PENDING"
                  ? "This report has already been submitted and is awaiting admin review."
                  : "This report has been approved and closed."}
              </p>
            </div>
          ) : (
            <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-sm font-semibold text-[#1A1A18]">Expenses</h2>
                <button
                  type="button"
                  onClick={addRow}
                  className="text-sm font-medium text-[#185FA5] hover:underline"
                >
                  + Add expense
                </button>
              </div>

              {formError && (
                <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D] mb-4">
                  {formError}
                </div>
              )}

              {rows.length === 0 ? (
                <p className="text-sm text-[#6B6A62] mb-4">
                  No expenses added. Click &quot;+ Add expense&quot; if there were any, or submit with none.
                </p>
              ) : (
                <div className="space-y-3 mb-4">
                  {rows.map((row) => (
                    <div
                      key={row.key}
                      className="grid grid-cols-1 sm:grid-cols-[140px_120px_1fr_auto] gap-3 items-end border-b border-[#ECE9DF] last:border-0 pb-3 last:pb-0"
                    >
                      <div>
                        <label className="block text-xs text-[#6B6A62] mb-1">Category</label>
                        <select
                          value={row.category}
                          onChange={(e) => updateRow(row.key, "category", e.target.value)}
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        >
                          {EXPENSE_CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6A62] mb-1">Amount</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={row.amount}
                          onChange={(e) => updateRow(row.key, "amount", e.target.value)}
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-[#6B6A62] mb-1">Description</label>
                        <input
                          type="text"
                          value={row.description}
                          onChange={(e) => updateRow(row.key, "description", e.target.value)}
                          placeholder="Optional note"
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeRow(row.key)}
                        className="text-sm font-medium text-[#993C1D] hover:underline px-2 py-2"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {submitting ? "Submitting..." : isResubmit ? "Resubmit EOD report" : "Submit EOD report"}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
