// components/tables/AdminCustomerTable.tsx
// Redesigned table for the admin Customers list page only — checkbox
// column (visual only, no bulk actions), stacked avatar/name/code cell,
// dot status badges, hover + clickable rows, "View ->" action.
//
// Deliberately a separate component from tables/CustomerTable.tsx, which
// stays untouched and keeps its current look on the Partner customers page
// and the admin Customer reports page — neither was part of this redesign.
"use client";

import { useState } from "react";
import type { Customer } from "@/types/customer";
import { formatDate, formatRelativeTime } from "@/utils/formatDate";
import StatusDot from "@/components/ui/StatusDot";

const STATUS_STYLE: Record<Customer["status"], { color: string; label: string }> = {
  ACTIVE: { color: "#3B6D11", label: "Active" },
  BLOCKED: { color: "#993C1D", label: "Blocked" },
  CLOSED: { color: "#6B6A62", label: "Closed" },
};

function maskAadhaar(value?: string | null) {
  if (!value) return "—";
  return `XXXX XXXX ${value.slice(-4)}`;
}

export default function AdminCustomerTable({
  customers,
  onView,
}: {
  customers: Customer[];
  onView: (id: string) => void;
}) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (customers.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No customers found.
      </div>
    );
  }

  const allSelected = customers.every((c) => selected.has(c.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(customers.map((c) => c.id)));
  };

  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full min-w-215 text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                aria-label="Select all customers"
              />
            </th>
            <th className="py-2 px-4 font-medium">Customer</th>
            <th className="py-2 px-4 font-medium">Phone</th>
            <th className="py-2 px-4 font-medium">Aadhaar</th>
            <th className="py-2 px-4 font-medium">City</th>
            <th className="py-2 px-4 font-medium">Status</th>
            <th className="py-2 px-4 font-medium">Registered</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {customers.map((c) => {
            const initials = c.name
              .split(" ")
              .filter(Boolean)
              .map((w) => w[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();
            const status = STATUS_STYLE[c.status] ?? STATUS_STYLE.CLOSED;

            return (
              <tr
                key={c.id}
                onClick={() => onView(c.id)}
                className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors cursor-pointer"
              >
                <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={selected.has(c.id)}
                    onChange={() => toggleOne(c.id)}
                    className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    aria-label={`Select ${c.name}`}
                  />
                </td>
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 shrink-0 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-[11px] font-semibold">
                      {initials}
                    </div>
                    <div>
                      <p className="text-[#1A1A18] font-medium leading-tight">{c.name}</p>
                      <p className="text-xs text-[#6B6A62] leading-tight">{c.customerCode}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3 px-4 text-[#45443E]">{c.phone}</td>
                <td className="py-3 px-4 text-[#45443E]">{maskAadhaar(c.aadhaarNumber)}</td>
                <td className="py-3 px-4 text-[#45443E]">{c.city ?? "—"}</td>
                <td className="py-3 px-4">
                  <StatusDot color={status.color} label={status.label} />
                </td>
                <td className="py-3 px-4">
                  <p className="text-[#45443E]">{formatDate(c.createdAt)}</p>
                  <p className="text-xs text-[#9C9A8D]">{formatRelativeTime(c.createdAt)}</p>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
