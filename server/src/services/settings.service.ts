import prisma from "../config/db";

interface UpdateSettingsPayload {
  companyName: string;
  companyPhone: string;
  companyEmail?: string;
  companyAddress?: string;
  defaultInterestPercentage: number;
  defaultPenaltyPercentage: number;
  receiptPrefix: string;
}

// Get Settings
export const getSettingsService = async () => {
  let settings = await prisma.setting.findFirst();

  
  if (!settings) {
    settings = await prisma.setting.create({
      data: {
        companyName: "LMS Software",
        companyPhone: "",
        companyEmail: "",
        companyAddress: "",
        defaultInterestPercentage: 12,
        defaultPenaltyPercentage: 2,
        receiptPrefix: "RCP",
      },
    });
  }

  return settings;
};

// Update Settings
export const updateSettingsService = async (
  data: UpdateSettingsPayload
) => {
  let settings = await prisma.setting.findFirst();

  if (!settings) {
    settings = await prisma.setting.create({
      data,
    });
  } else {
    settings = await prisma.setting.update({
      where: { id: settings.id },
      data,
    });
  }

  return settings;
};