// services/expense.service.ts
import api from "@/lib/axios";
import type { Expense, ExpenseCategory, ExpenseListResponse } from "@/types/expense";

export interface GetExpensesParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: ExpenseCategory;
  partnerId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  order?: "asc" | "desc";
}

export async function getExpenses(
  params: GetExpensesParams = {}
): Promise<ExpenseListResponse> {
  const { data } = await api.get<ExpenseListResponse>("/expenses", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load expenses");
  }

  return data;
}

export interface ExpenseDetailResponse {
  success: boolean;
  data: Expense;
}

export async function getExpenseById(id: string): Promise<Expense> {
  const { data } = await api.get<ExpenseDetailResponse>(`/expenses/${id}`);

  if (!data.success) {
    throw new Error("Failed to load expense");
  }

  return data.data;
}

export interface CreateExpenseData {
  partnerId: string;
  category: ExpenseCategory;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface CreateExpenseResponse {
  success: boolean;
  message: string;
  data: Expense;
}

export async function createExpense(
  payload: CreateExpenseData
): Promise<Expense> {
  const { data } = await api.post<CreateExpenseResponse>(
    "/expenses",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to create expense");
  }

  return data.data;
}

export interface DeleteExpenseResponse {
  success: boolean;
  message: string;
}

export async function deleteExpense(id: string): Promise<void> {
  const { data } = await api.delete<DeleteExpenseResponse>(`/expenses/${id}`);

  if (!data.success) {
    throw new Error(data.message || "Failed to delete expense");
  }
}
