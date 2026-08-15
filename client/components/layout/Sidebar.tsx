// components/layout/Sidebar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Partners", href: "/partners", icon: Handshake },
  { label: "Loans", href: "/loans", icon: FileText },
  { label: "Payments", href: "/payments", icon: Wallet },
  { label: "Expenses", href: "/expenses", icon: Receipt },
  { label: "Reports", href: "/reports", icon: BarChart3 },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-55 shrink-0 bg-[#ECE9DF] border-r border-[#C4C1B3] min-h-screen flex flex-col p-4">
      <div className="flex items-center gap-2 mb-3 px-1">
        <div className="w-8 h-8 rounded-lg bg-[#1A1A18] flex items-center justify-center text-white text-sm font-semibold">
          ₹
        </div>
        <span className="text-[15px] font-semibold text-[#1A1A18]">
          FinLoan
        </span>
      </div>

      <span className="self-start mb-6 px-2 py-0.5 rounded-md bg-[#1A1A18] text-white text-[10px] font-semibold tracking-wide">
        ADMIN
      </span>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                isActive
                  ? "bg-[#E6F1FB] text-[#185FA5] font-medium"
                  : "text-[#45443E] hover:bg-white"
              }`}
            >
              <Icon size={16} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}