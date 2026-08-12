// services/report.service.ts
import api from "@/lib/axios";
import type { PartnerFinancials, ProfitLossSummary } from "@/types/report";

export interface ProfitLossResponse {
  success: boolean;
  data: ProfitLossSummary;
}

export async function getProfitLossSnapshot(): Promise<ProfitLossSummary> {
  const { data } = await api.get<ProfitLossResponse>("/reports/profit-loss");

  if (!data.success) {
    throw new Error("Failed to load profit & loss report");
  }

  return data.data;
}

export interface PartnerFinancialsResponse {
  success: boolean;
  total: number;
  data: PartnerFinancials[];
}

export async function getPartnerFinancials(): Promise<PartnerFinancials[]> {
  const { data } = await api.get<PartnerFinancialsResponse>("/reports/partner");

  if (!data.success) {
    throw new Error("Failed to load partner report");
  }

  return data.data;
}
