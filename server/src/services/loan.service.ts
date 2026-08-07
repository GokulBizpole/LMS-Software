import prisma from "../config/db";
import { createAuditLog } from "./audit.service";

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

  const endDate = new Date(data.startDate);

  if (data.paymentFrequency === "MONTHLY") {
    endDate.setMonth(endDate.getMonth() + data.duration);
  } else {
    endDate.setDate(endDate.getDate() + data.duration * 7);
  }

const loan = await prisma.loan.create({
  data: {
    ...data,
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



const schedules: {
  loanId: string;
  installmentNo: number;
  dueDate: Date;
  amount: number;
  penalty: number;
  isPaid: boolean;
}[] = [];

for (let i = 1; i <= data.duration; i++) {
  const dueDate = new Date(data.startDate);

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

export const getAllLoans = async (
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
    : {};

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

  return closedLoan;
};

export const approveLoanById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status === "APPROVED") {
    throw new Error("Loan already approved");
  }

  if (loan.status === "REJECTED") {
    throw new Error("Rejected loan cannot be approved");
  }

  const approvedLoan = await prisma.loan.update({
    where: { id },
    data: {
      status: "APPROVED",
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

  return approvedLoan;
};

export const rejectLoanById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const loan = await prisma.loan.findUnique({
    where: { id },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  if (loan.status === "REJECTED") {
    throw new Error("Loan already rejected");
  }

  if (loan.status === "APPROVED") {
    throw new Error("Approved loan cannot be rejected");
  }

  const rejectedLoan = await prisma.loan.update({
    where: { id },
    data: {
      status: "REJECTED",
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

  return rejectedLoan;
};