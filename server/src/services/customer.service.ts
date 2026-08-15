import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import { notifyCustomerCreated } from "./notification.service";

interface CreateCustomerData {
  customerCode: string;
  name: string;
  phone: string;
  alternatePhone?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guarantorName?: string;
  guarantorPhone?: string;
}

interface UpdateCustomerData {
  name?: string;
  phone?: string;
  alternatePhone?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  guarantorName?: string;
  guarantorPhone?: string;
  status?: "ACTIVE" | "CLOSED" | "BLOCKED";
}

export const createCustomer = async (
  data: CreateCustomerData,
  adminId?: string,
  ipAddress?: string
) => {
  const existingCustomer = await prisma.customer.findFirst({
    where: {
      OR: [
        { customerCode: data.customerCode },
        { phone: data.phone },
        ...(data.aadhaarNumber
          ? [{ aadhaarNumber: data.aadhaarNumber }]
          : []),
        ...(data.panNumber
          ? [{ panNumber: data.panNumber }]
          : []),
      ],
    },
  });

  if (existingCustomer) {
    throw new Error("Customer already exists");
  }

  const customer = await prisma.customer.create({
  data,
});

await createAuditLog({
  adminId,
  action: "CREATE",
  tableName: "CUSTOMER",
  recordId: customer.id,
  ipAddress,
});

await notifyCustomerCreated(customer);

return customer;
};
export const getAllCustomers = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc"
) => {
  const skip = (page - 1) * limit;

  // const where = search
  //   ? {
  //       OR: [
  //         {
  //           name: {
  //             contains: search,
  //             mode: "insensitive" as const,
  //           },
  //         },
  //         {
  //           phone: {
  //             contains: search,
  //           },
  //         },
  //         {
  //           customerCode: {
  //             contains: search,
  //           },
  //         },
  //       ],
  //     }
  //   : {};

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      // where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.customer.count({
      // where,
    }),
  ]);

  return {
    customers,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return customer;
};
export const updateCustomerById = async (
  id: string,
  data: UpdateCustomerData,
  adminId?: string,
  ipAddress?: string
) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const updatedCustomer = await prisma.customer.update({
    where: { id },
    data,
  });

  await createAuditLog({
    adminId,
    action: "UPDATE",
    tableName: "CUSTOMER",
    recordId: customer.id,
    ipAddress,
  });

  return updatedCustomer;
};


export const deleteCustomerById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const deletedCustomer = await prisma.customer.update({
    where: { id },
    data: {
      status: "BLOCKED",
    },
  });

  await createAuditLog({
    adminId,
    action: "DELETE",
    tableName: "CUSTOMER",
    recordId: customer.id,
    ipAddress,
  });

  return deletedCustomer;
};
