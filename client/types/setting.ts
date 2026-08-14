// types/setting.ts

export interface Setting {
  id: string;
  companyName: string;
  companyPhone: string;
  companyEmail?: string | null;
  companyAddress?: string | null;
  defaultInterestPercentage: string | number;
  defaultPenaltyPercentage: string | number;
  receiptPrefix: string;
  createdAt: string;
  updatedAt: string;
}

export interface SettingResponse {
  success: boolean;
  data: Setting;
}

export interface UpdateSettingData {
  companyName: string;
  companyPhone: string;
  companyEmail?: string;
  companyAddress?: string;
  defaultInterestPercentage: number;
  defaultPenaltyPercentage: number;
  receiptPrefix: string;
}
