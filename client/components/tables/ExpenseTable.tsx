// components/tables/ExpenseTable.tsx
"use client";

import { useState } from "react";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { deleteExpense } from "@/services/expense.service";

const CATEGORY_STYLES: Record<ExpenseCategory, { bg: string; text: string }> = {
  OFFICE: { bg: "#E6F1FB", text: "#185FA5" },
  SALARY: { bg: "#EAF3DE", text: "#3B6D11" },
  PETROL: { bg: "#FAEEDA", text: "#854F0B" },
  ELECTRICITY: { bg: "#FAECE7", text: "#993C1D" },
  RENT: { bg: "#EEEDFE", text: "#534AB7" },
  OTHER: { bg: "#ECE9DF", text: "#45443E" },
};

function CategoryBadge({ category }: { category: ExpenseCategory }) {
  const c = CATEGORY_STYLES[category] ?? CATEGORY_STYLES.OTHER;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {category}
    </span>
  );
}

export default function ExpenseTable({
  expenses,
  onChanged,
}: {
  expenses: Expense[];
  onChanged?: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Delete this expense? This cannot be undone.")) return;
    try {
      setDeletingId(id);
      await deleteExpense(id);
      onChanged?.();
    } catch (err) {
      console.error(err);
      window.alert("Could not delete expense. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (expenses.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No expenses found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Date</th>
            <th className="py-2 px-4 font-medium">Category</th>
            <th className="py-2 px-4 font-medium">Partner</th>
            <th className="py-2 px-4 font-medium">Description</th>
            <th className="py-2 px-4 font-medium text-right">Amount</th>
            <th className="py-2 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {expenses.map((e) => (
            <tr key={e.id} className="border-b border-[#E5E7EB] last:border-0">
              <td className="py-3 px-4 text-[#45443E]">{formatDate(e.expenseDate)}</td>
              <td className="py-3 px-4"><CategoryBadge category={e.category} /></td>
              <td className="py-3 px-4 text-[#1A1A18]">
                {e.partner ? `${e.partner.partnerCode} · ${e.partner.name}` : "—"}
              </td>
              <td className="py-3 px-4 text-[#45443E] max-w-60 truncate">
                {e.description || "—"}
              </td>
              <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">{formatCurrency(e.amount)}</td>
              <td className="py-3 px-4 text-right">
                <button
                  onClick={() => handleDelete(e.id)}
                  disabled={deletingId === e.id}
                  className="text-[#993C1D] font-medium hover:underline disabled:opacity-50"
                >
                  {deletingId === e.id ? "Deleting..." : "Delete"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
