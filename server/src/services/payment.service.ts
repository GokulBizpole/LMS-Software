import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import { notifyPaymentReceived, notifyLoanClosed } from "./notification.service";

// ============================================================
// Week-by-week payment model
// ------------------------------------------------------------
// Each LoanSchedule row is one week's (or month's) ORIGINAL due — its
// amount is never modified. Every rupee collected is an append-only Payment
// row linked to the schedule it settles, so a week's history (paid, pending,
// payment date) is always derived from its own Payment rows and never
// changes when later weeks are paid. A schedule is flagged isPaid once its
// installment + penalty are fully covered.
// ============================================================

const round2 = (n: number) => Math.round(n * 100) / 100;

const COLLECTABLE_STATUSES = ["APPROVED", "ACTIVE"];

const assertCollectable = (status: string) => {
  if (!COLLECTABLE_STATUSES.includes(status)) {
    throw new Error("Loan must be approved before collecting payment");
  }
};

interface ScheduleWithPayments {
  id: string;
  installmentNo: number;
  dueDate: Date;
  amount: unknown;
  penalty: unknown;
  isPaid: boolean;
  paidDate: Date | null;
  payments: { amount: unknown; penalty: unknown; paidAt: Date | null }[];
}

// Per-week figures derived from the schedule row and its own payments.
export const scheduleState = (s: ScheduleWithPayments) => {
  const amount = Number(s.amount);
  const penalty = Number(s.penalty);
  const paidInstallment = round2(s.payments.reduce((t, p) => t + Number(p.amount), 0));
  const paidPenalty = round2(s.payments.reduce((t, p) => t + Number(p.penalty), 0));

  // A schedule flagged paid is fully settled even if it predates Payment
  // rows being linked to schedules.
  const pendingInstallment = s.isPaid ? 0 : Math.max(round2(amount - paidInstallment), 0);
  const pendingPenalty = s.isPaid ? 0 : Math.max(round2(penalty - paidPenalty), 0);

  const lastPaymentAt = s.payments.reduce<Date | null>(
    (latest, p) => (p.paidAt && (!latest || p.paidAt > latest) ? p.paidAt : latest),
    null
  );

  return {
    amount,
    penalty,
    paid: s.isPaid && s.payments.length === 0 ? round2(amount + penalty) : round2(paidInstallment + paidPenalty),
    pendingInstallment,
    pendingPenalty,
    pending: round2(pendingInstallment + pendingPenalty),
    paymentDate: s.paidDate ?? lastPaymentAt,
  };
};

interface Allocation {
  scheduleId: string;
  installmentNo: number;
  installmentPart: number;
  penaltyPart: number;
  // True when this allocation clears the schedule's remaining due.
  settles: boolean;
}

// Shared core for every payment path: writes one Payment row per schedule
// covered, flags fully-settled schedules as paid, reduces the loan balance
// by the installment portion (penalties are collected on top, as before)
// and closes the loan once nothing is left.
const applyAllocations = async (
  loan: { id: string; loanNumber: string; customer: { id: string; name: string } },
  allocations: Allocation[],
  unpaidScheduleCountBefore: number,
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER",
  remarks: string | undefined,
  adminId?: string,
  ipAddress?: string
) => {
  const receiptCount = await prisma.payment.count();
  const now = new Date();

  const installmentTotal = round2(allocations.reduce((t, a) => t + a.installmentPart, 0));
  const settledIds = allocations.filter((a) => a.settles).map((a) => a.scheduleId);

  const { payments, loanClosed } = await prisma.$transaction(
    async (tx) => {
      const createdPayments = await tx.payment.createManyAndReturn({
        data: allocations.map((a, i) => ({
          receiptNumber: "RCP" + String(receiptCount + 1 + i).padStart(6, "0"),
          loanId: loan.id,
          scheduleId: a.scheduleId,
          installmentNumber: a.installmentNo,
          amount: a.installmentPart,
          penalty: a.penaltyPart,
          totalReceived: round2(a.installmentPart + a.penaltyPart),
          paymentMethod,
          paymentStatus: "PAID" as const,
          paidAt: now,
          remarks,
        })),
      });

      if (settledIds.length > 0) {
        await tx.loanSchedule.updateMany({
          where: { id: { in: settledIds } },
          data: { isPaid: true, paidDate: now },
        });
      }

      const updatedLoan = await tx.loan.update({
        where: { id: loan.id },
        data: {
          balanceAmount: { decrement: installmentTotal },
          paidInstallments: { increment: settledIds.length },
        },
        select: { balanceAmount: true },
      });

      let loanClosed = false;

      if (
        Number(updatedLoan.balanceAmount) <= 0 ||
        unpaidScheduleCountBefore - settledIds.length <= 0
      ) {
        await tx.loan.update({
          where: { id: loan.id },
          data: { balanceAmount: 0, status: "CLOSED" },
        });
        loanClosed = true;
      }

      return { payments: createdPayments, loanClosed };
    },
    { maxWait: 10000, timeout: 15000 }
  );

  await Promise.all(
    payments.map((p) =>
      createAuditLog({
        adminId,
        action: "CREATE",
        tableName: "PAYMENT",
        recordId: p.id,
        ipAddress,
      })
    )
  );

  const totalReceived = round2(payments.reduce((t, p) => t + Number(p.totalReceived), 0));
  await notifyPaymentReceived({ amount: totalReceived }, loan, loan.customer);

  if (loanClosed) {
    await notifyLoanClosed(loan, loan.customer);
  }

  return { payments, loanClosed };
};

