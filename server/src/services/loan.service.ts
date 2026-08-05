import prisma from "../config/db";

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
  data: CreateLoanData
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