import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import {
  notifyLoanSubmitted,
  notifyLoanApproved,
  notifyLoanRejected,
  notifyLoanClosed,
} from "./notification.service";
import { emitPartnerActivity } from "./realtimeEvents.service";

export const generateLoanNumber = async () => {
  const count = await prisma.loan.count();
  return "LN" + String(count + 1).padStart(6, "0");
};

// ================= ONE-ACTIVE-LOAN RULE =================
// A customer may have only one open loan. The one exception: when that loan
// has MAX_CARRY_OVER_WEEKS or fewer weeks left in its schedule, a new loan is
// allowed, and whatever is still payable on the old loan is deducted from the
// new loan's requested amount. The old loan itself is left untouched and is
// paid off through the normal payment flow.

export const MAX_CARRY_OVER_WEEKS = 3;

const OPEN_LOAN_STATUSES = ["PENDING", "APPROVED", "ACTIVE", "OVERDUE"] as const;

export const ACTIVE_LOAN_ERROR = "Customer already has an active loan.";

const round2 = (n: number) => Math.round(n * 100) / 100;

export interface LoanEligibility {
  eligible: boolean;
  reason?: string;
  maxCarryOverWeeks: number;
  existingLoan: {
    id: string;
    loanNumber: string;
    status: string;
    paymentFrequency: "WEEKLY" | "MONTHLY";
    totalInstallments: number;
    paidInstallments: number;
    remainingInstallments: number;
    remainingWeeks: number;
    // Unpaid installment amounts plus any penalties already applied to them.
    remainingPayable: number;
  } | null;
}

export const getLoanEligibility = async (customerId: string): Promise<LoanEligibility> => {
  const openLoans = await prisma.loan.findMany({
    where: { customerId, status: { in: [...OPEN_LOAN_STATUSES] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      loanNumber: true,
      status: true,
      paymentFrequency: true,
      totalInstallments: true,
      schedules: {
        where: { isPaid: false },
        select: { amount: true, penalty: true },
      },
    },
  });

  if (openLoans.length === 0) {
    return { eligible: true, maxCarryOverWeeks: MAX_CARRY_OVER_WEEKS, existingLoan: null };
  }

  const loan = openLoans[0];
  const remainingInstallments = loan.schedules.length;
  // Remaining time is read from the schedule: one weekly installment = one
  // week; a monthly installment is counted as 4 weeks (the shortest month),
  // so a monthly loan only qualifies once fully paid.
  const remainingWeeks =
    loan.paymentFrequency === "WEEKLY" ? remainingInstallments : remainingInstallments * 4;
  const remainingPayable = round2(
    loan.schedules.reduce((sum, s) => sum + Number(s.amount) + Number(s.penalty), 0)
  );

  const existingLoan = {
    id: loan.id,
    loanNumber: loan.loanNumber,
    status: loan.status,
    paymentFrequency: loan.paymentFrequency,
    totalInstallments: loan.totalInstallments,
    paidInstallments: loan.totalInstallments - remainingInstallments,
    remainingInstallments,
    remainingWeeks,
    remainingPayable,
  };

  // More than one open loan (e.g. a carry-over loan is already pending) or
  // more than 3 weeks left: no new loan.
  if (openLoans.length > 1 || remainingWeeks > MAX_CARRY_OVER_WEEKS) {
    return {
      eligible: false,
      reason: ACTIVE_LOAN_ERROR,
      maxCarryOverWeeks: MAX_CARRY_OVER_WEEKS,
      existingLoan,
    };
  }

  return { eligible: true, maxCarryOverWeeks: MAX_CARRY_OVER_WEEKS, existingLoan };
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

  // One-active-loan rule (source of truth for every create path).
  const eligibility = await getLoanEligibility(data.customerId);

  if (!eligibility.eligible) {
    throw new Error(eligibility.reason ?? ACTIVE_LOAN_ERROR);
  }

  // In the final-weeks exception, the amount still payable on the old loan
  // is deducted from the requested amount; the rest of the calculation and
  // the schedule below then run on the reduced principal as usual.
  const carryOver = eligibility.existingLoan;
  const requestedAmount = Number(data.principalAmount);
  let principalAmount = requestedAmount;

  if (carryOver) {
    principalAmount = round2(requestedAmount - carryOver.remainingPayable);

    if (principalAmount <= 0) {
      throw new Error(
        `Requested amount must be more than ₹${carryOver.remainingPayable} still payable on loan ${carryOver.loanNumber}.`
      );
    }
  }

  // Interest
  const interestAmount =
    (principalAmount * data.interestPercentage) / 100;

  const totalPayable =
    principalAmount + interestAmount;

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
    principalAmount,
    // Always set explicitly so these can't be supplied via the request body.
    requestedAmount: carryOver ? requestedAmount : null,
    previousLoanDeduction: carryOver ? carryOver.remainingPayable : null,
    previousLoanId: carryOver ? carryOver.id : null,
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

// Real-time push to any connected Admin Electron app — only for a genuine
// partner self-service submission (never when admin created the loan).
if (!adminId) {
  emitPartnerActivity({
    type: "loan_created",
    partnerName: partner.name,
    customerName: customer.name,
  });
}

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