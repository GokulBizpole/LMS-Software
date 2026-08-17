// services/partnerProfile.service.ts
import api from "@/lib/axios";
import type { Partner } from "@/types/partner";

interface MyProfileResponse {
  success: boolean;
  data: Partner;
}

export async function getMyProfile(): Promise<Partner> {
  const { data } = await api.get<MyProfileResponse>("/partners/me");

  if (!data.success) {
    throw new Error("Failed to load profile");
  }

  return data.data;
}

export interface UpdateMyProfileData {
  name?: string;
  phone?: string;
  address?: string;
}

interface UpdateMyProfileResponse {
  success: boolean;
  message: string;
  data: Partner;
}

export async function updateMyProfile(
  payload: UpdateMyProfileData
): Promise<Partner> {
  const { data } = await api.put<UpdateMyProfileResponse>(
    "/partners/me",
    payload
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to update profile");
  }

  return data.data;
}

export async function changeMyPassword(
  currentPassword: string,
  newPassword: string
): Promise<void> {
  const { data } = await api.put<{ success: boolean; message: string }>(
    "/partners/me/password",
    { currentPassword, newPassword }
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to change password");
  }
}
