// components/layout/PartnerSidebar.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FileText,
  Wallet,
  PiggyBank,
  BarChart3,
  UserCircle,
  ClipboardCheck,
} from "lucide-react";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/partner/dashboard", icon: LayoutDashboard },
  { label: "Customers", href: "/partner/customers", icon: Users },
  { label: "Loans", href: "/partner/loans", icon: FileText },
  { label: "Payments", href: "/partner/payments", icon: Wallet },
  { label: "Investments", href: "/partner/investments", icon: PiggyBank },
  { label: "EOD", href: "/partner/eod", icon: ClipboardCheck },
  { label: "Reports", href: "/partner/reports", icon: BarChart3 },
  { label: "Profile", href: "/partner/profile", icon: UserCircle },
];

export default function PartnerSidebar({
  isOpen = false,
  onClose,
}: {
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside
        className={`w-55 shrink-0 bg-[#ECE9DF] border-r border-[#C4C1B3] min-h-screen flex flex-col p-4 fixed inset-y-0 left-0 z-40 transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
      <div className="flex items-center gap-2 mb-3 px-1">
        <Image src="/logo.svg" alt="SKA Trust" width={32} height={32} />
        <span className="text-[15px] font-semibold text-[#1A1A18]">
          SKA Trust
        </span>
      </div>

      <span className="self-start mb-6 px-2 py-0.5 rounded-md bg-[#185FA5] text-white text-[10px] font-semibold tracking-wide">
        PARTNER
      </span>

      <nav className="flex flex-col gap-1 flex-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname?.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
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
    </>
  );
}
