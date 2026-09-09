import fs from "fs";
import path from "path";
import prisma from "../config/db";

interface UpdateSettingsPayload {
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

const DEFAULT_SETTINGS = {
  companyName: "LMS Software",
  companyPhone: "",
  companyEmail: "",
  companyAddress: "",
  defaultInterestPercentage: 12,
  defaultPenaltyPercentage: 2,
  receiptPrefix: "RCP",
};

// Get Settings
export const getSettingsService = async () => {
  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data: DEFAULT_SETTINGS,
    });
  }

  return settings;
};

// Update Settings
export const updateSettingsService = async (
  data: UpdateSettingsPayload
) => {
  let settings = await prisma.setting.findFirst();

  const payload = {
    ...data,
    dateOfIncorporation: data.dateOfIncorporation
      ? new Date(data.dateOfIncorporation)
      : undefined,
  };

  if (!settings) {
    settings = await prisma.setting.create({
      data: { ...DEFAULT_SETTINGS, ...payload },
    });
  } else {
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data: payload,
    });
  }

  return settings;
};

// ================= COMPANY LOGO =================

export const setCompanyLogo = async (relativePath: string) => {
  const settings = await getSettingsService();

  if (settings.companyLogo) {
    try {
      fs.unlinkSync(path.join(process.cwd(), settings.companyLogo));
    } catch {
      // file already gone — nothing to clean up
    }
  }

  return prisma.setting.update({
    where: { id: settings.id },
    data: { companyLogo: relativePath },
  });
};

export const removeCompanyLogo = async () => {
  const settings = await getSettingsService();

  if (settings.companyLogo) {
    try {
      fs.unlinkSync(path.join(process.cwd(), settings.companyLogo));
    } catch {
      // file already gone — nothing to clean up
    }
  }

  return prisma.setting.update({
    where: { id: settings.id },
    data: { companyLogo: null },
  });
};
