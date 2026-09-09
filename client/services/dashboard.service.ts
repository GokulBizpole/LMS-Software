// services/dashboard.service.ts
import api from "@/lib/axios";
import type { DashboardData, DashboardPeriod, DashboardResponse } from "@/types/dashboard";

export async function getDashboardData(period: DashboardPeriod = "month"): Promise<DashboardData> {
  const { data } = await api.get<DashboardResponse>("/dashboard", { params: { period } });

  if (!data.success) {
    throw new Error("Failed to load dashboard data");
  }

  return data.data;
}
