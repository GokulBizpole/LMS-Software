// types/eod.ts
import type { ExpenseCategory } from "./expense";

export type EodStatus = "PENDING" | "REJECTED" | "CLOSED";

export interface EodExpense {
  id: string;
  eodReportId: string;
  category: ExpenseCategory;
  amount: string | number;
  description?: string | null;
  createdAt: string;
}

export interface EodPartnerRef {
  id?: string;
  partnerCode: string;
  name: string;
}

export interface EodReport {
  id: string;
  partnerId: string;
  partner: EodPartnerRef;
  reportDate: string;
  totalCollection: string | number;
  totalExpenses: string | number;
  netRemittance: string | number;
  status: EodStatus;
  rejectionReason?: string | null;
  approvedBy?: string | null;
  approvedAt?: string | null;
  expenses: EodExpense[];
  createdAt: string;
  updatedAt: string;
}

export interface EodReportListResponse {
  success: boolean;
  reports: EodReport[];
  total: number;
  totalCollection: string | number;
  totalExpenses: string | number;
  totalNetRemittance: string | number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EodPreview {
  reportDate: string;
  totalCollection: number;
  existing: EodReport | null;
}
