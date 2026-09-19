// services/payment.service.ts
import api from "@/lib/axios";
import type { Payment, PaymentListResponse } from "@/types/payment";

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  period?: "day" | "week" | "month";
  customerId?: string;
}

export async function getPayments(
  params: GetPaymentsParams = {}
): Promise<PaymentListResponse> {
  const { data } = await api.get<PaymentListResponse>("/payments", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load payments");
  }

  return data;
}

export interface PaymentDetailResponse {
  success: boolean;
  data: Payment;
}

export async function getPaymentById(id: string): Promise<Payment> {
  const { data } = await api.get<PaymentDetailResponse>(`/payments/${id}`);

  if (!data.success) {
    throw new Error("Failed to load payment");
  }

  return data.data;
}

// Receipt downloads need the auth header, so a plain <a href> won't work —
// fetch the PDF as a blob (token attached by the axios interceptor) and
// trigger the browser's save flow from the resulting object URL. Mirrors
// downloadMyReceipt in partnerPayment.service.ts for the admin endpoint.
export async function downloadReceipt(paymentId: string): Promise<void> {
  const response = await api.get(`/payments/${paymentId}/receipt`, {
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
