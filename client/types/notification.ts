// types/notification.ts

export type NotificationSeverity = "INFO" | "SUCCESS" | "WARNING" | "ERROR";

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type: NotificationSeverity;
  isRead: boolean;
  createdAt: string;
  adminId?: string | null;
  customerId?: string | null;
  partnerId?: string | null;
  loanId?: string | null;
}

export interface NotificationListResponse {
  success: boolean;
  notifications: NotificationItem[];
  total: number;
  unreadCount: number;
  page: number;
  limit: number;
  totalPages: number;
}
