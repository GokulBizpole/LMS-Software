// components/tables/AdminExpenseTable.tsx
// Admin Expenses list page only — standardized checkbox column, dot category
// badge, hover row. Kept separate from tables/ExpenseTable.tsx, which stays
// untouched for its other call site (admin reports/expenses).
//
// No row-click-to-view: there's no per-expense view destination. "Delete"
// is real functionality (unchanged: same confirm dialog, same service call).
"use client";

import { Fragment, useState } from "react";
import type { Expense, ExpenseCategory } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import { deleteExpense } from "@/services/expense.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import StatusDot from "@/components/ui/StatusDot";

const CATEGORY_STYLE: Record<ExpenseCategory, string> = {
  OFFICE: "#185FA5",
  SALARY: "#3B6D11",
  PETROL: "#854F0B",
  ELECTRICITY: "#993C1D",
  RENT: "#534AB7",
  OTHER: "#6B6A62",
};

export default function AdminExpenseTable({
  expenses,
  onChanged,
}: {
  expenses: Expense[];
  onChanged?: () => void;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const toast = useToast();

  const handleDelete = async () => {
    if (!confirmingId) return;
    const id = confirmingId;
    try {
      setDeletingId(id);
      const { message } = await deleteExpense(id);
      toast.success(message);
      setConfirmingId(null);
      onChanged?.();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not delete expense. Please try again."));
      setConfirmingId(null);
    } finally {
      setDeletingId(null);
    }
  };

  const confirmDialog = (
    <ConfirmDialog
      open={confirmingId !== null}
      onClose={() => setConfirmingId(null)}
      onConfirm={handleDelete}
      title="Delete expense"
      message="Delete this expense? This cannot be undone."
      confirming={deletingId !== null}
    />
  );

  if (expenses.length === 0) {
    return (
      <Fragment>
        {confirmDialog}
        <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
          No expenses found.
        </div>
      </Fragment>
    );
  }

  const allSelected = expenses.every((e) => selected.has(e.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(expenses.map((e) => e.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <Fragment>
      {confirmDialog}
      <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
              <th className="py-2 px-4 w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  onChange={toggleAll}
                  className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                  aria-label="Select all expenses"
                />
              </th>
              <th className="py-2 px-4 font-medium">Date</th>
              <th className="py-2 px-4 font-medium">Category</th>
              <th className="py-2 px-4 font-medium">Partner</th>
              <th className="py-2 px-4 font-medium">Description</th>
              <th className="py-2 px-4 font-medium text-right">Amount</th>
              <th className="py-2 px-4 font-medium text-right">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {expenses.map((e) => (
              <tr key={e.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors">
                <td className="py-3 px-4" onClick={(ev) => ev.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(e.id)}
                    onChange={() => toggleOne(e.id)}
                    className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    aria-label={`Select expense on ${formatDate(e.expenseDate)}`}
                  />
                </td>
                <td className="py-3 px-4 text-[#45443E]">{formatDate(e.expenseDate)}</td>
                <td className="py-3 px-4">
                  <StatusDot color={CATEGORY_STYLE[e.category] ?? CATEGORY_STYLE.OTHER} label={e.category} />
                </td>
                <td className="py-3 px-4 text-[#1A1A18]">
                  {e.partner ? `${e.partner.partnerCode} · ${e.partner.name}` : "—"}
                </td>
                <td className="py-3 px-4 text-[#45443E] max-w-60 truncate">
                  {e.description || "—"}
                </td>
                <td className="py-3 px-4 text-[#1A1A18] font-medium text-right">{formatCurrency(e.amount)}</td>
                <td className="py-3 px-4 text-right">
                  <button
                    onClick={() => setConfirmingId(e.id)}
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
    </Fragment>
  );
}
