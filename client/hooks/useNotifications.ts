// hooks/useNotifications.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification";

export type NotificationFilter = "all" | "unread";

export function useNotifications() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<NotificationFilter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getNotifications({
        limit: 50,
        unreadOnly: filter === "unread",
      });
      setNotifications(result.notifications);
      setUnreadCount(result.unreadCount);
    } catch (err) {
      console.error(err);
      setError("Could not load notifications. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const markAsRead = useCallback(
    async (id: string) => {
      const target = notifications.find((n) => n.id === id);
      if (!target || target.isRead) return;

      try {
        await markNotificationRead(id);
      } catch (err) {
        console.error(err);
        return;
      }

      setNotifications((prev) =>
        filter === "unread"
          ? prev.filter((n) => n.id !== id)
          : prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    },
    [notifications, filter]
  );

  const markAllAsRead = useCallback(async () => {
    try {
      await markAllNotificationsRead();
      await load();
    } catch (err) {
      console.error(err);
    }
  }, [load]);

  return {
    notifications,
    unreadCount,
    filter,
    setFilter,
    loading,
    error,
    refetch: load,
    markAsRead,
    markAllAsRead,
  };
}
