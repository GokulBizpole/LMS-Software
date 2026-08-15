// components/dashboard/RecentActivityTable.tsx
import type { RecentActivityItem } from "@/hooks/useRecentActivity";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function TypeBadge({ type }: { type: RecentActivityItem["type"] }) {
  const isPayment = type === "PAYMENT";
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{
        backgroundColor: isPayment ? "#EAF3DE" : "#FAECE7",
        color: isPayment ? "#3B6D11" : "#993C1D",
      }}
    >
      {isPayment ? "Payment" : "Expense"}
    </span>
  );
}

export default function RecentActivityTable({ items }: { items: RecentActivityItem[] }) {
  if (items.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No recent activity.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Type</th>
            <th className="py-2 px-4 font-medium">Description</th>
            <th className="py-2 px-4 font-medium">Date</th>
            <th className="py-2 px-4 font-medium text-right">Debit</th>
            <th className="py-2 px-4 font-medium text-right">Credit</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {items.map((item) => (
            <tr key={item.id} className="border-b border-[#E5E7EB] last:border-0">
              <td className="py-3 px-4"><TypeBadge type={item.type} /></td>
              <td className="py-3 px-4 text-[#1A1A18]">{item.description}</td>
              <td className="py-3 px-4 text-[#45443E]">{formatDate(item.date)}</td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">
                {item.debit > 0 ? formatCurrency(item.debit) : "—"}
              </td>
              <td className="py-3 px-4 text-[#1A1A18] text-right">
                {item.credit > 0 ? formatCurrency(item.credit) : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
