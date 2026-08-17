// services/partnerLoan.service.ts
import api from "@/lib/axios";
import type { Loan, LoanListResponse } from "@/types/loan";

export interface GetMyLoansParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  customerId?: string;
}

export async function getMyLoans(
  params: GetMyLoansParams = {}
): Promise<LoanListResponse> {
  const { data } = await api.get<LoanListResponse>("/partners/me/loans", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load loans");
  }

  return data;
}

interface MyLoanDetailResponse {
  success: boolean;
  data: Loan;
}

export async function getMyLoanById(id: string): Promise<Loan> {
  const { data } = await api.get<MyLoanDetailResponse>(
    `/partners/me/loans/${id}`
  );

  if (!data.success) {
    throw new Error("Failed to load loan");
  }

  return data.data;
}

export interface CreateMyLoanData {
  customerId: string;
  principalAmount: number;
  interestPercentage: number;
  paymentFrequency: "WEEKLY" | "MONTHLY";
  duration: number;
  startDate: string;
  remarks?: string;
}

interface CreateMyLoanResponse {
  success: boolean;
  message: string;
  data: Loan;
}

export async function createMyLoan(payload: CreateMyLoanData): Promise<Loan> {
  const { data } = await api.post<CreateMyLoanResponse>(
    "/partners/me/loans",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to submit loan");
  }

  return data.data;
}
