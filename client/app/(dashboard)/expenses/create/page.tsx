// app/(dashboard)/expenses/create/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createExpense, type CreateExpenseData } from "@/services/expense.service";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { EXPENSE_CATEGORIES, type ExpenseCategory } from "@/types/expense";

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

export default function CreateExpensePage() {
  const router = useRouter();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPartners({ limit: 100 })
      .then((res) => setPartners(res.partners))
      .catch(() => setPartners([]));
  }, []);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
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

      await createExpense(payload);
      router.push("/expenses");
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not create expense.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/expenses" className="text-sm text-[#185FA5]">
        ← Back to expenses
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Add expense</h1>
        <p className="text-sm text-[#5F5E5A]">Record a new business expense.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Expense details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs text-[#888780] mb-1">Partner *</label>
              <select
                value={form.partnerId}
                onChange={(e) => handleChange("partnerId", e.target.value)}
                required
                className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
              >
                <option value="">Select partner</option>
                {partners.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.partnerCode} · {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#888780] mb-1">Category *</label>
              <select
                value={form.category}
                onChange={(e) => handleChange("category", e.target.value)}
                required
                className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
              >
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs text-[#888780] mb-1">Amount *</label>
              <input
                type="number"
                value={form.amount}
                onChange={(e) => handleChange("amount", e.target.value)}
                required
                min="0"
                step="0.01"
                className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#888780] mb-1">Expense date *</label>
              <input
                type="date"
                value={form.expenseDate}
                onChange={(e) => handleChange("expenseDate", e.target.value)}
                required
                className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs text-[#888780] mb-1">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => handleChange("description", e.target.value)}
                rows={3}
                className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save expense"}
          </button>
          <Link
            href="/expenses"
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A] hover:bg-[#F1EFE8]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
