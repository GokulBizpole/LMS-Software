// services/partnerReport.service.ts
import api from "@/lib/axios";
import type { Loan } from "@/types/loan";
import type { Payment } from "@/types/payment";

interface ReportListResponse<T> {
  success: boolean;
  total: number;
  data: T[];
}

export interface GetMyLoanReportParams {
  status?: "PENDING" | "APPROVED" | "ACTIVE" | "CLOSED" | "OVERDUE" | "REJECTED";
  from?: string;
  to?: string;
}

export async function getMyLoanReport(
  params: GetMyLoanReportParams = {}
): Promise<Loan[]> {
  const { data } = await api.get<ReportListResponse<Loan>>(
    "/partners/me/reports/loans",
    { params }
  );

  if (!data.success) {
    throw new Error("Failed to load loan report");
  }

  return data.data;
}

export async function getMyCollectionReport(): Promise<Payment[]> {
  const { data } = await api.get<ReportListResponse<Payment>>(
    "/partners/me/reports/collections"
  );

  if (!data.success) {
    throw new Error("Failed to load collection report");
  }

  return data.data;
}

export async function getMyOutstandingReport(): Promise<Loan[]> {
  const { data } = await api.get<ReportListResponse<Loan>>(
    "/partners/me/reports/outstanding"
  );

  if (!data.success) {
    throw new Error("Failed to load outstanding report");
  }

  return data.data;
}
