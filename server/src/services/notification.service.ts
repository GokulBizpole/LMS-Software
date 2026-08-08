import prisma from "../config/db";

interface CreateNotificationData {
  title: string;
  message: string;
  type?: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  adminId?: string;
  customerId?: string;
  partnerId?: string;
  loanId?: string;
}

export const createNotification = async (
  data: CreateNotificationData
) => {
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
};

export const getNotifications = async () => {
  return await prisma.notification.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });
};

export const markNotificationRead = async (id: string) => {
  return await prisma.notification.update({
    where: { id },
    data: {
      isRead: true,
    },
  });
};

export const deleteNotification = async (id: string) => {
  return await prisma.notification.delete({
    where: { id },
  });
};