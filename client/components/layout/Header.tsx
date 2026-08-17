
"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import NotificationDropdown from "./NotificationDropdown";

export default function Header() {
  const { user, loading, logout } = useAuth();
  const isPartner = user?.role === "PARTNER";
  const { count: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount(!loading && !isPartner);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showNotifications) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(e.target as Node)
      ) {
        setShowNotifications(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showNotifications]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="h-16 border-b border-[#C4C1B3] bg-white flex items-center justify-end gap-4 px-6">
      {!isPartner && (
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-9 h-9 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-4.5 h-4.5 px-1 rounded-full bg-[#993C1D] text-white text-[10px] font-semibold flex items-center justify-center">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <NotificationDropdown
              onClose={() => setShowNotifications(false)}
              onRead={refetchUnreadCount}
            />
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] text-xs font-semibold">
          {initials}
        </div>
        <div className="text-sm leading-tight hidden sm:block">
          <p className="font-medium text-[#1A1A18]">{user?.name ?? "Admin"}</p>
          <p className="text-xs text-[#6B6A62]">{user?.role ?? ""}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-9 h-9 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#993C1D] hover:bg-[#FAECE7]"
        aria-label="Logout"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}