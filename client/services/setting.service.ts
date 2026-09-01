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
