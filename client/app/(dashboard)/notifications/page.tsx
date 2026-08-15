// app/(dashboard)/notifications/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationItem } from "@/types/notification";
import {
  NOTIFICATION_SEVERITY_STYLES,
  NOTIFICATION_TITLE_ICONS,
  DEFAULT_NOTIFICATION_ICON,
  getNotificationHref,
} from "@/utils/notificationDisplay";

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationRow({
  item,
  onOpen,
}: {
  item: NotificationItem;
  onOpen: (item: NotificationItem) => void;
}) {
  const Icon = NOTIFICATION_TITLE_ICONS[item.title] ?? DEFAULT_NOTIFICATION_ICON;
  const style = NOTIFICATION_SEVERITY_STYLES[item.type] ?? NOTIFICATION_SEVERITY_STYLES.INFO;
  const href = getNotificationHref(item);

  return (
    <button
      type="button"
      onClick={() => onOpen(item)}
      disabled={!href}
      className={`w-full flex items-start gap-3 px-4 py-3.5 text-left border-b border-[#E5E7EB] last:border-0 transition-colors ${
        item.isRead ? "bg-white hover:bg-[#F8FAFC]" : "bg-[#F0F6FC] hover:bg-[#E6F1FB]"
      } ${href ? "cursor-pointer" : "cursor-default"}`}
    >
      <div
        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: style.bg }}
      >
        <Icon size={16} style={{ color: style.color }} />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-semibold text-[#1A1A18] truncate">{item.title}</p>
          {!item.isRead && (
            <span className="w-2 h-2 rounded-full bg-[#378ADD] shrink-0" aria-label="Unread" />
          )}
        </div>
        <p className="text-sm text-[#45443E] mt-0.5">{item.message}</p>
        <p className="text-xs text-[#6B6A62] mt-1">{formatDateTime(item.createdAt)}</p>
      </div>
    </button>
  );
}

export default function NotificationsPage() {
  const router = useRouter();
  const {
    notifications,
    unreadCount,
    filter,
    setFilter,
    loading,
    error,
    refetch,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const handleOpen = (item: NotificationItem) => {
    if (!item.isRead) markAsRead(item.id);

    const href = getNotificationHref(item);
    if (href) router.push(href);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Notifications</h1>
          <p className="text-sm text-[#45443E]">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        <button
          type="button"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
          className="text-sm font-medium px-4 py-2 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Mark all as read
        </button>
      </div>

      <div className="flex items-center gap-1">
        {(["all", "unread"] as const).map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`text-sm px-3 py-1.5 rounded-full transition-colors ${
              filter === key
                ? "bg-[#FAEEDA] text-[#854F0B] font-medium"
                : "text-[#45443E] hover:bg-[#ECE9DF]"
            }`}
          >
            {key === "all" ? "All" : "Unread"}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white overflow-hidden">
        {loading ? (
          <div className="p-5 space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-12 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-[#993C1D] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
            {filter === "unread" ? "No unread notifications." : "No notifications yet."}
          </div>
        ) : (
          notifications.map((item) => (
            <NotificationRow key={item.id} item={item} onOpen={handleOpen} />
          ))
        )}
      </div>
    </div>
  );
}
