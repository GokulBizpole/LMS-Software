// services/loan.service.ts
import api from "@/lib/axios";
import type { Loan, LoanListResponse } from "@/types/loan";

export interface GetLoansParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  partnerId?: string;
  customerId?: string;
}

export async function getLoans(
  params: GetLoansParams = {}
): Promise<LoanListResponse> {
  const { data } = await api.get<LoanListResponse>("/loans", { params });

  if (!data.success) {
    throw new Error("Failed to load loans");
  }

  return data;
}

export interface LoanDetailResponse {
  success: boolean;
  data: Loan;
}

export async function getLoanById(id: string): Promise<Loan> {
  const { data } = await api.get<LoanDetailResponse>(`/loans/${id}`);

  if (!data.success) {
    throw new Error("Failed to load loan");
  }

  return data.data;
}

export interface LoanActionResponse {
  success: boolean;
  message: string;
  data: Loan;
}

export async function approveLoan(id: string): Promise<Loan> {
  const { data } = await api.patch<LoanActionResponse>(
    `/loans/${id}/approve`
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to approve loan");
  }

  return data.data;
}

export async function rejectLoan(id: string, reason: string): Promise<Loan> {
  const { data } = await api.patch<LoanActionResponse>(
    `/loans/${id}/reject`,
    { reason }
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to reject loan");
  }

  return data.data;
}
