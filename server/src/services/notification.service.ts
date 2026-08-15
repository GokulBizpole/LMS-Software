import prisma from "../config/db";

type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

interface CreateNotificationData {
  title: string;
  message: string;
  type?: NotificationSeverity;
  adminId?: string;
  customerId?: string;
  partnerId?: string;
  loanId?: string;
}

export const createNotification = async (data: CreateNotificationData) => {
  try {
    return await prisma.notification.create({
      data: {
        title: data.title,
        message: data.message,
        type: data.type ?? "INFO",
        adminId: data.adminId,
        customerId: data.customerId,
        partnerId: data.partnerId,
        loanId: data.loanId,
      },
    });
  } catch (error) {
    console.error("Notification Error:", error);
    return null;
  }
};

const formatCurrency = (value: number) =>
  `₹${value.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;

// ================= EVENT HELPERS =================
// One helper per LMS activity that should surface in the admin notification
// center. Call these from the relevant service right after the write
// succeeds (same place audit logs are recorded).

export const notifyPartnerCreated = (partner: {
  id: string;
  partnerCode: string;
  name: string;
}) =>
  createNotification({
    title: "New Partner Created",
    message: `Partner ${partner.partnerCode} - ${partner.name} was added.`,
    type: "INFO",
    partnerId: partner.id,
  });

export const notifyPartnerInvestmentReceived = (
  partner: { id: string; partnerCode: string; name: string },
  amount: number
) =>
  createNotification({
    title: "Partner Investment Received",
    message: `${formatCurrency(amount)} investment received from Partner ${partner.partnerCode} - ${partner.name}.`,
    type: "SUCCESS",
    partnerId: partner.id,
  });

export const notifyPartnerInvestmentUpdated = (
  partner: { id: string; partnerCode: string; name: string },
  amount: number
) =>
  createNotification({
    title: "Partner Investment Updated",
    message: `Investment for Partner ${partner.partnerCode} - ${partner.name} updated to ${formatCurrency(amount)}.`,
    type: "INFO",
    partnerId: partner.id,
  });

export const notifyPartnerStatusChanged = (partner: {
  id: string;
  partnerCode: string;
  name: string;
  status: string;
}) =>
  createNotification({
    title: "Partner Status Changed",
    message: `Partner ${partner.partnerCode} - ${partner.name} is now ${partner.status.toLowerCase()}.`,
    type: partner.status === "ACTIVE" ? "SUCCESS" : "WARNING",
    partnerId: partner.id,
  });

export const notifyCustomerCreated = (customer: {
  id: string;
  customerCode: string;
  name: string;
}) =>
  createNotification({
    title: "New Customer Created",
    message: `Customer ${customer.customerCode} - ${customer.name} was added.`,
    type: "INFO",
    customerId: customer.id,
  });

export const notifyLoanSubmitted = (
  loan: { id: string; loanNumber: string; principalAmount: number },
  partner: { id: string; partnerCode: string; name: string },
  customer: { id: string; customerCode: string; name: string }
) =>
  createNotification({
    title: "New Loan Submitted",
    message: `Partner ${partner.partnerCode} - ${partner.name} submitted a ${formatCurrency(loan.principalAmount)} loan for ${customer.name} (${customer.customerCode}).`,
    type: "INFO",
    loanId: loan.id,
    partnerId: partner.id,
    customerId: customer.id,
  });

export const notifyLoanApproved = (
  loan: { id: string; loanNumber: string },
  customer: { id: string; name: string }
) =>
  createNotification({
    title: "Loan Approved",
    message: `Loan ${loan.loanNumber} for ${customer.name} has been approved.`,
    type: "SUCCESS",
    loanId: loan.id,
    customerId: customer.id,
  });

export const notifyLoanRejected = (
  loan: { id: string; loanNumber: string },
  customer: { id: string; name: string },
  reason: string
) =>
  createNotification({
    title: "Loan Rejected",
    message: `Loan ${loan.loanNumber} for ${customer.name} was rejected. Reason: ${reason}`,
    type: "ERROR",
    loanId: loan.id,
    customerId: customer.id,
  });

export const notifyLoanClosed = (
  loan: { id: string; loanNumber: string },
  customer: { id: string; name: string }
) =>
  createNotification({
    title: "Loan Closed",
    message: `Loan ${loan.loanNumber} for ${customer.name} has been fully repaid and closed.`,
    type: "SUCCESS",
    loanId: loan.id,
    customerId: customer.id,
  });

export const notifyLoanOverdue = (
  loan: { id: string; loanNumber: string },
  customer: { id: string; name: string },
  installmentNo: number
) =>
  createNotification({
    title: "Loan Overdue",
    message: `Installment #${installmentNo} for Loan ${loan.loanNumber} (${customer.name}) is overdue.`,
    type: "WARNING",
    loanId: loan.id,
    customerId: customer.id,
  });

export const notifyPaymentReceived = (
  payment: { amount: number },
  loan: { id: string; loanNumber: string },
  customer: { id: string; name: string }
) =>
  createNotification({
    title: "Payment Received",
    message: `${formatCurrency(payment.amount)} payment received for Loan ${loan.loanNumber} (${customer.name}).`,
    type: "SUCCESS",
    loanId: loan.id,
    customerId: customer.id,
  });

// ================= QUERIES =================

export const getNotifications = async (
  page = 1,
  limit = 20,
  unreadOnly = false
) => {
  const skip = (page - 1) * limit;
  const where = unreadOnly ? { isRead: false } : {};

  const [notifications, total, unreadCount] = await Promise.all([
    prisma.notification.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.notification.count({ where }),
    prisma.notification.count({ where: { isRead: false } }),
  ]);

  return {
    notifications,
    total,
    unreadCount,
    page,
    limit,
    totalPages: Math.ceil(total / limit) || 1,
  };
};

export const getUnreadNotificationCount = async () => {
  return prisma.notification.count({ where: { isRead: false } });
};

export const markNotificationRead = async (id: string) => {
  return prisma.notification.update({
    where: { id },
    data: { isRead: true },
  });
};

export const markAllNotificationsRead = async () => {
  const result = await prisma.notification.updateMany({
    where: { isRead: false },
    data: { isRead: true },
  });
  return result.count;
};

export const deleteNotification = async (id: string) => {
  return prisma.notification.delete({ where: { id } });
};
