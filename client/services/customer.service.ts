// services/customer.service.ts
import api from "@/lib/axios";
import type { Customer, CustomerListResponse } from "@/types/customer";

export interface GetCustomersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getCustomers(
  params: GetCustomersParams = {}
): Promise<CustomerListResponse> {
  const { data } = await api.get<CustomerListResponse>("/customers", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load customers");
  }

  return data;
}

export interface CustomerDetailResponse {
  success: boolean;
  customer: Customer;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data } = await api.get<CustomerDetailResponse>(`/customers/${id}`);

  if (!data.success) {
    throw new Error("Failed to load customer");
  }

  return data.customer;
}