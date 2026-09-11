import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import { notifyCustomerCreated } from "./notification.service";

interface CreateCustomerData {
  // Required unless partnerId is set, in which case the code is generated
  // from the partner's own prefix + sequence and this field is ignored.
  customerCode?: string;
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
  partnerId?: string;
}

// Claims the next customer code for a partner atomically (single UPDATE ...
// SET nextCustomerSeq = nextCustomerSeq + 1), so concurrent creates by the
// same partner never collide and a deleted customer's number is never
// reused, since the counter only ever increases.
const generateCustomerCodeForPartner = async (partnerId: string) => {
  const partner = await prisma.partner.update({
    where: { id: partnerId },
    data: { nextCustomerSeq: { increment: 1 } },
  });

  if (!partner.customerCodePrefix) {
    throw new Error(
      "This partner has no customer code prefix set. Ask an admin to set one before adding customers."
    );
  }

  const claimedSeq = partner.nextCustomerSeq - 1;
  return `${partner.customerCodePrefix}CUS${String(claimedSeq).padStart(3, "0")}`;
};

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
  // Partner-created customers always get an auto-generated code from their
  // partner's prefix + sequence; a manually-typed customerCode is only used
  // when there's no partner (the admin's own customer-creation form).
  const customerCode = data.partnerId
    ? await generateCustomerCodeForPartner(data.partnerId)
    : data.customerCode;

  if (!customerCode) {
    throw new Error("Customer code is required");
  }

  const existingCustomer = await prisma.customer.findFirst({
    where: {
      status: "ACTIVE",
      OR: [
        { customerCode },
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
    data: {
      customerCode,
      name: data.name,
      phone: data.phone,
      alternatePhone: data.alternatePhone,
      aadhaarNumber: data.aadhaarNumber,
      panNumber: data.panNumber,
      address: data.address,
      city: data.city,
      state: data.state,
      pincode: data.pincode,
      guarantorName: data.guarantorName,
      guarantorPhone: data.guarantorPhone,
      partnerId: data.partnerId,
    },
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
interface GetAllCustomersFilters {
  partnerId?: string;
}

export const getAllCustomers = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc",
  filters: GetAllCustomersFilters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.partnerId ? { partnerId: filters.partnerId } : {}),
    ...(search
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
              customerCode: {
                contains: search,
              },
            },
          ],
        }
      : {}),
  };

  const allowedSortFields = ["createdAt", "name", "customerCode"];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const [customers, total] = await Promise.all([
    prisma.customer.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [finalSortBy]: order,
      },
    }),

    prisma.customer.count({
      where,
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
