// services/partnerPayment.service.ts
import api from "@/lib/axios";
import type { Payment, PaymentListResponse } from "@/types/payment";

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
): Promise<Payment> {
  const { data } = await api.post<CreateMyPaymentResponse>(
    "/partners/me/payments",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to collect payment");
  }

  return data.data;
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
