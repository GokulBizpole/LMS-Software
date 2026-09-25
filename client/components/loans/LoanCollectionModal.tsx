// components/loans/LoanCollectionModal.tsx
// Weekly collection screen for one loan: what's due now (with unpaid weeks
// carried forward), a collect form (partner only) and the permanent
// week-by-week payment history. All figures come from the server
// (getLoanCollection); nothing here is calculated beyond display previews.
"use client";

import { Fragment, useEffect, useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import { ViewModalShell, ViewModalSummary } from "@/components/ui/ViewModal";
import { SelectField, TextareaField } from "@/components/ui/FormField";
import { StatusBadge as LoanStatusBadge } from "@/components/tables/LoanTable";
import {
  collectMyLoanPayment,
  downloadMyReceipt,
  getLoanCollection,
} from "@/services/partnerPayment.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { LoanCollection } from "@/types/collection";

type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER";

function SummaryCard({
  label,
  value,
  hint,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "due" | "warn" | "good";
}) {
  const color = { default: "#1A1A18", due: "#E31E24", warn: "#854F0B", good: "#3B6D11" }[tone];
  return (
    <div className="rounded-xl border border-[#E5E7EB] bg-white p-3">
      <p className="text-xs text-[#6B6A62] mb-1">{label}</p>
      <p className="text-lg font-bold" style={{ color }}>
        {value}
      </p>
      {hint && <p className="text-[11px] text-[#9C9A8D] mt-0.5">{hint}</p>}
    </div>
  );
}

export default function LoanCollectionModal({
  open,
  loanId,
  scope,
  onClose,
  onCollected,
}: {
  open: boolean;
  loanId: string | null;
  scope: "admin" | "partner";
  onClose: () => void;
  onCollected?: () => void;
}) {
  const [data, setData] = useState<LoanCollection | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CASH");
  const [remarks, setRemarks] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const toast = useToast();

  const canCollect = scope === "partner" && !!data?.summary.canCollect;

  // Prefill with what's due now (all carried-forward weeks included), or
  // the next week's amount when nothing is due yet.
  const applyCollection = (c: LoanCollection) => {
    setData(c);
    const suggested = c.summary.dueNow > 0 ? c.summary.dueNow : c.summary.nextDue?.amount ?? 0;
    setAmount(suggested > 0 ? String(suggested) : "");
  };

  useEffect(() => {
    if (!open || !loanId) return;
    let cancelled = false;
    const load = () => {
      setLoading(true);
      setError(null);
      setExpandedWeek(null);
      setPaymentMethod("CASH");
      setRemarks("");
      getLoanCollection(loanId, scope)
        .then((c) => {
          if (!cancelled) applyCollection(c);
        })
        .catch((err) => {
          console.error(err);
          if (!cancelled) setError("Could not load the payment schedule.");
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, loanId, scope]);

  // Display-only preview of which weeks the entered amount would cover
  // (oldest first) — the server does the actual allocation.
  const preview = (() => {
    if (!data) return null;
    let left = Number(amount) || 0;
    if (left <= 0) return null;
    const full: number[] = [];
    let partial: number | null = null;
    for (const w of data.weeks) {
      if (w.pending <= 0 || left <= 0) continue;
      if (left >= w.pending) {
        full.push(w.week);
        left = Math.round((left - w.pending) * 100) / 100;
      } else {
        partial = w.week;
        left = 0;
      }
    }
    return { full, partial };
  })();

  const unit = data?.loan.paymentFrequency === "MONTHLY" ? "Month" : "Week";

  const handleCollect = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !loanId) return;

    const value = Number(amount);
    if (!(value > 0)) {
      toast.error("Enter an amount greater than zero.");
      return;
    }
    if (value > data.summary.totalOutstanding) {
      toast.error(`Amount exceeds the total outstanding of ${formatCurrency(data.summary.totalOutstanding)}.`);
      return;
    }

    setSubmitting(true);
    try {
      const { collection, message } = await collectMyLoanPayment(loanId, {
        amount: value,
        paymentMethod,
        remarks: remarks || undefined,
      });
      toast.success(message);
      applyCollection(collection);
      setRemarks("");
      onCollected?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not collect payment."));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReceipt = async (paymentId: string) => {
    try {
      await downloadMyReceipt(paymentId);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not download receipt."));
    }
  };

  return (
    <ViewModalShell
      open={open}
      onClose={onClose}
      title={scope === "partner" ? "Weekly Collection" : "Payment Schedule"}
      maxWidth="max-w-5xl"
    >
      {loading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-16 bg-[#ECE9DF] rounded-xl" />
          <div className="h-24 bg-[#ECE9DF] rounded-xl" />
          <div className="h-48 bg-[#ECE9DF] rounded-xl" />
        </div>
      ) : error || !data ? (
        <div className="p-6 text-center text-sm text-[#E31E24]">{error ?? "Loan not found."}</div>
      ) : (
        <>
          <ViewModalSummary
            initials={data.loan.customer.name
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase()}
            avatarBg="#FAECE7"
            avatarColor="#E31E24"
            name={data.loan.customer.name}
            badge={<LoanStatusBadge status={data.loan.status} />}
            subtitle={`${data.loan.loanNumber} · ${data.loan.customer.customerCode} · ${formatCurrency(
              data.loan.installmentAmount
            )} per ${unit.toLowerCase()}`}
          />

          <div className="p-6 space-y-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <SummaryCard
                label="Total due now"
                value={formatCurrency(data.summary.dueNow)}
                hint={
                  data.summary.overdue > 0
                    ? `Includes ${formatCurrency(data.summary.overdue)} carried forward`
                    : "Nothing carried forward"
                }
                tone={data.summary.dueNow > 0 ? "due" : "good"}
              />
              <SummaryCard
                label="Pending from earlier weeks"
                value={formatCurrency(data.summary.overdue)}
                tone={data.summary.overdue > 0 ? "warn" : "default"}
              />
              <SummaryCard
                label="Total outstanding"
                value={formatCurrency(data.summary.totalOutstanding)}
                hint={
                  data.summary.nextDue
                    ? `Next: ${unit} ${data.summary.nextDue.week} · ${formatDate(data.summary.nextDue.dueDate)}`
                    : undefined
                }
              />
              <SummaryCard label="Paid so far" value={formatCurrency(data.summary.totalPaid)} tone="good" />
            </div>

            {canCollect && (
              <form
                onSubmit={handleCollect}
                className="rounded-xl border border-[#E5E7EB] bg-[#F8FAFC] p-4 space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-[#6B6A62] mb-1">Amount collected *</label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      required
                      className="w-full rounded-lg border border-[#9C9A8D] bg-white px-3 py-2 text-sm text-[#1A1A18]"
                    />
                  </div>
                  <SelectField
                    label="Payment method"
                    name="paymentMethod"
                    value={paymentMethod}
                    onChange={(_, v) => setPaymentMethod(v as PaymentMethod)}
                    required
                    options={[
                      { value: "CASH", label: "Cash" },
                      { value: "UPI", label: "UPI" },
                      { value: "BANK_TRANSFER", label: "Bank transfer" },
                    ]}
                  />
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
                    >
                      {submitting ? "Collecting..." : `Collect ${formatCurrency(Number(amount) || 0)}`}
                    </button>
                  </div>
                </div>
                <TextareaField label="Remarks" name="remarks" value={remarks} onChange={(_, v) => setRemarks(v)} rows={2} />
                {preview && (preview.full.length > 0 || preview.partial !== null) && (
                  <p className="text-xs text-[#45443E]">
                    {preview.full.length > 0 && (
                      <>
                        Settles {unit.toLowerCase()}
                        {preview.full.length > 1 ? "s" : ""} <b>{preview.full.join(", ")}</b>
                      </>
                    )}
                    {preview.full.length > 0 && preview.partial !== null && " · "}
                    {preview.partial !== null && (
                      <>
                        Part-pays {unit.toLowerCase()} <b>{preview.partial}</b> (the rest carries forward)
                      </>
                    )}
                  </p>
                )}
              </form>
            )}

            {scope === "partner" && !data.summary.canCollect && data.summary.totalOutstanding > 0 && (
              <p className="text-xs text-[#854F0B] bg-[#FAEEDA]/60 rounded-lg px-3 py-2">
                Payments can be collected once the loan is approved.
              </p>
            )}

            <div>
              <h3 className="text-sm font-semibold text-[#1A1A18] mb-2">Payment history</h3>
              <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
                <table className="w-full min-w-215 text-sm">
                  <thead>
                    <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
                      <th className="py-2 px-3 font-medium">{unit}</th>
                      <th className="py-2 px-3 font-medium">Due date</th>
                      <th className="py-2 px-3 font-medium text-right">Original due</th>
                      <th className="py-2 px-3 font-medium text-right">Paid</th>
                      <th className="py-2 px-3 font-medium text-right">Pending</th>
                      <th className="py-2 px-3 font-medium text-right">Collection due</th>
                      <th className="py-2 px-3 font-medium">Payment date</th>
                      <th className="py-2 px-3 font-medium">Status</th>
                      <th className="py-2 px-3 w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {data.weeks.map((w) => {
                      const isPaid = w.status === "PAID";
                      const expanded = expandedWeek === w.week;
                      return (
                        <Fragment key={w.scheduleId}>
                          <tr
                            onClick={() => setExpandedWeek(expanded ? null : w.week)}
                            className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] cursor-pointer"
                          >
                            <td className="py-2.5 px-3 font-medium text-[#1A1A18]">
                              {unit} {w.week}
                            </td>
                            <td className="py-2.5 px-3 text-[#45443E]">{formatDate(w.dueDate)}</td>
                            <td className="py-2.5 px-3 text-right text-[#1A1A18]">
                              {formatCurrency(w.originalDue)}
                              {w.penalty > 0 && (
                                <p className="text-[11px] text-[#854F0B]">+ {formatCurrency(w.penalty)} penalty</p>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-right text-[#3B6D11]">{formatCurrency(w.paid)}</td>
                            <td className={`py-2.5 px-3 text-right ${w.pending > 0 ? "text-[#E31E24]" : "text-[#45443E]"}`}>
                              {formatCurrency(w.pending)}
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isPaid ? (
                                <span className="text-[#9C9A8D]">—</span>
                              ) : (
                                <>
                                  <span className="font-semibold text-[#1A1A18]">{formatCurrency(w.collectionDue)}</span>
                                  {w.previousPending > 0 && (
                                    <p className="text-[11px] text-[#6B6A62]">
                                      incl. {formatCurrency(w.previousPending)} carried
                                    </p>
                                  )}
                                </>
                              )}
                            </td>
                            <td className="py-2.5 px-3 text-[#45443E]">
                              {w.paymentDate ? formatDate(w.paymentDate) : "—"}
                            </td>
                            <td className="py-2.5 px-3">
                              <span
                                className="text-[11px] font-semibold px-2 py-1 rounded-md"
                                style={
                                  isPaid
                                    ? { backgroundColor: "#EAF3DE", color: "#3B6D11" }
                                    : { backgroundColor: "#FCE4E4", color: "#E31E24" }
                                }
                              >
                                {w.status}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-[#9C9A8D]">
                              {w.payments.length > 0 && (
                                <ChevronDown size={14} className={`transition-transform ${expanded ? "rotate-180" : ""}`} />
                              )}
                            </td>
                          </tr>
                          {expanded && (
                            <tr className="bg-[#F8FAFC] border-b border-[#E5E7EB]">
                              <td colSpan={9} className="px-6 py-3">
                                {w.payments.length === 0 ? (
                                  <p className="text-xs text-[#6B6A62]">No payments recorded for this {unit.toLowerCase()} yet.</p>
                                ) : (
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr className="text-left text-[#6B6A62]">
                                        <th className="py-1 font-medium">Receipt</th>
                                        <th className="py-1 font-medium">Paid on</th>
                                        <th className="py-1 font-medium">Method</th>
                                        <th className="py-1 font-medium text-right">Installment</th>
                                        <th className="py-1 font-medium text-right">Penalty</th>
                                        <th className="py-1 font-medium text-right">Total</th>
                                        {scope === "partner" && <th className="py-1 w-8" />}
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {w.payments.map((p) => (
                                        <tr key={p.id} className="text-[#1A1A18]">
                                          <td className="py-1">{p.receiptNumber}</td>
                                          <td className="py-1">{p.paidAt ? formatDate(p.paidAt) : "—"}</td>
                                          <td className="py-1">{p.paymentMethod.replace("_", " ")}</td>
                                          <td className="py-1 text-right">{formatCurrency(p.amount)}</td>
                                          <td className="py-1 text-right">{formatCurrency(p.penalty)}</td>
                                          <td className="py-1 text-right font-semibold">{formatCurrency(p.totalReceived)}</td>
                                          {scope === "partner" && (
                                            <td className="py-1 text-right">
                                              <button
                                                type="button"
                                                onClick={() => handleReceipt(p.id)}
                                                aria-label={`Download receipt ${p.receiptNumber}`}
                                                className="text-[#185FA5] hover:text-[#1A1A18]"
                                              >
                                                <Download size={13} />
                                              </button>
                                            </td>
                                          )}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                )}
                              </td>
                            </tr>
                          )}
                        </Fragment>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </ViewModalShell>
  );
}
