// components/tables/CustomerTable.tsx
import Link from "next/link";
import type { Customer } from "@/types/customer";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Customer["status"] }) {
  const map: Record<Customer["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    BLOCKED: { bg: "#FAEEDA", text: "#854F0B" },
    CLOSED: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.CLOSED;
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function maskAadhaar(value?: string | null) {
  if (!value) return "—";
  return `XXXX XXXX ${value.slice(-4)}`;
}

export default function CustomerTable({
  customers,
}: {
  customers: Customer[];
}) {
  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No customers found.
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
            <th className="py-2 px-4 font-medium">Aadhaar</th>
            <th className="py-2 px-4 font-medium">City</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Registered</th>
            <th className="py-2 px-4 font-medium text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {customers.map((c) => {
            const initials = c.name
              .split(" ")
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <tr key={c.id} className="border-b border-[#E5E7EB] last:border-0">
                <td className="py-3 px-4 text-[#1A1A18] font-medium">{c.customerCode}</td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-[11px] font-semibold">
                      {initials}
                    </div>
                    <span className="text-[#1A1A18]">{c.name}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#45443E]">{c.phone}</td>
                <td className="py-3 px-4 text-[#45443E]">{maskAadhaar(c.aadhaarNumber)}</td>
                <td className="py-3 px-4 text-[#45443E]">{c.city ?? "—"}</td>
                <td className="py-3 px-4"><StatusBadge status={c.status} /></td>
                <td className="py-3 px-4 text-[#45443E]">{formatDate(c.createdAt)}</td>
                <td className="py-3 px-4 text-right">
                  <Link
                    href={`/customers/${c.id}`}
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
