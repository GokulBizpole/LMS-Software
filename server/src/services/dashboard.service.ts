import prisma from "../config/db";

const today = new Date();

const startOfDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate()
);

const endOfDay = new Date(
  today.getFullYear(),
  today.getMonth(),
  today.getDate() + 1
);

const startOfMonth = new Date(
  today.getFullYear(),
  today.getMonth(),
  1
);

const endOfMonth = new Date(
  today.getFullYear(),
  today.getMonth() + 1,
  1
);

export const getDashboardStats = async () => {
  // Total Customers
  const totalCustomers = await prisma.customer.count();

  // Total Partners
  const totalPartners = await prisma.partner.count();

  const activePartners = await prisma.partner.count({
  where: {
    status: "ACTIVE",
  },
});

const inactivePartners = await prisma.partner.count({
  where: {
    status: "INACTIVE",
  },
});

  // Loan Counts
  const activeLoans = await prisma.loan.count({
    where: {
      status: "ACTIVE",
    },
  });

  const pendingLoans = await prisma.loan.count({
    where: {
      status: "PENDING",
    },
  });

  const approvedLoans = await prisma.loan.count({
  where: {
    status: "APPROVED",
  },
});

const rejectedLoans = await prisma.loan.count({
  where: {
    status: "REJECTED",
  },
});

  const closedLoans = await prisma.loan.count({
    where: {
      status: "CLOSED",
    },
  });

  const totalLoan = await prisma.loan.aggregate({
  _sum: {
    principalAmount: true,
  },
});

const outstanding = await prisma.loan.aggregate({
  _sum: {
    balanceAmount: true,
  },
});

const totalCollection = await prisma.payment.aggregate({
  _sum: {
    totalReceived: true,
  },
});

const totalExpense = await prisma.expense.aggregate({
  _sum: {
    amount: true,
  },
});

const todayCollection = await prisma.payment.aggregate({
  where: {
    paidAt: {
      gte: startOfDay,
      lt: endOfDay,
    },
  },
  _sum: {
    totalReceived: true,
  },
});

const monthlyCollection = await prisma.payment.aggregate({
  where: {
    paidAt: {
      gte: startOfMonth,
      lt: endOfMonth,
    },
  },
  _sum: {
    totalReceived: true,
  },
});

const todayExpense = await prisma.expense.aggregate({
  where: {
    expenseDate: {
      gte: startOfDay,
      lt: endOfDay,
    },
  },
  _sum: {
    amount: true,
  },
});

const monthlyExpense = await prisma.expense.aggregate({
  where: {
    expenseDate: {
      gte: startOfMonth,
      lt: endOfMonth,
    },
  },
  _sum: {
    amount: true,
  },
});

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

  totalLoanAmount:
    totalLoan._sum.principalAmount ?? 0,

  outstandingAmount:
    outstanding._sum.balanceAmount ?? 0,

  totalCollection:
    totalCollection._sum.totalReceived ?? 0,

  totalExpense:
    totalExpense._sum.amount ?? 0,

    todayCollection:
  todayCollection._sum.totalReceived ?? 0,

monthlyCollection:
  monthlyCollection._sum.totalReceived ?? 0,

todayExpense:
  todayExpense._sum.amount ?? 0,

monthlyExpense:
  monthlyExpense._sum.amount ?? 0,
};


};