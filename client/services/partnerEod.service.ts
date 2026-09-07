// services/partnerEod.service.ts — partner self-service EOD endpoints
import api from "@/lib/axios";
import type { EodPreview, EodReport } from "@/types/eod";
import type { ExpenseCategory } from "@/types/expense";

interface EodPreviewResponse {
  success: boolean;
  data: EodPreview;
}

export async function getMyEodPreview(date: string): Promise<EodPreview> {
  const { data } = await api.get<EodPreviewResponse>("/partners/me/eod/preview", {
    params: { date },
  });

  if (!data.success) {
    throw new Error("Failed to load EOD preview");
  }

  return data.data;
}

export interface SubmitEodExpense {
  category: ExpenseCategory;
  amount: number;
  description?: string;
}

export interface SubmitEodData {
  reportDate: string;
  expenses: SubmitEodExpense[];
}

interface SubmitEodResponse {
  success: boolean;
  message: string;
  data: EodReport;
}

export async function submitMyEod(payload: SubmitEodData): Promise<{ data: EodReport; message: string }> {
  const { data } = await api.post<SubmitEodResponse>("/partners/me/eod", payload);

  if (!data.success) {
    throw new Error(data.message || "Failed to submit EOD report");
  }

  return { data: data.data, message: data.message };
}
