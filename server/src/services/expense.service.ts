import prisma from "../config/db";

interface CreateExpenseData {
  partnerId: string;
  category:
    | "OFFICE"
    | "SALARY"
    | "PETROL"
    | "ELECTRICITY"
    | "RENT"
    | "OTHER";
  amount: number;
  description?: string;
  expenseDate: Date;
}

export const createExpense = async (
  data: CreateExpenseData
) => {
  const partner = await prisma.partner.findUnique({
    where: {
      id: data.partnerId,
    },
  });

  if (!partner) {
    throw new Error("Partner not found");
  }

  return await prisma.expense.create({
    data: {
      ...data,
      expenseDate: new Date(data.expenseDate),
    },
  });
};

interface ExpenseFilters {
  category?: string;
  partnerId?: string;
  startDate?: Date;
  endDate?: Date;
}

export const getAllExpenses = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "expenseDate",
  order: "asc" | "desc" = "desc",
  filters: ExpenseFilters = {}
) => {
  const skip = (page - 1) * limit;

  const andConditions: any[] = [];

  if (search) {
    andConditions.push({
      OR: [
        { description: { contains: search } },
        { partner: { name: { contains: search } } },
        { partner: { partnerCode: { contains: search } } },
      ],
    });
  }

  if (filters.category) {
    andConditions.push({ category: filters.category });
  }

  if (filters.partnerId) {
    andConditions.push({ partnerId: filters.partnerId });
  }

  if (filters.startDate || filters.endDate) {
    andConditions.push({
      expenseDate: {
        ...(filters.startDate ? { gte: filters.startDate } : {}),
        ...(filters.endDate ? { lte: filters.endDate } : {}),
      },
    });
  }

  const where = andConditions.length > 0 ? { AND: andConditions } : {};

  const allowedSortFields = [
    "expenseDate",
    "amount",
    "category",
    "createdAt",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "expenseDate";

  const [expenses, total, totalAmountResult] = await Promise.all([
    prisma.expense.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        [finalSortBy]: order,
      },
      include: {
        partner: {
          select: {
            partnerCode: true,
            name: true,
          },
        },
      },
    }),

    prisma.expense.count({
      where,
    }),

    prisma.expense.aggregate({
      where,
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    expenses,
    total,
    totalAmount: totalAmountResult._sum.amount ?? 0,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
};
export const getExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
    include: {
      partner: true,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return expense;
};

interface UpdateExpenseData {
  category?:
    | "OFFICE"
    | "SALARY"
    | "PETROL"
    | "ELECTRICITY"
    | "RENT"
    | "OTHER";

  amount?: number;

  description?: string;

  expenseDate?: Date;
}

export const updateExpenseById = async (
  id: string,
  data: UpdateExpenseData
) => {
  const expense = await prisma.expense.findUnique({
    where: {
      id,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  return await prisma.expense.update({
    where: {
      id,
    },
    data: {
      ...data,
      ...(data.expenseDate ? { expenseDate: new Date(data.expenseDate) } : {}),
    },
  });
};

export const deleteExpenseById = async (id: string) => {
  const expense = await prisma.expense.findUnique({
    where: { id },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  await prisma.expense.delete({
    where: { id },
  });

  return {
    message: "Expense deleted successfully",
  };
};