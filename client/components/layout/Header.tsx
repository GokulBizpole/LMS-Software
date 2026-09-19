
"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Bell, LogOut, Menu, ChevronLeft, Search, Moon, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useUnreadNotificationCount } from "@/hooks/useUnreadNotificationCount";
import { useAdminPartnerActivityStream } from "@/hooks/useAdminPartnerActivityStream";
import { getMyProfile } from "@/services/partnerProfile.service";
import { partnerFileUrl } from "@/services/partner.service";
import { ADMIN_NAV_ITEMS } from "@/config/adminNav";
import NotificationDropdown from "./NotificationDropdown";

export default function Header({ onMenuClick }: { onMenuClick?: () => void } = {}) {
  const { user, loading, logout } = useAuth();
  const isPartner = user?.role === "PARTNER";
  const router = useRouter();
  const pathname = usePathname();
  const currentPage = ADMIN_NAV_ITEMS.find((item) => pathname?.startsWith(item.href));
  const { count: unreadCount, refetch: refetchUnreadCount } = useUnreadNotificationCount(!loading && !isPartner);
  // Native Windows notifications for partner activity — only ever connects
  // for an admin session running inside the Electron shell (see the hook).
  useAdminPartnerActivityStream(!loading && !isPartner);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationsRef = useRef<HTMLDivElement>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Read-only: the partner's own photo, managed exclusively by Admin via the
  // Partner Create/Edit form — there is no partner-facing way to change it.
  const [partnerPhotoUrl, setPartnerPhotoUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!isPartner) return;

    const load = () => {
      getMyProfile()
        .then((p) => setPartnerPhotoUrl(p.profilePicture ? partnerFileUrl(p.profilePicture) : null))
        .catch(() => setPartnerPhotoUrl(null));
    };
    load();
  }, [isPartner]);

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

  useEffect(() => {
    if (!showUserMenu) return;

    function handleClickOutside(e: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showUserMenu]);

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="h-16 border-b border-[#C4C1B3] bg-white flex items-center justify-between gap-4 px-6">
      <div className="flex items-center gap-3 min-w-0">
        {onMenuClick && (
          <button
            type="button"
            onClick={onMenuClick}
            className="lg:hidden w-9 h-9 shrink-0 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
            aria-label="Open menu"
          >
            <Menu size={18} />
          </button>
        )}

        {!isPartner && currentPage && (
          <>
            <button
              type="button"
              onClick={() => router.back()}
              aria-label="Go back"
              className="hidden sm:flex w-8 h-8 shrink-0 rounded-full items-center justify-center text-[#6B6A62] hover:bg-[#ECE9DF]"
            >
              <ChevronLeft size={18} />
            </button>
            <h1 className="hidden sm:block text-base font-bold text-[#1A1A18] truncate">
              {currentPage.label}
            </h1>
          </>
        )}
      </div>

      <div className="flex items-center gap-3">
        {!isPartner && (
          <div className="relative hidden md:block">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
            <input
              type="text"
              placeholder="Search..."
              className="w-52 rounded-lg border border-[#C4C1B3] pl-8 pr-3 py-1.5 text-sm text-[#1A1A18]"
            />
          </div>
        )}

        {!isPartner && (
          <button
            type="button"
            aria-label="Toggle theme"
            className="w-9 h-9 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
          >
            <Moon size={16} />
          </button>
        )}

      {!isPartner && (
        <div className="relative" ref={notificationsRef}>
          <button
            type="button"
            onClick={() => setShowNotifications((v) => !v)}
            className="relative w-9 h-9 rounded-full flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
            aria-label="Notifications"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E31E24] border border-white" />
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

      {isPartner ? (
        <Link
          href="/partner/profile"
          className="flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-[#ECE9DF] transition-colors"
        >
          <div className="w-8 h-8 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] text-xs font-semibold overflow-hidden">
            {partnerPhotoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={partnerPhotoUrl} alt={user?.name ?? "Partner"} className="w-full h-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="text-sm leading-tight hidden sm:block">
            <p className="font-medium text-[#1A1A18]">{user?.name ?? "Admin"}</p>
            <p className="text-xs text-[#6B6A62]">{user?.role ?? ""}</p>
          </div>
        </Link>
      ) : (
        <div className="relative" ref={userMenuRef}>
          <button
            type="button"
            onClick={() => setShowUserMenu((v) => !v)}
            className="flex items-center gap-2 rounded-lg px-2 py-1 -mx-2 -my-1 hover:bg-[#ECE9DF] transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-[#E31E24] flex items-center justify-center text-white text-xs font-semibold">
              {initials}
            </div>
            <div className="text-sm leading-tight hidden sm:block">
              <p className="font-medium text-[#1A1A18]">{user?.name ?? "Admin"}</p>
              <p className="text-xs text-[#6B6A62]">{user?.role ?? ""}</p>
            </div>
            <ChevronDown size={14} className="hidden sm:block text-[#6B6A62]" />
          </button>

          {showUserMenu && (
            <div className="absolute right-0 z-20 mt-2 w-64 rounded-xl border border-[#E5E7EB] bg-white shadow-lg overflow-hidden">
              <div className="p-4 border-b border-[#E5E7EB]">
                <p className="text-sm font-semibold text-[#1A1A18]">{user?.name ?? "Admin"}</p>
                <p className="text-xs text-[#6B6A62] mb-2">{user?.email ?? ""}</p>
                <span className="inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E31E24]/10 text-[#E31E24]">
                  {user?.role ?? "Admin"}
                </span>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full flex items-center gap-2 text-sm font-medium text-[#E31E24] px-4 py-3 hover:bg-[#FAECE7] transition-colors"
              >
                <LogOut size={15} />
                Sign out
              </button>
            </div>
          )}
        </div>
      )}

      {isPartner && (
        <button
          type="button"
          onClick={logout}
          className="w-9 h-9 rounded-full border border-[#C4C1B3] flex items-center justify-center text-[#E31E24] hover:bg-[#FAECE7]"
          aria-label="Logout"
        >
          <LogOut size={16} />
        </button>
      )}
      </div>
    </header>
  );
}