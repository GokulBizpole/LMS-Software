// services/dashboard.service.ts
import api from "@/lib/axios";
import type { DashboardData, DashboardResponse } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const { data } = await api.get<DashboardResponse>("/dashboard");

  if (!data.success) {
    throw new Error("Failed to load dashboard data");
  }

  return data.data;
}