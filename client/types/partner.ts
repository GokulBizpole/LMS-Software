// types/partner.ts

export interface Partner {
  id: string;
  partnerCode: string;
  name: string;
  phone: string;
  email: string;
  password: string | null;
  address?: string | null;
  investmentAmount: string | number;
  currentBalance: string | number;
  status: "ACTIVE" | "INACTIVE";
  createdAt: string;
  updatedAt: string;
}

export interface PartnerListResponse {
  success: boolean;
  partners: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}