import prisma from "../config/db";
interface CreatePartnerData {
  partnerCode: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  investmentAmount: number;
  currentBalance: number;
}

interface UpdatePartnerData {
  name?: string;
  phone?: string;
  email?: string;
  address?: string;
  investmentAmount?: number;
  currentBalance?: number;
  status?: "ACTIVE" | "INACTIVE";
}

export const createPartner = async (data: CreatePartnerData) => {
  const existingPartner = await prisma.partner.findFirst({
    where: {
      OR: [
        { partnerCode: data.partnerCode },
        { phone: data.phone },
        ...(data.email ? [{ email: data.email }] : []),
      ],
    },
  });

  if (existingPartner) {
    throw new Error("Partner already exists");
  }

  const partner = await prisma.partner.create({
    data,
  });

  return partner;
};

export const getAllPartners = async () => {
  return await prisma.partner.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getPartnerById = async (id: string) => {
  const partner = await prisma.partner.findUnique({
    where: {
      id,
    },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  return partner;
};
export const updatePartnerById = async (
  id: string,
  data: UpdatePartnerData
) => {
  const existingPartner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!existingPartner) {
    throw new Error("Partner not found");
  }

  if (data.phone || data.email) {
    const duplicatePartner = await prisma.partner.findFirst({
      where: {
        id: {
          not: id,
        },
        OR: [
          ...(data.phone ? [{ phone: data.phone }] : []),
          ...(data.email ? [{ email: data.email }] : []),
        ],
      },
    });

    if (duplicatePartner) {
      throw new Error("Phone or email already exists");
    }
  }

  return prisma.partner.update({
    where: { id },
    data,
  });
};

export const deletePartnerById = async (id: string) => {
  const partner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  return prisma.partner.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
  });
};