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
  customerCodePrefix?: string;
  name: string;
  phone: string;
  email?: string;
  password?: string;
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
): Promise<{ data: Partner; message: string }> {
  const { data } = await api.post<CreatePartnerResponse>(
    "/partners",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to create partner");
  }

  return { data: data.data, message: data.message };
}

export interface UpdatePartnerData {
  name?: string;
  phone?: string;
  email?: string;
  password?: string;
  address?: string;
  investmentAmount?: number;
  currentBalance?: number;
  status?: Partner["status"];
  customerCodePrefix?: string;
}

export interface UpdatePartnerResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export async function updatePartner(
  id: string,
  payload: UpdatePartnerData
): Promise<{ data: Partner; message: string }> {
  const { data } = await api.put<UpdatePartnerResponse>(
    `/partners/${id}`,
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update partner");
  }

  return { data: data.data, message: data.message };
}

export interface DeletePartnerResponse {
  success: boolean;
  message: string;
}

export async function deletePartner(id: string): Promise<{ message: string }> {
  const { data } = await api.delete<DeletePartnerResponse>(`/partners/${id}`);

  if (!data.success) {
    throw new Error(data.message || "Failed to delete partner");
  }

  return { message: data.message };
}

export interface PartnerPhotoResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export async function uploadPartnerPhoto(id: string, file: File): Promise<{ data: Partner; message: string }> {
  const formData = new FormData();
  formData.append("photo", file);

  const { data } = await api.post<PartnerPhotoResponse>(
    `/partners/${id}/photo`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to upload profile picture");
  }

  return { data: data.data, message: data.message };
}

export async function removePartnerPhoto(id: string): Promise<{ data: Partner; message: string }> {
  const { data } = await api.delete<PartnerPhotoResponse>(`/partners/${id}/photo`);

  if (!data.success) {
    throw new Error(data.message || "Failed to remove profile picture");
  }

  return { data: data.data, message: data.message };
}

// Builds a fully-qualified URL for a relative file path returned by the server
// (e.g. Partner.profilePicture) — reuses the same convention as document files.
export function partnerFileUrl(relativePath: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api\/?$/, "");
  return `${base}/${relativePath}`;
}