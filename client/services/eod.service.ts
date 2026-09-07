// services/eod.service.ts — admin-facing EOD report endpoints
import api from "@/lib/axios";
import type { EodReport, EodReportListResponse } from "@/types/eod";

export interface GetEodReportsParams {
  page?: number;
  limit?: number;
  partnerId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export async function getEodReports(
  params: GetEodReportsParams = {}
): Promise<EodReportListResponse> {
  const { data } = await api.get<EodReportListResponse>("/eod", { params });

  if (!data.success) {
    throw new Error("Failed to load EOD reports");
  }

  return data;
}

interface EodDetailResponse {
  success: boolean;
  data: EodReport;
}

export async function getEodReportById(id: string): Promise<EodReport> {
  const { data } = await api.get<EodDetailResponse>(`/eod/${id}`);

  if (!data.success) {
    throw new Error("Failed to load EOD report");
  }

  return data.data;
}

interface EodActionResponse {
  success: boolean;
  message: string;
  data: EodReport;
}

export async function approveEodReport(id: string): Promise<EodReport> {
  const { data } = await api.patch<EodActionResponse>(`/eod/${id}/approve`);

  if (!data.success) {
    throw new Error(data.message || "Failed to approve EOD report");
  }

  return data.data;
}

export async function rejectEodReport(id: string, reason: string): Promise<EodReport> {
  const { data } = await api.patch<EodActionResponse>(`/eod/${id}/reject`, { reason });

  if (!data.success) {
    throw new Error(data.message || "Failed to reject EOD report");
  }

  return data.data;
}
