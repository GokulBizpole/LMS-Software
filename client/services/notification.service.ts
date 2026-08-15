// services/notification.service.ts
import api from "@/lib/axios";
import type { NotificationListResponse } from "@/types/notification";

export interface GetNotificationsParams {
  page?: number;
  limit?: number;
  unreadOnly?: boolean;
}

export async function getNotifications(
  params: GetNotificationsParams = {}
): Promise<NotificationListResponse> {
  const { data } = await api.get<NotificationListResponse>("/notifications", {
    params,
  });

  if (!data.success) {
    throw new Error("Failed to load notifications");
  }

  return data;
}

export async function getUnreadNotificationCount(): Promise<number> {
  const { data } = await api.get<{ success: boolean; count: number }>(
    "/notifications/unread-count"
  );

  if (!data.success) {
    throw new Error("Failed to load unread notification count");
  }

  return data.count;
}

export async function markNotificationRead(id: string): Promise<void> {
  const { data } = await api.put(`/notifications/${id}/read`);

  if (!data.success) {
    throw new Error("Failed to mark notification as read");
  }
}

export async function markAllNotificationsRead(): Promise<void> {
  const { data } = await api.put("/notifications/read-all");

  if (!data.success) {
    throw new Error("Failed to mark all notifications as read");
  }
}
