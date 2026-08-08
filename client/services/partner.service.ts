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
  partner: Partner;
}

export async function getPartnerById(id: string): Promise<Partner> {
  const { data } = await api.get<PartnerDetailResponse>(`/partners/${id}`);

  if (!data.success) {
    throw new Error("Failed to load partner");
  }

  return data.partner;
}