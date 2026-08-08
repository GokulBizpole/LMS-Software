// types/customer.ts

export interface Customer {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
  alternatePhone?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  guarantorName?: string | null;
  guarantorPhone?: string | null;
  status: "ACTIVE" | "CLOSED" | "BLOCKED";
  createdAt: string;
  updatedAt: string;
}

export interface CustomerListResponse {
  success: boolean;
  customers: Customer[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}