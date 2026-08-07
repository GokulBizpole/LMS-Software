import prisma from "../config/db";



interface LoanReportFilter {
  status?: "PENDING" | "ACTIVE" | "CLOSED";
  from?: Date;
  to?: Date;
}

export const getLoanReport = async (
  filter: LoanReportFilter
) => {
  return await prisma.loan.findMany({
    where: {
      ...(filter.status && {
        status: filter.status,
      }),

      ...(filter.from &&
        filter.to && {
          createdAt: {
            gte: filter.from,
            lte: filter.to,
          },
        }),
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

    orderBy: {
      createdAt: "desc",
    },
  });
};

export const getCollectionReport = async () => {
  return await prisma.payment.findMany({
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
        },
      },
    },

    orderBy: {
      paidAt: "desc",
    },
  });
};

export const getExpenseReport = async () => {
  return await prisma.expense.findMany({
    include: {
      partner: {
        select: {
          partnerCode: true,
          name: true,
        },
      },
    },
    orderBy: {
      expenseDate: "desc",
    },
  });
};

export const getProfitLossReport = async () => {
  const loanAmount = await prisma.loan.aggregate({
    _sum: {
      principalAmount: true,
    },
  });

  const collection = await prisma.payment.aggregate({
    _sum: {
      totalReceived: true,
    },
  });

  const expense = await prisma.expense.aggregate({
    _sum: {
      amount: true,
    },
  });

  const outstanding = await prisma.loan.aggregate({
    _sum: {
      balanceAmount: true,
    },
  });

  const totalLoanAmount =
    Number(loanAmount._sum.principalAmount ?? 0);

  const totalCollection =
    Number(collection._sum.totalReceived ?? 0);

  const totalExpense =
    Number(expense._sum.amount ?? 0);

  const outstandingAmount =
    Number(outstanding._sum.balanceAmount ?? 0);

  const netProfit =
    totalCollection - totalExpense;

  return {
    totalLoanAmount,
    totalCollection,
    totalExpense,
    outstandingAmount,
    netProfit,
  };
};

export const getCustomerLedger = async (
  customerId: string
) => {
  const customer = await prisma.customer.findUnique({
    where: {
      id: customerId,
    },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  const loans = await prisma.loan.findMany({
    where: {
      customerId,
    },
    include: {
      payments: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const totalLoanAmount = loans.reduce(
    (sum, loan) => sum + Number(loan.principalAmount),
    0
  );

  const outstanding = loans.reduce(
    (sum, loan) => sum + Number(loan.balanceAmount),
    0
  );

  const totalPaid = loans.reduce((sum, loan) => {
    return (
      sum +
      loan.payments.reduce(
        (p, payment) => p + Number(payment.totalReceived),
        0
      )
    );
  }, 0);

  return {
    customer,
    loans,
    summary: {
      totalLoanAmount,
      totalPaid,
      outstanding,
    },
  };
};

export const getPartnerReport = async () => {
  const partners = await prisma.partner.findMany({
    include: {
      loans: {
        include: {
          payments: true,
        },
      },
    },
  });

  return partners.map((partner) => {
    const totalLoans = partner.loans.length;

    const loanAmount = partner.loans.reduce(
      (sum, loan) => sum + Number(loan.principalAmount),
      0
    );

    const collection = partner.loans.reduce(
      (sum, loan) =>
        sum +
        loan.payments.reduce(
          (p, payment) => p + Number(payment.totalReceived),
          0
        ),
      0
    );

    const outstanding = partner.loans.reduce(
      (sum, loan) => sum + Number(loan.balanceAmount),
      0
    );

    return {
      partnerCode: partner.partnerCode,
      name: partner.name,
      investmentAmount: Number(partner.investmentAmount),
      currentBalance: Number(partner.currentBalance),
      totalLoans,
      loanAmount: Number(loanAmount.toFixed(2)),
      collection: Number(collection.toFixed(2)),
      outstanding: Number(outstanding.toFixed(2)),
    };
  });
};