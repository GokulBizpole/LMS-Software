// components/tables/AuditLogTable.tsx
"use client";

import { useState } from "react";
import type { AuditLog } from "@/types/audit";
import StatusDot from "@/components/ui/StatusDot";

const ACTION_COLORS: Record<string, string> = {
  CREATE: "#3B6D11",
  UPDATE: "#185FA5",
  DELETE: "#993C1D",
};

function formatDateTime(dateStr: string): string {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AuditLogTable({ logs }: { logs: AuditLog[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No audit logs found.
      </div>
    );
  }

  const allSelected = logs.every((l) => selected.has(l.id));

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(logs.map((l) => l.id)));
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
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
            <th className="py-2 px-4 w-10">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={toggleAll}
                className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                aria-label="Select all logs"
              />
            </th>
            <th className="py-2 px-4 font-medium">Date &amp; time</th>
            <th className="py-2 px-4 font-medium">Admin</th>
            <th className="py-2 px-4 font-medium">Action</th>
            <th className="py-2 px-4 font-medium">Table</th>
            <th className="py-2 px-4 font-medium">Record ID</th>
            <th className="py-2 px-4 font-medium">IP address</th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {logs.map((log) => (
            <tr key={log.id} className="border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] transition-colors">
              <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                <input
                  type="checkbox"
                  checked={selected.has(log.id)}
                  onChange={() => toggleOne(log.id)}
                  className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                  aria-label={`Select log ${log.id}`}
                />
              </td>
              <td className="py-3 px-4 text-[#45443E] whitespace-nowrap">
                {formatDateTime(log.createdAt)}
              </td>
              <td className="py-3 px-4 text-[#1A1A18]">
                {log.admin ? log.admin.name : "System"}
              </td>
              <td className="py-3 px-4">
                <StatusDot color={ACTION_COLORS[log.action] ?? "#6B6A62"} label={log.action} />
              </td>
              <td className="py-3 px-4 text-[#45443E]">{log.tableName}</td>
              <td className="py-3 px-4 text-[#6B6A62] max-w-45 truncate">
                {log.recordId}
              </td>
              <td className="py-3 px-4 text-[#6B6A62]">{log.ipAddress || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
