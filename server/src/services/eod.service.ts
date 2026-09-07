import prisma from "../config/db";
import { createAuditLog } from "./audit.service";
import {
  notifyEodApproved,
  notifyEodRejected,
  notifyEodSubmitted,
} from "./notification.service";

type EodExpenseCategory =
  | "OFFICE"
  | "SALARY"
  | "PETROL"
  | "ELECTRICITY"
  | "RENT"
  | "OTHER";

interface EodExpenseInput {
  category: EodExpenseCategory;
  amount: number;
  description?: string;
}

function toDateOnly(dateStr: string): Date {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) {
    throw new Error("Invalid report date");
  }
  return date;
}

function getDayRange(date: Date) {
  const gte = new Date(date);
  const lt = new Date(date);
  lt.setDate(lt.getDate() + 1);
  return { gte, lt };
}

function validateExpenses(expenses: EodExpenseInput[]) {
  if (!Array.isArray(expenses)) {
    throw new Error("Expenses must be a list");
  }

  const allowedCategories: EodExpenseCategory[] = [
    "OFFICE",
    "SALARY",
    "PETROL",
    "ELECTRICITY",
    "RENT",
    "OTHER",
  ];

  for (const expense of expenses) {
    if (!expense.category || !allowedCategories.includes(expense.category)) {
      throw new Error("Each expense must have a valid category");
    }
    if (expense.amount == null || Number(expense.amount) <= 0) {
      throw new Error("Each expense must have a valid amount greater than 0");
    }
  }
}

async function calculatePartnerCollection(partnerId: string, reportDate: Date) {
  const { gte, lt } = getDayRange(reportDate);

  const result = await prisma.payment.aggregate({
    where: {
      loan: { partnerId },
      paidAt: { gte, lt },
    },
    _sum: { totalReceived: true },
  });

  return Number(result._sum.totalReceived ?? 0);
}

export const getMyEodPreview = async (partnerId: string, dateStr: string) => {
  const reportDate = toDateOnly(dateStr);
  const totalCollection = await calculatePartnerCollection(partnerId, reportDate);

  const existing = await prisma.eodReport.findUnique({
    where: { partnerId_reportDate: { partnerId, reportDate } },
    include: { expenses: true },
  });

  return { reportDate, totalCollection, existing };
};

export const submitMyEod = async (
  partnerId: string,
  dateStr: string,
  expenses: EodExpenseInput[],
  ipAddress?: string
) => {
  if (!dateStr) {
    throw new Error("Report date is required");
  }

  validateExpenses(expenses);

  const reportDate = toDateOnly(dateStr);

  const existing = await prisma.eodReport.findUnique({
    where: { partnerId_reportDate: { partnerId, reportDate } },
  });

  if (existing && existing.status !== "REJECTED") {
    throw new Error(
      existing.status === "PENDING"
        ? "An EOD report for this date has already been submitted and is awaiting review."
        : "An EOD report for this date has already been approved and closed."
    );
  }

  const totalCollection = await calculatePartnerCollection(partnerId, reportDate);
  const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const netRemittance = totalCollection - totalExpenses;

  const expenseCreateData = expenses.map((e) => ({
    category: e.category,
    amount: e.amount,
    description: e.description,
  }));

  const report = await prisma.$transaction(async (tx) => {
    if (existing) {
      await tx.eodExpense.deleteMany({ where: { eodReportId: existing.id } });

      return tx.eodReport.update({
        where: { id: existing.id },
        data: {
          totalCollection,
          totalExpenses,
          netRemittance,
          status: "PENDING",
          approvedBy: null,
          approvedAt: null,
          expenses: { create: expenseCreateData },
        },
        include: {
          expenses: true,
          partner: { select: { id: true, partnerCode: true, name: true } },
        },
      });
    }

    return tx.eodReport.create({
      data: {
        partnerId,
        reportDate,
        totalCollection,
        totalExpenses,
        netRemittance,
        status: "PENDING",
        expenses: { create: expenseCreateData },
      },
      include: {
        expenses: true,
        partner: { select: { id: true, partnerCode: true, name: true } },
      },
    });
  });

  await createAuditLog({
    action: existing ? "RESUBMIT" : "CREATE",
    tableName: "EOD",
    recordId: report.id,
    ipAddress,
  });

  await notifyEodSubmitted(
    { id: report.id, reportDate: report.reportDate, netRemittance: Number(report.netRemittance) },
    report.partner
  );

  return report;
};

interface EodReportFilters {
  partnerId?: string;
  status?: string;
  startDate?: Date;
  endDate?: Date;
}

export const getEodReports = async (
  page = 1,
  limit = 10,
  filters: EodReportFilters = {}
) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(filters.partnerId ? { partnerId: filters.partnerId } : {}),
    ...(filters.status ? { status: filters.status as any } : {}),
    ...(filters.startDate || filters.endDate
      ? {
          reportDate: {
            ...(filters.startDate ? { gte: filters.startDate } : {}),
            ...(filters.endDate ? { lte: filters.endDate } : {}),
          },
        }
      : {}),
  };

  const [reports, total, totals] = await Promise.all([
    prisma.eodReport.findMany({
      where,
      skip,
      take: limit,
      orderBy: { reportDate: "desc" },
      include: {
        partner: { select: { partnerCode: true, name: true } },
      },
    }),

    prisma.eodReport.count({ where }),

    prisma.eodReport.aggregate({
      where,
      _sum: { totalCollection: true, totalExpenses: true, netRemittance: true },
    }),
  ]);

  return {
    reports,
    total,
    totalCollection: totals._sum.totalCollection ?? 0,
    totalExpenses: totals._sum.totalExpenses ?? 0,
    totalNetRemittance: totals._sum.netRemittance ?? 0,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getEodReportById = async (id: string) => {
  const report = await prisma.eodReport.findUnique({
    where: { id },
    include: {
      partner: true,
      expenses: true,
    },
  });

  if (!report) {
    throw new Error("EOD report not found");
  }

  return report;
};

export const approveEodById = async (
  id: string,
  adminId?: string,
  ipAddress?: string
) => {
  const report = await prisma.eodReport.findUnique({
    where: { id },
    include: { partner: true },
  });

  if (!report) {
    throw new Error("EOD report not found");
  }

  if (report.status !== "PENDING") {
    throw new Error(
      `EOD report is already ${report.status.toLowerCase()} and cannot be approved`
    );
  }

  const approved = await prisma.eodReport.update({
    where: { id },
    data: { status: "CLOSED", approvedBy: adminId, approvedAt: new Date() },
  });

  await createAuditLog({
    adminId,
    action: "APPROVE",
    tableName: "EOD",
    recordId: approved.id,
    ipAddress,
  });

  await notifyEodApproved(approved, report.partner);

  return approved;
};

export const rejectEodById = async (
  id: string,
  reason: string,
  adminId?: string,
  ipAddress?: string
) => {
  if (!reason || !reason.trim()) {
    throw new Error("Rejection reason is required");
  }

  const report = await prisma.eodReport.findUnique({
    where: { id },
    include: { partner: true },
  });

  if (!report) {
    throw new Error("EOD report not found");
  }

  if (report.status !== "PENDING") {
    throw new Error(
      `EOD report is already ${report.status.toLowerCase()} and cannot be rejected`
    );
  }

  const rejected = await prisma.eodReport.update({
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
    tableName: "EOD",
    recordId: rejected.id,
    ipAddress,
  });

  await notifyEodRejected(rejected, report.partner, reason);

  return rejected;
};
