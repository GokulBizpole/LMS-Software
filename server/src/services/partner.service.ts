import prisma from "../config/db";
import { createAuditLog } from "./audit.service";

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

// ================= CREATE PARTNER =================

export const createPartner = async (
  data: CreatePartnerData,
  adminId?: string,
  ipAddress?: string
) => {
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

  await createAuditLog({
    adminId,
    action: "CREATE",
    tableName: "PARTNER",
    recordId: partner.id,
    ipAddress,
  });

  return partner;
};

// ================= GET ALL PARTNERS =================

export const getAllPartners = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc"
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            name: {
              contains: search,
            },
          },
          {
            phone: {
              contains: search,
            },
          },
          {
            partnerCode: {
              contains: search,
            },
          },
        ],
      }
    : {};

  const allowedSortFields = [
    "createdAt",
    "name",
    "partnerCode",
    "phone",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const [partners, total] = await Promise.all([
    prisma.partner.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [finalSortBy]: order,
      },
    }),

    prisma.partner.count({
      where,
    }),
  ]);

  return {
    partners,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

// ================= GET PARTNER BY ID =================

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

// ================= UPDATE PARTNER =================

export const updatePartnerById = async (
  id: string,
  data: UpdatePartnerData,
  adminId?: string,
  ipAddress?: string
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

  const partner = await prisma.partner.update({
    where: { id },
    data,
  });

  await createAuditLog({
    adminId,
    action: "UPDATE",
    tableName: "PARTNER",
    recordId: partner.id,
    ipAddress,
  });

  return partner;
};

// ================= DELETE PARTNER (SOFT DELETE) =================

export const deletePartnerById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const partner = await prisma.partner.findUnique({
    where: { id },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  const deletedPartner = await prisma.partner.update({
    where: { id },
    data: {
      status: "INACTIVE",
    },
  });

  await createAuditLog({
    adminId,
    action: "DELETE",
    tableName: "PARTNER",
    recordId: deletedPartner.id,
    ipAddress,
  });

  return deletedPartner;
};