import prisma from "../config/db";

interface CreatePaymentData {
  loanId: string;
  installmentNumber: number;
  amount: number;
  paymentMethod: "CASH" | "UPI" | "BANK_TRANSFER";
  remarks?: string;
}

export const createPayment = async (
  data: CreatePaymentData
) => {
  const loan = await prisma.loan.findUnique({
    where: { id: data.loanId },
  });

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

  // Next step-la payment save pannuvom...

  const receiptNumber = `RCP${Date.now()}`;

const payment = await prisma.$transaction(async (tx) => {
  const payment = await tx.payment.create({
    data: {
      receiptNumber,
      loanId: data.loanId,
      installmentNumber: data.installmentNumber,
      amount: data.amount,
      penalty: schedule.penalty,
      totalReceived: data.amount + Number(schedule.penalty),
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

  await tx.loan.update({
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

  return payment;
});

return payment;
};