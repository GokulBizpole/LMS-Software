// services/partnerCustomer.service.ts
import api from "@/lib/axios";
import type { Customer, CustomerListResponse } from "@/types/customer";
import type { Loan, LoanListResponse } from "@/types/loan";
import type { Payment, PaymentListResponse } from "@/types/payment";

export interface GetMyCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
}

export async function getMyCustomers(
  params: GetMyCustomersParams = {}
): Promise<CustomerListResponse> {
  const { data } = await api.get<CustomerListResponse>("/partners/me/customers", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load customers");
  }

  return data;
}

export interface CreateMyCustomerData {
  customerCode: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guarantorName?: string;
  guarantorPhone?: string;
}

interface CreateMyCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export async function createMyCustomer(
  payload: CreateMyCustomerData
): Promise<Customer> {
  const { data } = await api.post<CreateMyCustomerResponse>(
    "/partners/me/customers",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to create customer");
  }

  return data.data;
}

interface MyCustomerDetailResponse {
  success: boolean;
  data: Customer;
}

export async function getMyCustomerById(id: string): Promise<Customer> {
  const { data } = await api.get<MyCustomerDetailResponse>(
    `/partners/me/customers/${id}`
  );

  if (!data.success) {
    throw new Error("Failed to load customer");
  }

  return data.data;
}

export async function getMyCustomerLoans(id: string): Promise<Loan[]> {
  const { data } = await api.get<LoanListResponse>(
    `/partners/me/customers/${id}/loans`
  );

  if (!data.success) {
    throw new Error("Failed to load loan history");
  }

  return data.loans;
}

export async function getMyCustomerPayments(id: string): Promise<Payment[]> {
  const { data } = await api.get<PaymentListResponse>(
    `/partners/me/customers/${id}/payments`
  );

  if (!data.success) {
    throw new Error("Failed to load payment history");
  }

  return data.payments;
}
