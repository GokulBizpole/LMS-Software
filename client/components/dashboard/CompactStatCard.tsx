// components/dashboard/CompactStatCard.tsx
import { type LucideIcon } from "lucide-react";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  bg: string;
  iconColor: string;
}

export default function CompactStatCard({
  title,
  value,
  icon: Icon,
  bg,
  iconColor,
}: Props) {
  return (
    <div
      className="rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm"
      style={{ backgroundColor: bg }}
    >
      <div className="min-w-0">
        <p className="text-lg font-bold text-[#1A1A18] leading-tight truncate">
          {value}
        </p>
        <p className="text-xs text-[#6B6A62] mt-0.5 truncate">{title}</p>
      </div>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${iconColor}1A` }}
      >
        <Icon size={15} style={{ color: iconColor }} />
      </div>
    </div>
  );
}
