// components/tables/PartnerTable.tsx
import Link from "next/link";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#F1EFE8", text: "#5F5E5A" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

export default function PartnerTable({ partners }: { partners: Partner[] }) {
  if (partners.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#888780]">
        No partners found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#888780] text-xs border-b border-[#E8E6DF]">
            <th className="py-2 pr-4 font-medium">Code</th>
            <th className="py-2 pr-4 font-medium">Name</th>
            <th className="py-2 pr-4 font-medium">Phone</th>
            <th className="py-2 pr-4 font-medium">Email</th>
            <th className="py-2 pr-4 font-medium">Investment</th>
            <th className="py-2 pr-4 font-medium">Balance</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {partners.map((p) => {
            const initials = p.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <tr key={p.id} className="border-b border-[#F1EFE8] last:border-0">
                <td className="py-3 pr-4 text-[#2C2C2A] font-medium">{p.partnerCode}</td>
                <td className="py-3 pr-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-[11px] font-semibold">
                      {initials}
                    </div>
                    <span className="text-[#2C2C2A]">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 pr-4 text-[#5F5E5A]">{p.phone}</td>
                <td className="py-3 pr-4 text-[#5F5E5A]">{p.email}</td>
                <td className="py-3 pr-4 text-[#2C2C2A]">{formatCurrency(p.investmentAmount)}</td>
                <td className="py-3 pr-4 text-[#2C2C2A]">{formatCurrency(p.currentBalance)}</td>
                <td className="py-3 pr-4"><StatusBadge status={p.status} /></td>
                <td className="py-3 pr-4 text-right">
                  <Link
                    href={`/partners/${p.id}`}
                    className="text-[#185FA5] font-medium hover:underline"
                  >
                    View
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}