import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import { notifyPaymentReceived, notifyLoanClosed } from "./notification.service";

interface CreatePaymentData {
  loanId: string;
  installmentNumber: number;
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  remarks?: string;
}


export const createPayment = async (
  data: CreatePaymentData,
  adminId?: string,
  ipAddress?: string
) => {

  
  const loan = await prisma.loan.findUnique({
  where: {
    id: data.loanId,
  },
  include: { customer: true },
});

if (!loan) {
  throw new Error("Loan not found");
}

// 👇 ADD THIS
if (loan.status !== "APPROVED" && loan.status !== "ACTIVE") {
  throw new Error(
    "Loan must be approved before collecting payment"
  );
}
  

  if (!loan) {
    throw new Error("Loan not found");
  }

  const schedule = await prisma.loanSchedule.findFirst({
    where: {
      loanId: data.loanId,
      installmentNo: data.installmentNumber,
    },
  });

  if (!schedule) {
    throw new Error("Installment not found");
  }

  if (schedule.isPaid) {
    throw new Error("Installment already paid");
  }

  if (Number(data.amount) !== Number(schedule.amount)) {
    throw new Error(
      `Invalid installment amount. Expected ${schedule.amount}`
    );
  }

  const receiptCount = await prisma.payment.count();

  const receiptNumber =
    "RCP" + String(receiptCount + 1).padStart(6, "0");

  const { payment, loanClosed } = await prisma.$transaction(async (tx) => {
    const createdPayment = await tx.payment.create({
      data: {
        receiptNumber,
        loanId: data.loanId,
        scheduleId: schedule.id,
        installmentNumber: data.installmentNumber,
        amount: data.amount,
        penalty: schedule.penalty,
        totalReceived:
          Number(data.amount) + Number(schedule.penalty),
        paymentMethod: data.paymentMethod,
        paymentStatus: "PAID",
        paidAt: new Date(),
        remarks: data.remarks,
      },
    });

    await tx.loanSchedule.update({
      where: {
        id: schedule.id,
      },
      data: {
        isPaid: true,
        paidDate: new Date(),
      },
    });

    const updatedLoan = await tx.loan.update({
      where: {
        id: data.loanId,
      },
      data: {
        balanceAmount: {
          decrement: data.amount,
        },
        paidInstallments: {
          increment: 1,
        },
      },
    });

    let loanClosed = false;

    if (Number(updatedLoan.balanceAmount) <= 0) {
      await tx.loan.update({
        where: {
          id: data.loanId,
        },
        data: {
          balanceAmount: 0,
          status: "CLOSED",
        },
      });
      loanClosed = true;
    }

    return { payment: createdPayment, loanClosed };
  });

  await createAuditLog({
    adminId,
    action: "CREATE",
    tableName: "PAYMENT",
    recordId: payment.id,
    ipAddress,
  });

  await notifyPaymentReceived({ amount: Number(payment.amount) }, loan, loan.customer);

  if (loanClosed) {
    await notifyLoanClosed(loan, loan.customer);
  }

  return payment;
};

const getPeriodRange = (period?: "day" | "week" | "month") => {
  if (!period) return null;

  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);

  if (period === "week") {
    const dayOfWeek = from.getDay();
    const diffToMonday = (dayOfWeek + 6) % 7;
    from.setDate(from.getDate() - diffToMonday);
  } else if (period === "month") {
    from.setDate(1);
  }

  const to = new Date();

  return { gte: from, lte: to };
};

interface GetAllPaymentsFilters {
  partnerId?: string;
  customerId?: string;
  loanId?: string;
}

export const getAllPayments = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "paidAt",
  order: "asc" | "desc" = "desc",
  period?: "day" | "week" | "month",
  filters: GetAllPaymentsFilters = {}
) => {
  const skip = (page - 1) * limit;

  const paidAtRange = getPeriodRange(period);

  const where = {
    ...(paidAtRange ? { paidAt: paidAtRange } : {}),
    ...(filters.loanId ? { loanId: filters.loanId } : {}),
    ...(filters.partnerId || filters.customerId
      ? {
          loan: {
            ...(filters.partnerId ? { partnerId: filters.partnerId } : {}),
            ...(filters.customerId ? { customerId: filters.customerId } : {}),
          },
        }
      : {}),
    ...(search
      ? {
          OR: [
            {
              receiptNumber: {
                contains: search,
              },
            },
            {
              loan: {
                loanNumber: {
                  contains: search,
                },
              },
            },
            {
              loan: {
                customer: {
                  name: {
                    contains: search,
                  },
                },
              },
            },
          ],
        }
      : {}),
  };

  const allowedSortFields = [
    "paidAt",
    "amount",
    "receiptNumber",
    "createdAt",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "paidAt";

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [finalSortBy]: order,
      },
      include: {
        loan: {
          select: {
            loanNumber: true,
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
        },
      },
    }),

    prisma.payment.count({
      where,
    }),
  ]);

  return {
    payments,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};

export const getPaymentById = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: {
      loan: {
        include: {
          customer: true,
          partner: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};

export const getPaymentReceipt = async (id: string) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id,
    },
    include: {
      loan: {
        include: {
          customer: true,
          partner: true,
        },
      },
    },
  });

  if (!payment) {
    throw new Error("Payment not found");
  }

  return payment;
};