// components/partner/LoanFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField, SelectField, TextareaField } from "@/components/ui/FormField";
import {
  createMyLoan,
  getMyCustomerLoanEligibility,
  type CreateMyLoanData,
} from "@/services/partnerLoan.service";
import { getMyCustomers } from "@/services/partnerCustomer.service";
import { StatusBadge as LoanStatusBadge } from "@/components/tables/LoanTable";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { notifyDesktop } from "@/utils/electronNotify";
import { formatCurrency } from "@/utils/formatCurrency";
import type { Customer } from "@/types/customer";
import type { Loan, LoanEligibility } from "@/types/loan";

interface FormState {
  customerId: string;
  principalAmount: string;
  interestPercentage: string;
  paymentFrequency: "WEEKLY" | "MONTHLY";
  duration: string;
  startDate: string;
  remarks: string;
}

const today = () => new Date().toISOString().slice(0, 10);

const emptyForm = (customerId = ""): FormState => ({
  customerId,
  principalAmount: "",
  interestPercentage: "",
  paymentFrequency: "MONTHLY",
  duration: "",
  startDate: today(),
  remarks: "",
});

export default function LoanFormModal({
  open,
  onClose,
  onSaved,
  initialCustomerId,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (loan: Loan) => void;
  initialCustomerId?: string;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  // Preview of the server's one-active-loan rule for the selected customer.
  // Display only — the API re-checks and applies it on submit.
  const [eligibility, setEligibility] = useState<LoanEligibility | null>(null);
  const [eligibilityLoading, setEligibilityLoading] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open || !form.customerId) {
      const clear = () => setEligibility(null);
      clear();
      return;
    }
    let cancelled = false;
    const load = () => {
      setEligibilityLoading(true);
      getMyCustomerLoanEligibility(form.customerId)
        .then((res) => {
          if (!cancelled) setEligibility(res);
        })
        .catch(() => {
          if (!cancelled) setEligibility(null);
        })
        .finally(() => {
          if (!cancelled) setEligibilityLoading(false);
        });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, form.customerId]);

  const existingLoan = eligibility?.existingLoan ?? null;
  const blocked = eligibility !== null && !eligibility.eligible;
  const requestedAmount = Number(form.principalAmount) || 0;
  const newLoanAmount =
    existingLoan && eligibility?.eligible
      ? Math.round((requestedAmount - existingLoan.remainingPayable) * 100) / 100
      : null;

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm(initialCustomerId));
    getMyCustomers({ limit: 200 })
      .then((res) => setCustomers(res.customers))
      .catch(() => setCustomers([]));
  }, [open, initialCustomerId]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.customerId) {
      toast.error("Please select a customer.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateMyLoanData = {
        customerId: form.customerId,
        principalAmount: Number(form.principalAmount),
        interestPercentage: Number(form.interestPercentage),
        paymentFrequency: form.paymentFrequency,
        duration: Number(form.duration),
        startDate: form.startDate,
        remarks: form.remarks || undefined,
      };
      const { data: loan, message } = await createMyLoan(payload);
      toast.success(message);
      const customerName = customers.find((c) => c.id === form.customerId)?.name ?? loan.customer?.name;
      if (customerName) {
        notifyDesktop("LMS Finance", `Partner created a new loan for ${customerName}`);
      }
      onSaved(loan);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Could not submit loan."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="New loan application"
      subtitle="Submitted loans go to Admin for review before they become active."
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="partner-loan-form"
            disabled={submitting || blocked || eligibilityLoading}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Submitting..." : "Submit loan"}
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
      <form id="partner-loan-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SelectField
            label="Customer"
            name="customerId"
            value={form.customerId}
            onChange={handleChange}
            required
            placeholder="Select customer"
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.customerCode} · ${c.name}`,
            }))}
          />
          <TextField
            label="Principal amount"
            name="principalAmount"
            type="number"
            value={form.principalAmount}
            onChange={handleChange}
            required
          />
          <TextField
            label="Interest percentage"
            name="interestPercentage"
            type="number"
            value={form.interestPercentage}
            onChange={handleChange}
            required
          />
          <SelectField
            label="Payment frequency"
            name="paymentFrequency"
            value={form.paymentFrequency}
            onChange={handleChange}
            required
            options={[
              { value: "MONTHLY", label: "Monthly" },
              { value: "WEEKLY", label: "Weekly" },
            ]}
          />
          <TextField
            label={form.paymentFrequency === "MONTHLY" ? "Duration (months)" : "Duration (weeks)"}
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            required
          />
          <TextField
            label="Start date"
            name="startDate"
            type="date"
            value={form.startDate}
            onChange={handleChange}
            required
          />
        </div>

        {form.customerId && eligibilityLoading && (
          <div className="h-16 bg-[#ECE9DF] rounded-xl animate-pulse" />
        )}

        {!eligibilityLoading && existingLoan && (
          <div
            className={`rounded-xl border p-4 space-y-3 ${
              blocked ? "border-[#E31E24]/40 bg-[#FCE4E4]/60" : "border-[#854F0B]/30 bg-[#FAEEDA]/60"
            }`}
          >
            <p className={`text-sm font-semibold ${blocked ? "text-[#E31E24]" : "text-[#854F0B]"}`}>
              {blocked
                ? eligibility?.reason ?? "Customer already has an active loan."
                : `Existing loan is in its final ${eligibility?.maxCarryOverWeeks} weeks — the remaining amount will be deducted from this loan.`}
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Existing loan</p>
                <p className="font-semibold text-[#1A1A18]">{existingLoan.loanNumber}</p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Status</p>
                <LoanStatusBadge status={existingLoan.status} />
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Remaining weeks</p>
                <p className="font-semibold text-[#1A1A18]">
                  {existingLoan.remainingWeeks}
                  <span className="font-normal text-xs text-[#6B6A62]">
                    {" "}
                    ({existingLoan.paidInstallments}/{existingLoan.totalInstallments} paid)
                  </span>
                </p>
              </div>
              <div>
                <p className="text-xs text-[#6B6A62] mb-1">Remaining amount</p>
                <p className="font-semibold text-[#1A1A18]">{formatCurrency(existingLoan.remainingPayable)}</p>
              </div>
            </div>

            {newLoanAmount !== null && (
              <div className="rounded-lg bg-white border border-[#E5E7EB] px-3 py-2.5 text-sm flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="text-[#6B6A62]">Requested {formatCurrency(requestedAmount)}</span>
                <span className="text-[#6B6A62]">− remaining {formatCurrency(existingLoan.remainingPayable)}</span>
                <span className="text-[#6B6A62]">=</span>
                <span className={`font-bold ${newLoanAmount > 0 ? "text-[#3B6D11]" : "text-[#E31E24]"}`}>
                  New loan amount {formatCurrency(Math.max(newLoanAmount, 0))}
                </span>
                {requestedAmount > 0 && newLoanAmount <= 0 && (
                  <span className="w-full text-xs text-[#E31E24]">
                    Requested amount must be more than the remaining amount.
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <TextareaField
          label="Remarks"
          name="remarks"
          value={form.remarks}
          onChange={handleChange}
        />
      </form>
    </Modal>
  );
}
