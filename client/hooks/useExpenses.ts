// hooks/useExpenses.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getExpenses } from "@/services/expense.service";
import type { Expense, ExpenseCategory } from "@/types/expense";

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [total, setTotal] = useState(0);
  const [totalAmount, setTotalAmount] = useState<string | number>(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ExpenseCategory | "all">("all");
  const [partnerId, setPartnerId] = useState<string>("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getExpenses({
        page,
        limit: pageSize,
        search,
        category: category === "all" ? undefined : category,
        partnerId: partnerId === "all" ? undefined : partnerId,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      setExpenses(result.expenses);
      setTotal(result.total);
      setTotalAmount(result.totalAmount);
      setTotalPages(result.totalPages);
    } catch (err) {
      console.error(err);
      setError("Could not load expenses. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, search, category, partnerId, startDate, endDate]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [pageSize, search, category, partnerId, startDate, endDate]);

  return {
    expenses,
    total,
    totalAmount,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    category,
    setCategory,
    partnerId,
    setPartnerId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch: load,
  };
}
