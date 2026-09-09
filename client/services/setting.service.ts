// services/setting.service.ts
import api from "@/lib/axios";
import type { Setting, SettingResponse, UpdateSettingData } from "@/types/setting";

export async function getSettings(): Promise<Setting> {
  const { data } = await api.get<SettingResponse>("/settings");

  if (!data.success) {
    throw new Error("Failed to load settings");
  }

  return data.data;
}

interface UpdateSettingResponse extends SettingResponse {
  message?: string;
}

export async function updateSettings(
  payload: UpdateSettingData
): Promise<{ data: Setting; message: string }> {
  const { data } = await api.put<UpdateSettingResponse>("/settings", payload);

  if (!data.success) {
    throw new Error("Failed to update settings");
  }

  return { data: data.data, message: data.message || "Settings saved." };
}

export async function uploadCompanyLogo(file: File): Promise<{ data: Setting; message: string }> {
  const formData = new FormData();
  formData.append("logo", file);

  const { data } = await api.post<UpdateSettingResponse>("/settings/logo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  if (!data.success) {
    throw new Error(data.message || "Failed to upload logo");
  }

  return { data: data.data, message: data.message || "Logo uploaded." };
}

export async function removeCompanyLogo(): Promise<{ data: Setting; message: string }> {
  const { data } = await api.delete<UpdateSettingResponse>("/settings/logo");

  if (!data.success) {
    throw new Error(data.message || "Failed to remove logo");
  }

  return { data: data.data, message: data.message || "Logo removed." };
}

// Builds a fully-qualified URL for a relative file path returned by the
// server (e.g. Setting.companyLogo) — same convention used for partner
// photos and customer documents.
export function settingsFileUrl(relativePath: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api\/?$/, "");
  return `${base}/${relativePath}`;
}
