// types/expense.ts

export type ExpenseCategory =
  | "OFFICE"
  | "SALARY"
  | "PETROL"
  | "ELECTRICITY"
  | "RENT"
  | "OTHER";

export interface ExpensePartnerRef {
  partnerCode: string;
  name: string;
}

export interface Expense {
  id: string;
  partnerId: string;
  partner: ExpensePartnerRef;
  category: ExpenseCategory;
  amount: string | number;
  description?: string | null;
  expenseDate: string;
  createdAt: string;
}

export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "OFFICE",
  "SALARY",
  "PETROL",
  "ELECTRICITY",
  "RENT",
  "OTHER",
];

export interface ExpenseListResponse {
  success: boolean;
  expenses: Expense[];
  total: number;
  totalAmount: string | number;
  page: number;
  limit: number;
  totalPages: number;
}
