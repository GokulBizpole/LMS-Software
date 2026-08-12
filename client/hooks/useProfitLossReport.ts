// hooks/useProfitLossReport.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getProfitLossSnapshot } from "@/services/report.service";
import { getExpenses } from "@/services/expense.service";
import { getPayments } from "@/services/payment.service";
import { getLoans } from "@/services/loan.service";
import type { ProfitLossSummary } from "@/types/report";

function inRange(dateStr: string, start: string, end: string) {
  const d = new Date(dateStr).getTime();
  if (start && d < new Date(start).getTime()) return false;
  if (end && d > new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
}

export function useProfitLossReport() {
  const [summary, setSummary] = useState<ProfitLossSummary | null>(null);
  const [mode, setMode] = useState<"snapshot" | "range">("snapshot");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      if (!startDate || !endDate) {
        setMode("snapshot");
        const data = await getProfitLossSnapshot();
        setSummary(data);
        return;
      }

      setMode("range");

      const [expenseResult, paymentResult, loanResult] = await Promise.all([
        getExpenses({ startDate, endDate, limit: 1000 }),
        getPayments({ limit: 1000 }),
        getLoans({ limit: 1000 }),
      ]);

      const totalExpense = Number(expenseResult.totalAmount) || 0;

      const totalCollection = paymentResult.payments
        .filter((p) => (p.paidAt ? inRange(p.paidAt, startDate, endDate) : false))
        .reduce((sum, p) => sum + Number(p.totalReceived), 0);

      const totalLoanAmount = loanResult.loans
        .filter((l) => inRange(l.createdAt, startDate, endDate))
        .reduce((sum, l) => sum + Number(l.principalAmount), 0);

      const outstandingAmount = loanResult.loans.reduce(
        (sum, l) => sum + Number(l.balanceAmount),
        0
      );

      setSummary({
        totalLoanAmount,
        totalCollection,
        totalExpense,
        outstandingAmount,
        netProfit: totalCollection - totalExpense,
      });
    } catch (err) {
      console.error(err);
      setError("Could not load the profit & loss report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  const clearRange = () => {
    setStartDate("");
    setEndDate("");
  };

  return {
    summary,
    mode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    clearRange,
    loading,
    error,
    refetch: load,
  };
}
