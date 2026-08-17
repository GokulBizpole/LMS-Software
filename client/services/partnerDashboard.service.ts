// services/partnerDashboard.service.ts
import api from "@/lib/axios";
import type {
  PartnerDashboardData,
  PartnerDashboardResponse,
} from "@/types/partnerDashboard";

export async function getMyDashboardData(): Promise<PartnerDashboardData> {
  const { data } = await api.get<PartnerDashboardResponse>(
    "/partners/me/dashboard"
  );

  if (!data.success) {
    throw new Error("Failed to load dashboard data");
  }

  return data.data;
}
