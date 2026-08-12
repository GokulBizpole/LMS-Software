// services/partner.service.ts
import api from "@/lib/axios";
import type { Partner, PartnerListResponse } from "@/types/partner";

export interface GetPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function getPartners(
  params: GetPartnersParams = {}
): Promise<PartnerListResponse> {
  const { data } = await api.get<PartnerListResponse>("/partners", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load partners");
  }

  return data;
}

export interface PartnerDetailResponse {
  success: boolean;
  data: Partner;
}

export async function getPartnerById(id: string): Promise<Partner> {
  const { data } = await api.get<PartnerDetailResponse>(`/partners/${id}`);

  if (!data.success) {
    throw new Error("Failed to load partner");
  }

  return data.data;
}

export interface CreatePartnerData {
  partnerCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  investmentAmount: number;
  currentBalance: number;
}

export interface CreatePartnerResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export async function createPartner(
  payload: CreatePartnerData
): Promise<Partner> {
  const { data } = await api.post<CreatePartnerResponse>(
    "/partners",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to create partner");
  }

  return data.data;
}

export interface UpdatePartnerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  investmentAmount?: number;
  currentBalance?: number;
  status?: Partner["status"];
}

export interface UpdatePartnerResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export async function updatePartner(
  id: string,
  payload: UpdatePartnerData
): Promise<Partner> {
  const { data } = await api.put<UpdatePartnerResponse>(
    `/partners/${id}`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update partner");
  }

  return data.data;
}