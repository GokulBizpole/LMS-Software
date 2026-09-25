// services/partnerPayment.service.ts
import api from "@/lib/axios";
import type { Payment, PaymentListResponse } from "@/types/payment";
import type { LoanCollection } from "@/types/collection";

export interface GetMyPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  period?: "day" | "week" | "month";
}

export async function getMyPayments(
  params: GetMyPaymentsParams = {}
): Promise<PaymentListResponse> {
  const { data } = await api.get<PaymentListResponse>("/partners/me/payments", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load payments");
  }

  return data;
}

export interface CreateMyPaymentData {
  loanId: string;
  installmentNumber: number;
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  remarks?: string;
}

interface CreateMyPaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export async function createMyPayment(
  payload: CreateMyPaymentData
): Promise<{ data: Payment; message: string }> {
  const { data } = await api.post<CreateMyPaymentResponse>(
    "/partners/me/payments",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to collect payment");
  }

  return { data: data.data, message: data.message };
}

// Week-by-week history + due now for a loan. `scope` picks the partner's
// own endpoint or the admin's read-only one.
export async function getLoanCollection(
  loanId: string,
  scope: "admin" | "partner"
): Promise<LoanCollection> {
  const url =
    scope === "admin" ? `/loans/${loanId}/collection` : `/partners/me/loans/${loanId}/collection`;
  const { data } = await api.get<{ success: boolean; data: LoanCollection }>(url);

  if (!data.success) {
    throw new Error("Failed to load payment schedule");
  }

  return data.data;
}

export interface CollectMyLoanPaymentData {
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  remarks?: string;
}

// Collects any amount up to the outstanding total; the server applies it to
// the oldest unpaid weeks and returns the refreshed history.
export async function collectMyLoanPayment(
  loanId: string,
  payload: CollectMyLoanPaymentData
): Promise<{ collection: LoanCollection; message: string }> {
  const { data } = await api.post<{
    success: boolean;
    message: string;
    data: { collection: LoanCollection };
  }>(`/partners/me/loans/${loanId}/collect`, payload);

  if (!data.success) {
    throw new Error(data.message || "Failed to collect payment");
  }

  return { collection: data.data.collection, message: data.message };
}

// Receipt downloads need the auth header, so a plain <a href> won't work —
// fetch the PDF as a blob (token attached by the axios interceptor) and
// trigger the browser's save flow from the resulting object URL.
export async function downloadMyReceipt(paymentId: string): Promise<void> {
  const response = await api.get(`/partners/me/payments/${paymentId}/receipt`, {
    responseType: "blob",
  });

  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement("a");
  link.href = url;
  link.download = `receipt-${paymentId}.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}
