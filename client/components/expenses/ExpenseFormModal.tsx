// components/expenses/ExpenseFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { SelectField, TextareaField, TextField } from "@/components/ui/FormField";
import { createExpense, type CreateExpenseData } from "@/services/expense.service";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory } from "@/types/expense";

interface FormState {
  partnerId: string;
  category: ExpenseCategory;
  amount: string;
  description: string;
  expenseDate: string;
}

const initialForm: FormState = {
  partnerId: "",
  category: "OFFICE",
  amount: "",
  description: "",
  expenseDate: new Date().toISOString().slice(0, 10),
};

export default function ExpenseFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (expense: Expense) => void;
}) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    setForm(initialForm);
    getPartners({ limit: 100 })
      .then((res) => setPartners(res.partners))
      .catch(() => setPartners([]));
  }, [open]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!form.partnerId) {
      setError("Please select a partner.");
      return;
    }

    setSubmitting(true);
    try {
      const payload: CreateExpenseData = {
        partnerId: form.partnerId,
        category: form.category,
        amount: Number(form.amount) || 0,
        description: form.description || undefined,
        expenseDate: form.expenseDate,
      };

      const created = await createExpense(payload);
      onSaved(created);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not create expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add expense"
      subtitle="Record a new business expense."
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="expense-form"
            disabled={submitting}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save expense"}
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

      <form id="expense-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <SelectField
            label="Partner"
            name="partnerId"
            value={form.partnerId}
            onChange={handleChange}
            required
            placeholder="Select partner"
            options={partners.map((p) => ({ value: p.id, label: `${p.partnerCode} · ${p.name}` }))}
          />
          <SelectField
            label="Category"
            name="category"
            value={form.category}
            onChange={handleChange}
            required
            options={EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c }))}
          />
          <TextField
            label="Amount"
            name="amount"
            value={form.amount}
            onChange={handleChange}
            required
            type="number"
          />
          <TextField
            label="Expense date"
            name="expenseDate"
            value={form.expenseDate}
            onChange={handleChange}
            required
            type="date"
          />
          <TextareaField
            label="Description"
            name="description"
            value={form.description}
            onChange={handleChange}
            colSpan="sm:col-span-2"
          />
        </div>
      </form>
    </Modal>
  );
}
