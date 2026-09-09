import prisma from "../config/db";

export type DashboardPeriod = "today" | "week" | "month" | "year";

interface DateRange {
  start: Date;
  end: Date;
}

function startOfDay(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addDays(d: Date, days: number) {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate() + days);
}

function startOfWeek(d: Date) {
  // Monday-start week, matching the convention already used elsewhere (payment.service.ts).
  const day = d.getDay();
  const diffToMonday = (day + 6) % 7;
  return addDays(startOfDay(d), -diffToMonday);
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function startOfYear(d: Date) {
  return new Date(d.getFullYear(), 0, 1);
}

// Current period range plus the immediately preceding range of equal length,
// used to compute "vs last period" trends.
function getPeriodRanges(period: DashboardPeriod, now: Date): { current: DateRange; previous: DateRange } {
  switch (period) {
    case "today": {
      const start = startOfDay(now);
      const end = addDays(start, 1);
      return { current: { start, end }, previous: { start: addDays(start, -1), end: start } };
    }
    case "week": {
      const start = startOfWeek(now);
      const end = addDays(start, 7);
      return { current: { start, end }, previous: { start: addDays(start, -7), end: start } };
    }
    case "year": {
      const start = startOfYear(now);
      const end = new Date(start.getFullYear() + 1, 0, 1);
      const prevStart = new Date(start.getFullYear() - 1, 0, 1);
      return { current: { start, end }, previous: { start: prevStart, end: start } };
    }
    case "month":
    default: {
      const start = startOfMonth(now);
      const end = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      const prevStart = new Date(start.getFullYear(), start.getMonth() - 1, 1);
      return { current: { start, end }, previous: { start: prevStart, end: start } };
    }
  }
}

interface Trend {
  percent: number | null;
  direction: "up" | "down" | "flat";
}

// null previous (or previous === 0) means there's no meaningful baseline to
// compare against — the caller shows a muted fallback instead of a percentage.
function computeTrend(current: number, previous: number): Trend {
  if (previous === 0) {
    return { percent: null, direction: "flat" };
  }
  const percent = ((current - previous) / previous) * 100;
  return {
    percent: Math.round(percent * 10) / 10,
    direction: percent > 0.05 ? "up" : percent < -0.05 ? "down" : "flat",
  };
}

async function sumPayments(range: DateRange, extraWhere: Record<string, unknown> = {}) {
  const result = await prisma.payment.aggregate({
    where: { paidAt: { gte: range.start, lt: range.end }, ...extraWhere },
    _sum: { totalReceived: true },
  });
  return Number(result._sum.totalReceived ?? 0);
}

async function sumExpenses(range: DateRange) {
  const result = await prisma.expense.aggregate({
    where: { expenseDate: { gte: range.start, lt: range.end } },
    _sum: { amount: true },
  });
  return Number(result._sum.amount ?? 0);
}

async function sumNewLoanPrincipal(range: DateRange) {
  const result = await prisma.loan.aggregate({
    where: { createdAt: { gte: range.start, lt: range.end } },
    _sum: { principalAmount: true },
  });
  return Number(result._sum.principalAmount ?? 0);
}

const WEEKDAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

async function getWeeklyCollectionTrend(now: Date) {
  const weekStart = startOfWeek(now);
  const weekEnd = addDays(weekStart, 7);

  const payments = await prisma.payment.findMany({
    where: { paidAt: { gte: weekStart, lt: weekEnd } },
    select: { paidAt: true, totalReceived: true },
  });

  const dayTotals = new Array(7).fill(0) as number[];
  for (const p of payments) {
    if (!p.paidAt) continue;
    const dayIndex = Math.floor((startOfDay(p.paidAt).getTime() - weekStart.getTime()) / 86_400_000);
    if (dayIndex >= 0 && dayIndex < 7) {
      dayTotals[dayIndex] += Number(p.totalReceived);
    }
  }

  const todayIndex = Math.floor((startOfDay(now).getTime() - weekStart.getTime()) / 86_400_000);

  const weeklyTrend = WEEKDAY_LABELS.map((label, i) => ({
    day: label,
    amount: dayTotals[i],
    // Days later in the week that haven't happened yet have no data —
    // distinguished from a real zero-collection day.
    future: i > todayIndex,
  }));

  const weeklyTotal = dayTotals.reduce((a, b) => a + b, 0);

  return { weeklyTrend, weeklyTotal };
}

export const getDashboardStats = async (period: DashboardPeriod = "month") => {
  const now = new Date();
  const { current, previous } = getPeriodRanges(period, now);
  const { current: monthCurrent, previous: monthPrevious } = getPeriodRanges("month", now);
  const { current: dayCurrent, previous: dayPrevious } = getPeriodRanges("today", now);

  // Total Customers
  const totalCustomers = await prisma.customer.count();

  // Total Partners
  const totalPartners = await prisma.partner.count();

  const activePartners = await prisma.partner.count({ where: { status: "ACTIVE" } });
  const inactivePartners = await prisma.partner.count({ where: { status: "INACTIVE" } });

  // Loan Counts
  const activeLoans = await prisma.loan.count({ where: { status: "ACTIVE" } });
  const pendingLoans = await prisma.loan.count({ where: { status: "PENDING" } });
  const approvedLoans = await prisma.loan.count({ where: { status: "APPROVED" } });
  const rejectedLoans = await prisma.loan.count({ where: { status: "REJECTED" } });
  const closedLoans = await prisma.loan.count({ where: { status: "CLOSED" } });

  const totalLoan = await prisma.loan.aggregate({ _sum: { principalAmount: true } });
  const outstanding = await prisma.loan.aggregate({ _sum: { balanceAmount: true } });
  const totalCollectionAgg = await prisma.payment.aggregate({ _sum: { totalReceived: true } });
  const totalExpenseAgg = await prisma.expense.aggregate({ _sum: { amount: true } });

  const totalLoanAmount = Number(totalLoan._sum.principalAmount ?? 0);
  const outstandingAmount = Number(outstanding._sum.balanceAmount ?? 0);
  const totalCollection = Number(totalCollectionAgg._sum.totalReceived ?? 0);
  const totalExpense = Number(totalExpenseAgg._sum.amount ?? 0);

  // Row 1 — driven by the selected period: compare "new activity this period"
  // vs "new activity in the prior equivalent period" (the displayed totals
  // themselves stay cumulative/current-state, unaffected by the selector).
  const [
    periodCollection,
    prevPeriodCollection,
    periodNewLoanPrincipal,
    prevPeriodNewLoanPrincipal,
  ] = await Promise.all([
    sumPayments(current),
    sumPayments(previous),
    sumNewLoanPrincipal(current),
    sumNewLoanPrincipal(previous),
  ]);

  // Outstanding has no historical snapshot to compare against. Approximate
  // "outstanding at the start of the period" by adding back this period's
  // collections (which reduced it) and removing this period's new principal
  // (which increased it) from the current balance — a directional estimate,
  // not an exact historical figure.
  const outstandingAtPeriodStart = outstandingAmount + periodCollection - periodNewLoanPrincipal;
  const outstandingTrend = computeTrend(outstandingAmount, outstandingAtPeriodStart);

  // Net Profit (MTD) is always calendar-month scoped, regardless of the
  // period selector — "MTD" means month-to-date by definition.
  const [monthCollectionForProfit, monthExpenseForProfit, prevMonthCollection, prevMonthExpense] =
    await Promise.all([
      sumPayments(monthCurrent),
      sumExpenses(monthCurrent),
      sumPayments(monthPrevious),
      sumExpenses(monthPrevious),
    ]);
  const netProfit = monthCollectionForProfit - monthExpenseForProfit;
  const prevNetProfit = prevMonthCollection - prevMonthExpense;

  // Row 2 — always fixed to "today" and "this month", independent of the
  // period selector, matching their explicit labels.
  const [todayCollection, yesterdayCollection, todayExpense, yesterdayExpense] = await Promise.all([
    sumPayments(dayCurrent),
    sumPayments(dayPrevious),
    sumExpenses(dayCurrent),
    sumExpenses(dayPrevious),
  ]);
  const monthlyCollection = monthCollectionForProfit;
  const monthlyExpense = monthExpenseForProfit;

  const { weeklyTrend, weeklyTotal } = await getWeeklyCollectionTrend(now);

  return {
    totalCustomers,
    totalPartners,

    activeLoans,
    pendingLoans,
    closedLoans,
    activePartners,
    inactivePartners,
    approvedLoans,
    rejectedLoans,

    totalLoanAmount,
    outstandingAmount,
    totalCollection,
    totalExpense,
    netProfit,

    todayCollection,
    monthlyCollection,
    todayExpense,
    monthlyExpense,

    weeklyTrend,
    weeklyTotal,

    period,
    trends: {
      totalCollection: computeTrend(periodCollection, prevPeriodCollection),
      outstandingAmount: outstandingTrend,
      totalLoanAmount: computeTrend(periodNewLoanPrincipal, prevPeriodNewLoanPrincipal),
      netProfit: computeTrend(netProfit, prevNetProfit),
      todayCollection: computeTrend(todayCollection, yesterdayCollection),
      monthlyCollection: computeTrend(monthlyCollection, prevMonthCollection),
      todayExpense: computeTrend(todayExpense, yesterdayExpense),
      monthlyExpense: computeTrend(monthlyExpense, prevMonthExpense),
    },
  };
};

export const getPartnerDashboardStats = async (partnerId: string) => {
  const now = new Date();
  const day = getPeriodRanges("today", now).current;

  const totalCustomers = await prisma.customer.count({
    where: { partnerId },
  });

  const activeLoans = await prisma.loan.count({
    where: { partnerId, status: "ACTIVE" },
  });

  const pendingLoans = await prisma.loan.count({
    where: { partnerId, status: "PENDING" },
  });

  const closedLoans = await prisma.loan.count({
    where: { partnerId, status: "CLOSED" },
  });

  const totalLoan = await prisma.loan.aggregate({
    where: { partnerId },
    _sum: { principalAmount: true },
  });

  const outstanding = await prisma.loan.aggregate({
    where: { partnerId },
    _sum: { balanceAmount: true },
  });

  const totalCollection = await prisma.payment.aggregate({
    where: { loan: { partnerId } },
    _sum: { totalReceived: true },
  });

  const todayCollection = await prisma.payment.aggregate({
    where: {
      loan: { partnerId },
      paidAt: { gte: day.start, lt: day.end },
    },
    _sum: { totalReceived: true },
  });

  const [recentCustomers, recentLoans, recentPayments] = await Promise.all([
    prisma.customer.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.loan.findMany({
      where: { partnerId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        customer: {
          select: { customerCode: true, name: true, phone: true },
        },
      },
    }),
    prisma.payment.findMany({
      where: { loan: { partnerId } },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        loan: {
          select: {
            loanNumber: true,
            customer: { select: { customerCode: true, name: true, phone: true } },
          },
        },
      },
    }),
  ]);

  return {
    totalCustomers,
    activeLoans,
    pendingLoans,
    closedLoans,
    totalLoanAmount: totalLoan._sum.principalAmount ?? 0,
    outstandingAmount: outstanding._sum.balanceAmount ?? 0,
    totalCollection: totalCollection._sum.totalReceived ?? 0,
    todayCollection: todayCollection._sum.totalReceived ?? 0,
    recentCustomers,
    recentLoans,
    recentPayments,
  };
};
