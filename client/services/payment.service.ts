// services/payment.service.ts
import api from "@/lib/axios";
import type { Payment, PaymentListResponse } from "@/types/payment";

export interface GetPaymentsParams {
  page?: number;
  limit?: number;
  search?: string;
  period?: "day" | "week" | "month";
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
