// components/partner/LoanFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField, SelectField, TextareaField } from "@/components/ui/FormField";
import { createMyLoan, type CreateMyLoanData } from "@/services/partnerLoan.service";
import { getMyCustomers } from "@/services/partnerCustomer.service";
import type { Customer } from "@/types/customer";
import type { Loan } from "@/types/loan";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
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
    setError(null);

    if (!form.customerId) {
      setError("Please select a customer.");
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
      const loan = await createMyLoan(payload);
      onSaved(loan);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not submit loan.");
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
            disabled={submitting}
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
      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D] mb-4">
          {error}
        </div>
      )}

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
