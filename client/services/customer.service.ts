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
  data: Customer;
}

export async function getCustomerById(id: string): Promise<Customer> {
  const { data } = await api.get<CustomerDetailResponse>(`/customers/${id}`);

  if (!data.success) {
    throw new Error("Failed to load customer");
  }

  return data.data;
}

export interface CreateCustomerData {
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

export interface CreateCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export async function createCustomer(
  payload: CreateCustomerData
): Promise<Customer> {
  const { data } = await api.post<CreateCustomerResponse>(
    "/customers",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to create customer");
  }

  return data.data;
}

export interface UpdateCustomerData {
  name?: string;
  phone?: string;
  alternatePhone?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  status?: Customer["status"];
}

export interface UpdateCustomerResponse {
  success: boolean;
  message: string;
  data: Customer;
}

export async function updateCustomer(
  id: string,
  payload: UpdateCustomerData
): Promise<Customer> {
  const { data } = await api.put<UpdateCustomerResponse>(
    `/customers/${id}`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update customer");
  }

  return data.data;
}