// components/tables/AuditLogTable.tsx
"use client";

import type { AuditLog } from "@/types/audit";

const ACTION_STYLES: Record<string, { bg: string; text: string }> = {
  CREATE: { bg: "#EAF3DE", text: "#3B6D11" },
  UPDATE: { bg: "#E6F1FB", text: "#185FA5" },
  DELETE: { bg: "#FAECE7", text: "#993C1D" },
};

function ActionBadge({ action }: { action: string }) {
  const s = ACTION_STYLES[action] ?? { bg: "#ECE9DF", text: "#45443E" };
  return (
    <span
      className="text-[11px] font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: s.bg, color: s.text }}
    >
      {action}
    </span>
  );
}

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
  if (logs.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-sm text-[#6B6A62]">
        No audit logs found.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-[#E5E7EB]">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[#6B6A62] text-xs bg-[#F8FAFC] border-b border-[#E5E7EB]">
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
            <tr key={log.id} className="border-b border-[#E5E7EB] last:border-0">
              <td className="py-3 px-4 text-[#45443E] whitespace-nowrap">
                {formatDateTime(log.createdAt)}
              </td>
              <td className="py-3 px-4 text-[#1A1A18]">
                {log.admin ? log.admin.name : "System"}
              </td>
              <td className="py-3 px-4">
                <ActionBadge action={log.action} />
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
