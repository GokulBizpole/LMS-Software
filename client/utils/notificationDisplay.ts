// utils/notificationDisplay.ts
import {
  Bell,
  Handshake,
  PiggyBank,
  Wallet,
  UserCog,
  UserPlus,
  FileText,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Receipt,
  type LucideIcon,
} from "lucide-react";
import type { NotificationItem, NotificationSeverity } from "@/types/notification";

export const NOTIFICATION_SEVERITY_STYLES: Record<
  NotificationSeverity,
  { bg: string; color: string }
> = {
  SUCCESS: { bg: "#EAF3DE", color: "#3B6D11" },
  WARNING: { bg: "#FAEEDA", color: "#854F0B" },
  ERROR: { bg: "#FAECE7", color: "#993C1D" },
  INFO: { bg: "#E6F1FB", color: "#185FA5" },
};

export const NOTIFICATION_TITLE_ICONS: Record<string, LucideIcon> = {
  "New Partner Created": Handshake,
  "Partner Investment Received": PiggyBank,
  "Partner Investment Updated": Wallet,
  "Partner Status Changed": UserCog,
  "New Customer Created": UserPlus,
  "New Loan Submitted": FileText,
  "Loan Approved": CheckCircle2,
  "Loan Rejected": XCircle,
  "Loan Closed": CheckCircle2,
  "Loan Overdue": AlertTriangle,
  "Payment Received": Receipt,
};

export const DEFAULT_NOTIFICATION_ICON: LucideIcon = Bell;

export function getNotificationHref(item: NotificationItem): string | null {
  if (item.loanId) return `/loans/${item.loanId}`;
  if (item.partnerId) return `/partners/${item.partnerId}`;
  if (item.customerId) return `/customers/${item.customerId}`;
  return null;
}

export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  const diffMin = Math.floor((Date.now() - date.getTime()) / 60000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;

  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr}h ago`;

  const diffDay = Math.floor(diffHr / 24);
  if (diffDay < 7) return `${diffDay}d ago`;

  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}
