// config/adminNav.ts
// Single source of truth for the admin sidebar's sections/links, reused by
// the Header to derive the current page's title from the route.
import {
  LayoutDashboard,
  Users,
  Handshake,
  FileText,
  Receipt,
  Wallet,
  BarChart3,
  Settings,
  ClipboardCheck,
  Clock,
  AlertTriangle,
  Boxes,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export interface AdminNavSection {
  label: string;
  items: AdminNavItem[];
}

export const ADMIN_NAV_SECTIONS: AdminNavSection[] = [
  {
    label: "Navigation",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
      { label: "Customers", href: "/customers", icon: Users },
      { label: "Groups", href: "/groups", icon: Boxes },
      { label: "Partners", href: "/partners", icon: Handshake },
      { label: "Loans", href: "/loans", icon: FileText },
      { label: "Payments", href: "/payments", icon: Wallet },
      { label: "Expenses", href: "/expenses", icon: Receipt },
    ],
  },
  {
    label: "Reports",
    items: [
      { label: "EOD Reports", href: "/eod", icon: ClipboardCheck },
      { label: "Reports", href: "/reports", icon: BarChart3 },
    ],
  },
  {
    label: "Alerts",
    items: [
      { label: "Due Today", href: "/due-today", icon: Clock },
      { label: "Overdue", href: "/overdue", icon: AlertTriangle },
    ],
  },
  {
    label: "System",
    items: [{ label: "Settings", href: "/settings", icon: Settings }],
  },
];

export const ADMIN_NAV_ITEMS: AdminNavItem[] = ADMIN_NAV_SECTIONS.flatMap((s) => s.items);
