import prisma from "../config/db";

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
  data: CreateCustomerData
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

  return prisma.customer.create({
    data,
  });
};
export const getAllCustomers = async () => {
  return await prisma.customer.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
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
  data: UpdateCustomerData
) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.customer.update({
    where: { id },
    data,
  });
};

export const deleteCustomerById = async (id: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.customer.update({
    where: { id },
    data: {
      status: "BLOCKED",
    },
  });
};