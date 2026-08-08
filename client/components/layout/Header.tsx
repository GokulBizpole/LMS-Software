
"use client";

import { Bell, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Header() {
  const { user, logout } = useAuth();

  const initials = user?.name
    ? user.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : "AD";

  return (
    <header className="h-16 border-b border-[#D3D1C7] bg-white flex items-center justify-end gap-4 px-6">
      <button
        type="button"
        className="w-9 h-9 rounded-full border border-[#D3D1C7] flex items-center justify-center text-[#5F5E5A] hover:bg-[#F1EFE8]"
        aria-label="Notifications"
      >
        <Bell size={16} />
      </button>

      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] text-xs font-semibold">
          {initials}
        </div>
        <div className="text-sm leading-tight hidden sm:block">
          <p className="font-medium text-[#2C2C2A]">{user?.name ?? "Admin"}</p>
          <p className="text-xs text-[#888780]">{user?.role ?? ""}</p>
        </div>
      </div>

      <button
        type="button"
        onClick={logout}
        className="w-9 h-9 rounded-full border border-[#D3D1C7] flex items-center justify-center text-[#993C1D] hover:bg-[#FAECE7]"
        aria-label="Logout"
      >
        <LogOut size={16} />
      </button>
    </header>
  );
}