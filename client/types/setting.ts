// types/setting.ts

export interface Setting {
  id: string;
  companyName: string;
  companyPhone: string;
  companyEmail?: string | null;
  companyAddress?: string | null;
  website?: string | null;
  currency: string;
  receiptPrefix: string;

  businessType?: string | null;
  registrationNumber?: string | null;
  gstin?: string | null;
  pan?: string | null;
  rbiLicenseNumber?: string | null;
  dateOfIncorporation?: string | null;

  defaultInterestPercentage: string | number;
  defaultPenaltyPercentage: string | number;
  financialYearStartMonth: number;
  latePaymentGraceDays: number;

  branchName?: string | null;
  branchCode?: string | null;
  branchManager?: string | null;
  branchPhone?: string | null;

  bankAccountHolderName?: string | null;
  bankName?: string | null;
  bankAccountNumber?: string | null;
  bankIfscCode?: string | null;
  bankBranchName?: string | null;
  upiId?: string | null;

  companyLogo?: string | null;
  themeColor?: string | null;

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
  website?: string;
  currency?: string;
  receiptPrefix: string;

  businessType?: string;
  registrationNumber?: string;
  gstin?: string;
  pan?: string;
  rbiLicenseNumber?: string;
  dateOfIncorporation?: string;

  defaultInterestPercentage: number;
  defaultPenaltyPercentage: number;
  financialYearStartMonth?: number;
  latePaymentGraceDays?: number;

  branchName?: string;
  branchCode?: string;
  branchManager?: string;
  branchPhone?: string;

  bankAccountHolderName?: string;
  bankName?: string;
  bankAccountNumber?: string;
  bankIfscCode?: string;
  bankBranchName?: string;
  upiId?: string;

  themeColor?: string;
}

export const CURRENCY_OPTIONS = [
  { value: "INR", label: "INR (₹)" },
  { value: "USD", label: "USD ($)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
];

export const MONTH_OPTIONS = [
  { value: 1, label: "January" },
  { value: 2, label: "February" },
  { value: 3, label: "March" },
  { value: 4, label: "April" },
  { value: 5, label: "May" },
  { value: 6, label: "June" },
  { value: 7, label: "July" },
  { value: 8, label: "August" },
  { value: 9, label: "September" },
  { value: 10, label: "October" },
  { value: 11, label: "November" },
  { value: 12, label: "December" },
];

export const THEME_COLOR_OPTIONS = [
  "#0E6B4F",
  "#1A1A18",
  "#185FA5",
  "#993C1D",
  "#534AB7",
];
