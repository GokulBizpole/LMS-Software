// components/tables/PartnerTable.tsx
import Link from "next/link";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#ECE9DF", text: "#45443E" },
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
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No partners found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 font-medium">Code</th>
            <th className="py-2 px-4 font-medium">Name</th>
            <th className="py-2 px-4 font-medium">Phone</th>
            <th className="py-2 px-4 font-medium">Email</th>
            <th className="py-2 px-4 font-medium text-right">Investment</th>
            <th className="py-2 px-4 font-medium text-right">Balance</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {partners.map((p) => {
            const initials = p.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <tr key={p.id} className="border-b border-[#E5E7EB] last:border-0">
                <td className="py-3 px-4 text-[#1A1A18] font-medium">{p.partnerCode}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#EEEDFE] flex items-center justify-center text-[#534AB7] text-[11px] font-semibold">
                      {initials}
                    </div>
                    <span className="text-[#1A1A18]">{p.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#45443E]">{p.phone}</td>
                <td className="py-3 px-4 text-[#45443E]">{p.email}</td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(p.investmentAmount)}</td>
                <td className="py-3 px-4 text-[#1A1A18] text-right">{formatCurrency(p.currentBalance)}</td>
                <td className="py-3 px-4"><StatusBadge status={p.status} /></td>
                <td className="py-3 px-4 text-right">
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
