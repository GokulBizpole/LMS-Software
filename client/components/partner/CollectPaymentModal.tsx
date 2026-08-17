// components/partner/CollectPaymentModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField, SelectField, TextareaField } from "@/components/ui/FormField";
import { createMyPayment, type CreateMyPaymentData } from "@/services/partnerPayment.service";
import { getMyLoans, getMyLoanById } from "@/services/partnerLoan.service";
import { getMyCustomers } from "@/services/partnerCustomer.service";
import type { Customer } from "@/types/customer";
import type { Loan, LoanScheduleEntry } from "@/types/loan";
import type { Payment } from "@/types/payment";
import { formatCurrency } from "@/utils/formatCurrency";

export default function CollectPaymentModal({
  open,
  onClose,
  onSaved,
  initialLoanId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (payment: Payment) => void;
  initialLoanId?: string;
}) {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loans, setLoans] = useState<Loan[]>([]);
  const [customerId, setCustomerId] = useState("");
  const [loanId, setLoanId] = useState(initialLoanId ?? "");
  const [nextInstallment, setNextInstallment] = useState<LoanScheduleEntry | null>(null);
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "UPI" | "BANK_TRANSFER">("CASH");
  const [remarks, setRemarks] = useState("");
  const [loadingLoan, setLoadingLoan] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setCustomerId("");
    setLoanId(initialLoanId ?? "");
    setNextInstallment(null);
    setAmount("");
    setPaymentMethod("CASH");
    setRemarks("");

    getMyCustomers({ limit: 200 })
      .then((res) => setCustomers(res.customers))
      .catch(() => setCustomers([]));

    if (initialLoanId) {
      getMyLoanById(initialLoanId)
        .then((loan) => setCustomerId(loan.customerId))
        .catch(() => {});
    }
  }, [open, initialLoanId]);

  useEffect(() => {
    if (!open || !customerId) {
      setLoans([]);
      return;
    }
    getMyLoans({ customerId, limit: 100 })
      .then((res) =>
        setLoans(res.loans.filter((l) => l.status === "ACTIVE" || l.status === "APPROVED"))
      )
      .catch(() => setLoans([]));
  }, [open, customerId]);

  useEffect(() => {
    if (!open || !loanId) {
      setNextInstallment(null);
      return;
    }
    setLoadingLoan(true);
    getMyLoanById(loanId)
      .then((loan) => {
        const schedules: LoanScheduleEntry[] = loan.schedules ?? [];
        const next = schedules
          .filter((s) => !s.isPaid)
          .sort((a, b) => a.installmentNo - b.installmentNo)[0];
        setNextInstallment(next ?? null);
        setAmount(next ? String(next.amount) : "");
      })
      .catch(() => setNextInstallment(null))
      .finally(() => setLoadingLoan(false));
    // Re-run on every open, not just when loanId's value changes — a
    // pre-selected loan (same id as last time) wouldn't otherwise re-fetch
    // after the reset effect above clears nextInstallment back to null.
  }, [loanId, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!loanId) {
      setError("Please select a loan.");
      return;
    }
    if (!nextInstallment) {
      setError("This loan has no pending installments.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateMyPaymentData = {
        loanId,
        installmentNumber: nextInstallment.installmentNo,
        amount: Number(amount),
        paymentMethod,
        remarks: remarks || undefined,
      };
      const payment = await createMyPayment(payload);
      onSaved(payment);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not collect payment.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Collect payment"
      subtitle="Select the customer and loan, then record the installment payment."
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="partner-collect-payment-form"
            disabled={submitting || !nextInstallment}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Confirming..." : "Confirm payment"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
          >
            Cancel
          </button>
        </div>
      }
    >
      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D] mb-4">
          {error}
        </div>
      )}

      <form id="partner-collect-payment-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SelectField
            label="Customer"
            name="customerId"
            value={customerId}
            onChange={(_, v) => {
              setCustomerId(v);
              setLoanId("");
            }}
            required
            placeholder="Select customer"
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.customerCode} · ${c.name}`,
            }))}
          />
          <SelectField
            label="Loan"
            name="loanId"
            value={loanId}
            onChange={(_, v) => setLoanId(v)}
            required
            placeholder={customerId ? "Select loan" : "Select a customer first"}
            options={loans.map((l) => ({
              value: l.id,
              label: `${l.loanNumber} · ${formatCurrency(l.balanceAmount)} balance`,
            }))}
          />
        </div>

        {loanId && (
          <div className="rounded-lg border border-[#DAD7CA] bg-[#FAFAF7] p-3 text-sm">
            {loadingLoan ? (
              <p className="text-[#6B6A62]">Loading installment details...</p>
            ) : nextInstallment ? (
              <p className="text-[#1A1A18]">
                Next due: installment #{nextInstallment.installmentNo} ·{" "}
                {formatCurrency(nextInstallment.amount)}
              </p>
            ) : (
              <p className="text-[#993C1D]">This loan has no pending installments.</p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TextField
            label="Amount"
            name="amount"
            type="number"
            value={amount}
            onChange={(_, v) => setAmount(v)}
            required
          />
          <SelectField
            label="Payment method"
            name="paymentMethod"
            value={paymentMethod}
            onChange={(_, v) => setPaymentMethod(v as typeof paymentMethod)}
            required
            options={[
              { value: "CASH", label: "Cash" },
              { value: "UPI", label: "UPI" },
              { value: "BANK_TRANSFER", label: "Bank transfer" },
            ]}
          />
        </div>

        <TextareaField label="Remarks" name="remarks" value={remarks} onChange={(_, v) => setRemarks(v)} />
      </form>
    </Modal>
  );
}
