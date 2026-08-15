// components/layout/NotificationDropdown.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/services/notification.service";
import type { NotificationItem } from "@/types/notification";
import {
  NOTIFICATION_SEVERITY_STYLES,
  NOTIFICATION_TITLE_ICONS,
  DEFAULT_NOTIFICATION_ICON,
  formatRelativeTime,
  getNotificationHref,
} from "@/utils/notificationDisplay";

export default function NotificationDropdown({
  onClose,
  onRead,
}: {
  onClose: () => void;
  onRead: () => void;
}) {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    getNotifications({ limit: 6 })
      .then((result) => {
        if (active) setNotifications(result.notifications);
      })
      .catch((err) => console.error(err))
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const handleOpen = async (item: NotificationItem) => {
    if (!item.isRead) {
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, isRead: true } : n))
      );
      onRead();
      try {
        await markNotificationRead(item.id);
      } catch (err) {
        console.error(err);
      }
    }

    onClose();
    const href = getNotificationHref(item);
    if (href) router.push(href);
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    onRead();
    try {
      await markAllNotificationsRead();
    } catch (err) {
      console.error(err);
    }
  };

  const handleViewAll = () => {
    onClose();
    router.push("/notifications");
  };

  const hasUnread = notifications.some((n) => !n.isRead);

  return (
    <div className="absolute right-0 top-11 w-90 rounded-2xl border border-[#E5E7EB] bg-white shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E7EB]">
        <p className="text-sm font-semibold text-[#1A1A18]">Notifications</p>
        <button
          type="button"
          onClick={handleMarkAllRead}
          disabled={!hasUnread}
          className="text-xs font-medium text-[#185FA5] hover:underline disabled:opacity-40 disabled:cursor-not-allowed disabled:no-underline"
        >
          Mark all as read
        </button>
      </div>

      <div className="max-h-96 overflow-y-auto">
        {loading ? (
          <div className="p-4 space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-24 text-sm text-[#6B6A62]">
            No notifications yet.
          </div>
        ) : (
          notifications.map((item) => {
            const Icon = NOTIFICATION_TITLE_ICONS[item.title] ?? DEFAULT_NOTIFICATION_ICON;
            const style =
              NOTIFICATION_SEVERITY_STYLES[item.type] ?? NOTIFICATION_SEVERITY_STYLES.INFO;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleOpen(item)}
                className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-[#E5E7EB] last:border-0 transition-colors ${
                  item.isRead ? "bg-white hover:bg-[#F8FAFC]" : "bg-[#F0F6FC] hover:bg-[#E6F1FB]"
                }`}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: style.bg }}
                >
                  <Icon size={14} style={{ color: style.color }} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="text-xs font-semibold text-[#1A1A18] truncate">{item.title}</p>
                    {!item.isRead && (
                      <span className="w-1.5 h-1.5 rounded-full bg-[#378ADD] shrink-0" />
                    )}
                  </div>
                  <p className="text-xs text-[#45443E] mt-0.5 line-clamp-2">{item.message}</p>
                  <p className="text-[11px] text-[#6B6A62] mt-1">
                    {formatRelativeTime(item.createdAt)}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>

      <button
        type="button"
        onClick={handleViewAll}
        className="w-full text-center text-sm font-medium text-[#185FA5] py-3 border-t border-[#E5E7EB] hover:bg-[#F8FAFC]"
      >
        View all notifications
      </button>
    </div>
  );
}
