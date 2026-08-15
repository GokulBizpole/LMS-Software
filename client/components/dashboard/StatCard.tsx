// components/dashboard/StatCard.tsx
import { type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
}: Props) {
  return (
    <div
      className="rounded-2xl p-5 flex flex-col justify-between min-h-27.5 transition-shadow duration-200 hover:shadow-sm"
      style={{ backgroundColor: iconBg }}
    >
      <div className="flex items-start justify-between">
        <p className="text-sm text-[#1A1A18] font-semibold">
          {title}
        </p>
        <div className="w-9 h-9 rounded-full bg-white/70 flex items-center justify-center shrink-0">
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>

      <h2 className="text-2 font-bold text-[#1A1A18] mt-2 tracking-tight">
        {value}
      </h2>
    </div>
  );
}