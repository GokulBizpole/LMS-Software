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
    <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 flex flex-col justify-between min-h-27.5 transition-shadow duration-200 hover:shadow-sm">
      <div className="flex items-start justify-between">
        <p className="text-[13px] text-[#888780] font-medium">
          {title}
        </p>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: iconBg }}
        >
          <Icon size={16} style={{ color: iconColor }} />
        </div>
      </div>

      <h2 className="text-2xl font-bold text-[#2C2C2A] mt-2 tracking-tight">
        {value}
      </h2>
    </div>
  );
}