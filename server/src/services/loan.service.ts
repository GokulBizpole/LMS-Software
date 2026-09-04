import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import {
  notifyLoanSubmitted,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyLoanClosed,
} from "./notification.service";

export const generateLoanNumber = async () => {
  const count = await prisma.loan.count();
  return "LN" + String(count + 1).padStart(6, "0");
};

interface CreateLoanData {
  loanNumber: string;
  customerId: string;
  partnerId: string;

  principalAmount: number;

  interestPercentage: number;

  paymentFrequency: "WEEKLY" | "MONTHLY";

  duration: number;

  startDate: Date;

  remarks?: string;
}

export const createLoan = async (
  data: CreateLoanData,
  adminId?: string,
  ipAddress?: string
) => {
  // Customer exists?
  const customer = await prisma.customer.findUnique({
    where: {
      id: data.customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  // Partner exists?
  const partner = await prisma.partner.findUnique({
    where: {
      id: data.partnerId,
    },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  // Loan Number duplicate?
  const existingLoan = await prisma.loan.findUnique({
    where: {
      loanNumber: data.loanNumber,
    },
  });

  if (existingLoan) {
    throw new Error("Loan number already exists");
  }

  // Interest
  const interestAmount =
    (data.principalAmount * data.interestPercentage) / 100;

  const totalPayable =
    data.principalAmount + interestAmount;

  const installmentAmount =
    totalPayable / data.duration;

  // data.startDate arrives as a plain "YYYY-MM-DD" string from the request
  // body (the `Date` type above is aspirational, not enforced at runtime) —
  // Prisma's DateTime fields reject that without an explicit conversion.
  const startDate = new Date(data.startDate);

  const endDate = new Date(startDate);

  if (data.paymentFrequency === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + data.duration);
  } else {
    endDate.setDate(endDate.getDate() + data.duration * 7);
  }

const loan = await prisma.loan.create({
  data: {
    ...data,
    startDate,
    interestAmount,
    totalPayable,
    balanceAmount: totalPayable,
    installmentAmount,
    totalInstallments: data.duration,
    endDate,
  },
});

await createAuditLog({
  adminId,
  action: "CREATE",
  tableName: "LOAN",
  recordId: loan.id,
  ipAddress,
});

await notifyLoanSubmitted(
  { id: loan.id, loanNumber: loan.loanNumber, principalAmount: Number(loan.principalAmount) },
  partner,
  customer
);

const schedules: {
  loanId: string;
  installmentNo: number;
  dueDate: Date;
  amount: number;
  penalty: number;
  isPaid: boolean;
}[] = [];

for (let i = 1; i <= data.duration; i++) {
  const dueDate = new Date(startDate);

  if (data.paymentFrequency === "MONTHLY") {
    dueDate.setMonth(dueDate.getMonth() + i);
  } else {
    dueDate.setDate(dueDate.getDate() + i * 7);
  }

  schedules.push({
    loanId: loan.id,
    installmentNo: i,
    dueDate,
    amount: installmentAmount,
    penalty: 0,
    isPaid: false,
  });
}


await prisma.loanSchedule.createMany({
  data: schedules,
});
return {
  ...loan,
  scheduleCount: schedules.length,
};}

interface GetAllLoansFilters {
  status?: "PENDING" | "APPROVED" | "ACTIVE" | "CLOSED" | "OVERDUE" | "REJECTED";
  partnerId?: string;
  customerId?: string;
}

export const getAllLoans = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "createdAt",
  order: "asc" | "desc" = "desc",
  filters: GetAllLoansFilters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.partnerId ? { partnerId: filters.partnerId } : {}),
    ...(filters.customerId ? { customerId: filters.customerId } : {}),
    ...(search
      ? {
          OR: [
            {
              loanNumber: {
                contains: search,
              },
            },
            {
              customer: {
                name: {
                  contains: search,
                },
              },
            },
            {
              partner: {
                name: {
                  contains: search,
                },
              },
            },
          ],
        }
      : {}),
  };

  const allowedSortFields = [
    "createdAt",
    "loanNumber",
    "principalAmount",
    "balanceAmount",
    "startDate",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "createdAt";

  const [loans, total] = await Promise.all([
    prisma.loan.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [finalSortBy]: order,
      },
      include: {
        customer: {
          select: {
            customerCode: true,
            name: true,
            phone: true,
          },
        },
        partner: {
          select: {
            partnerCode: true,
            name: true,
          },
        },
      },
    }),

    prisma.loan.count({
      where,
    }),
  ]);

  return {
    loans,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getLoanById = async (id: string) => {
  const loan = await prisma.loan.findUnique({
    where: {
      id,
    },
    include: {
      customer: true,
      partner: true,
      schedules: {
        orderBy: {
          installmentNo: "asc",
        },
      },
      payments: {
        orderBy: {
          paidAt: "desc",
        },
      },
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  return loan;
};

interface UpdateLoanData {
  remarks?: string;
  penaltyPercentage?: number;
  penaltyAmount?: number;
  status?: "PENDING" | "APPROVED" | "ACTIVE" | "CLOSED" | "OVERDUE" | "REJECTED";
}

export const updateLoanById = async (
  id: string,
  data: UpdateLoanData,
  adminId?: string,
  ipAddress?: string
) => {
  const existingLoan = await prisma.loan.findUnique({
    where: { id },
  });

  if (!existingLoan) {
    throw new Error("Loan not found");
  }

  const loan = await prisma.loan.update({
    where: { id },
    data,
  });

  await createAuditLog({
    adminId,
    action: "UPDATE",
    tableName: "LOAN",
    recordId: loan.id,
    ipAddress,
  });

  return loan;
};

export const closeLoanById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (Number(loan.balanceAmount) > 0) {
    throw new Error(
      `Loan cannot be closed. Pending balance: ${loan.balanceAmount}`
    );
  }

  const closedLoan = await prisma.loan.update({
    where: { id },
    data: {
      status: "CLOSED",
    },
  });

  await createAuditLog({
    adminId,
    action: "CLOSE",
    tableName: "LOAN",
    recordId: closedLoan.id,
    ipAddress,
  });

  await notifyLoanClosed(closedLoan, loan.customer);

  return closedLoan;
};

export const approveLoanById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "PENDING") {
    throw new Error(`Loan is already ${loan.status.toLowerCase()} and cannot be approved`);
  }

  const approvedLoan = await prisma.loan.update({
    where: { id },
    data: {
      status: "ACTIVE",
      approvedBy: adminId,
      approvedAt: new Date(),
    },
  });

  await createAuditLog({
    adminId,
    action: "APPROVE",
    tableName: "LOAN",
    recordId: approvedLoan.id,
    ipAddress,
  });

  await notifyLoanApproved(approvedLoan, loan.customer);

  return approvedLoan;
};

export const rejectLoanById = async (
  id: string,
  reason: string,
  adminId?: string,
  ipAddress?: string
) => {
  if (!reason || !reason.trim()) {
    throw new Error("Rejection reason is required");
  }

  const loan = await prisma.loan.findUnique({
    where: { id },
    include: { customer: true },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status !== "PENDING") {
    throw new Error(`Loan is already ${loan.status.toLowerCase()} and cannot be rejected`);
  }

  const rejectedLoan = await prisma.loan.update({
    where: { id },
    data: {
      status: "REJECTED",
      rejectionReason: reason,
      approvedBy: adminId,
      approvedAt: new Date(),
    },
  });

  await createAuditLog({
    adminId,
    action: "REJECT",
    tableName: "LOAN",
    recordId: rejectedLoan.id,
    ipAddress,
  });

  await notifyLoanRejected(rejectedLoan, loan.customer, reason);

  return rejectedLoan;
};