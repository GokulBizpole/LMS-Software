// hooks/useRecentActivity.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getPayments } from "@/services/payment.service";
import { getExpenses } from "@/services/expense.service";

export interface RecentActivityItem {
  id: string;
  type: "PAYMENT" | "EXPENSE";
  description: string;
  date: string;
  debit: number;
  credit: number;
}

export function useRecentActivity() {
  const [items, setItems] = useState<RecentActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [paymentsResult, expensesResult] = await Promise.all([
        getPayments({ limit: 10 }),
        getExpenses({ limit: 10 }),
      ]);

      const paymentItems: RecentActivityItem[] = paymentsResult.payments.map((p) => ({
        id: `payment-${p.id}`,
        type: "PAYMENT",
        description: `Receipt ${p.receiptNumber} · ${p.loan.customer.name}`,
        date: p.paidAt || p.createdAt,
        debit: 0,
        credit: Number(p.totalReceived),
      }));

      const expenseItems: RecentActivityItem[] = expensesResult.expenses.map((e) => ({
        id: `expense-${e.id}`,
        type: "EXPENSE",
        description: e.description || e.category,
        date: e.expenseDate,
        debit: Number(e.amount),
        credit: 0,
      }));

      const merged = [...paymentItems, ...expenseItems]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10);

      setItems(merged);
    } catch (err) {
      console.error(err);
      setError("Could not load recent activity. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { items, loading, error, refetch: load };
}