const loadLoanWithSchedules = async (loanId: string) => {
  const loan = await prisma.loan.findUnique({
    where: { id: loanId },
    include: {
      customer: true,
      schedules: {
        orderBy: { installmentNo: "asc" },
        include: {
          payments: {
            orderBy: { paidAt: "asc" },
            select: {
              id: true,
              receiptNumber: true,
              amount: true,
              penalty: true,
              totalReceived: true,
              paymentMethod: true,
              paidAt: true,
            },
          },
        },
      },
    },
  });

  if (!loan) {
    throw new Error("Loan not found");
  }

  return loan;
};

// ================= SINGLE INSTALLMENT (existing API) =================

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
  const loan = await loadLoanWithSchedules(data.loanId);

  assertCollectable(loan.status);

  const schedule = loan.schedules.find(
    (s) => s.installmentNo === Number(data.installmentNumber)
  );

  if (!schedule) {
    throw new Error("Installment not found");
  }

  const state = scheduleState(schedule);

  if (state.pending <= 0) {
    throw new Error("Installment already paid");
  }

  // Expects exactly what is still owed on the installment (its full amount
  // unless part of it was already collected); any penalty is added on top.
  if (round2(Number(data.amount)) !== state.pendingInstallment) {
    throw new Error(
      `Invalid installment amount. Expected ${state.pendingInstallment}`
    );
  }

  const { payments } = await applyAllocations(
    loan,
    [
      {
        scheduleId: schedule.id,
        installmentNo: schedule.installmentNo,
        installmentPart: state.pendingInstallment,
        penaltyPart: state.pendingPenalty,
        settles: true,
      },
    ],
    loan.schedules.filter((s) => scheduleState(s).pending > 0).length,
    data.paymentMethod,
    data.remarks,
    adminId,
    ipAddress
  );

  return payments[0];
};

// ================= WEEKLY COLLECTION =================

