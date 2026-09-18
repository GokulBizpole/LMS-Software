// components/ui/ListStatCard.tsx
// Lightweight KPI card for list-page headers (Total/Active/Blocked/Added
// this month style) — plain white card with a small colored icon chip, no
// trend line. Distinct from dashboard/StatCard.tsx, which is trend-aware and
// uses the icon color as the whole card background.
import type { LucideIcon } from "lucide-react";

export default function ListStatCard({
  label,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  badge,
}: {
  label: string;
  value: number | string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  badge?: string;
}) {
  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-4 flex items-center justify-between gap-3">
      <div>
        <div className="flex items-center gap-1.5 text-xs text-[#6B6A62] mb-1">
          <span>{label}</span>
          {badge && (
            <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-[#EEEDFE] text-[#534AB7]">
              {badge}
            </span>
          )}
        </div>
        <p className="text-2xl font-bold text-[#1A1A18]">{value}</p>
      </div>
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: iconBg, color: iconColor }}
      >
        <Icon size={18} />
      </div>
    </div>
  );
}
