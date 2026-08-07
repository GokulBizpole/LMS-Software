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
    data,
  });
};

export const getAllExpenses = async (
  page = 1,
  limit = 10,
  search = "",
  sortBy = "expenseDate",
  order: "asc" | "desc" = "desc"
) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            category: {
              contains: search,
            },
          },
          {
            description: {
              contains: search,
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
    "expenseDate",
    "amount",
    "category",
    "createdAt",
  ];

  const finalSortBy = allowedSortFields.includes(sortBy)
    ? sortBy
    : "expenseDate";

  const [expenses, total] = await Promise.all([
    prisma.expense.findMany({
    //   where,
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
    //   where,
    }),
  ]);

  return {
    expenses,
    total,
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
    data,
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