// Full week-by-week history + what is due now. Everything shown in the
// collection screen comes from here, so reopening it later shows exactly
// the same figures.
export const getLoanCollection = async (loanId: string) => {
  const loan = await loadLoanWithSchedules(loanId);

  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);

  let carryForward = 0;
  let dueNow = 0;
  let overdue = 0;
  let totalOutstanding = 0;
  let totalPaid = 0;
  let nextDue: { week: number; dueDate: Date; amount: number } | null = null;

  const weeks = loan.schedules.map((s) => {
    const st = scheduleState(s);
    const isPaid = st.pending <= 0;

    // Unpaid amounts from earlier weeks roll into this week's collection.
    const previousPending = round2(carryForward);
    const collectionDue = isPaid ? 0 : round2(previousPending + st.pending);
    carryForward += st.pending;

    totalOutstanding += st.pending;
    totalPaid += st.paid;
    if (!isPaid && s.dueDate <= endOfToday) dueNow += st.pending;
    if (!isPaid && s.dueDate < startOfToday) overdue += st.pending;
    if (!isPaid && s.dueDate > endOfToday && !nextDue) {
      nextDue = { week: s.installmentNo, dueDate: s.dueDate, amount: st.pending };
    }

    return {
      week: s.installmentNo,
      scheduleId: s.id,
      dueDate: s.dueDate,
      originalDue: st.amount,
      penalty: st.penalty,
      paid: st.paid,
      pending: st.pending,
      previousPending,
      collectionDue,
      paymentDate: st.paymentDate,
      status: isPaid ? ("PAID" as const) : ("UNPAID" as const),
      payments: s.payments.map((p) => ({
        id: p.id,
        receiptNumber: p.receiptNumber,
        amount: Number(p.amount),
        penalty: Number(p.penalty),
        totalReceived: Number(p.totalReceived),
        paymentMethod: p.paymentMethod,
        paidAt: p.paidAt,
      })),
    };
  });

  return {
    loan: {
      id: loan.id,
      loanNumber: loan.loanNumber,
      status: loan.status,
      paymentFrequency: loan.paymentFrequency,
      principalAmount: Number(loan.principalAmount),
      totalPayable: Number(loan.totalPayable),
      balanceAmount: Number(loan.balanceAmount),
      installmentAmount: Number(loan.installmentAmount),
      customer: { id: loan.customer.id, name: loan.customer.name, customerCode: loan.customer.customerCode },
    },
    summary: {
      dueNow: round2(dueNow),
      overdue: round2(overdue),
      totalOutstanding: round2(totalOutstanding),
      totalPaid: round2(totalPaid),
      nextDue,
      canCollect: COLLECTABLE_STATUSES.includes(loan.status) && totalOutstanding > 0,
    },
    weeks,
  };
};

interface CollectPaymentData {
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  remarks?: string;
}

// Collects any amount up to the outstanding total and applies it to the
// oldest unpaid weeks first (penalty, then installment), so pending weeks
// are carried forward and settled automatically. One Payment row is
// written per week touched.
export const collectLoanPayment = async (
  loanId: string,
  data: CollectPaymentData,
  adminId?: string,
  ipAddress?: string
) => {
  const loan = await loadLoanWithSchedules(loanId);

  assertCollectable(loan.status);

  const amount = round2(Number(data.amount));
  if (!(amount > 0)) {
    throw new Error("Enter an amount greater than zero");
  }

  if (!["CASH", "UPI", "BANK_TRANSFER"].includes(data.paymentMethod)) {
    throw new Error("Invalid payment method");
  }

  const unpaid = loan.schedules
    .map((s) => ({ s, st: scheduleState(s) }))
    .filter(({ st }) => st.pending > 0);

  const totalOutstanding = round2(unpaid.reduce((t, { st }) => t + st.pending, 0));

  if (totalOutstanding <= 0) {
    throw new Error("This loan has no pending installments");
  }

  if (amount > totalOutstanding) {
    throw new Error(`Amount exceeds the total outstanding of ₹${totalOutstanding}`);
  }

  let remaining = amount;
  const allocations: Allocation[] = [];

  for (const { s, st } of unpaid) {
    if (remaining <= 0) break;

    const penaltyPart = Math.min(remaining, st.pendingPenalty);
    remaining = round2(remaining - penaltyPart);
    const installmentPart = Math.min(remaining, st.pendingInstallment);
    remaining = round2(remaining - installmentPart);

    allocations.push({
      scheduleId: s.id,
      installmentNo: s.installmentNo,
      installmentPart: round2(installmentPart),
      penaltyPart: round2(penaltyPart),
      settles: round2(penaltyPart + installmentPart) >= st.pending,
    });
  }

  const result = await applyAllocations(
    loan,
    allocations,
    unpaid.length,
    data.paymentMethod,
    data.remarks,
    adminId,
    ipAddress
  );

  return {
    ...result,
    amount,
    weeksSettled: allocations.filter((a) => a.settles).map((a) => a.installmentNo),
    weeksPartial: allocations.filter((a) => !a.settles).map((a) => a.installmentNo),
  };
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