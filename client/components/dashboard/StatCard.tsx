// components/dashboard/StatCard.tsx
import { type LucideIcon } from "lucide-react";
import type { Trend } from "@/types/dashboard";

interface Props {
  title: string;
  value: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: Trend;
  trendLabel?: string;
  fallback?: string;
}

function TrendRow({ trend, trendLabel, fallback }: { trend: Trend; trendLabel: string; fallback?: string }) {
  if (trend.percent === null) {
    return <p className="text-xs text-[#6B6A62] mt-1">— {fallback ?? "no data yet"}</p>;
  }

  const isUp = trend.direction === "up";
  const isFlat = trend.direction === "flat";
  const color = isFlat ? "#6B6A62" : isUp ? "#3B6D11" : "#993C1D";
  const arrow = isFlat ? "•" : isUp ? "▲" : "▼";

  return (
    <p className="text-xs mt-1">
      <span className="font-medium" style={{ color }}>
        {arrow} {Math.abs(trend.percent)}%
      </span>
      <span className="text-[#6B6A62]"> {trendLabel}</span>
    </p>
  );
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendLabel = "vs last month",
  fallback,
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

      <div className="mt-2">
        <h2 className="text-2 font-bold text-[#1A1A18] tracking-tight">
          {value}
        </h2>
        {trend && <TrendRow trend={trend} trendLabel={trendLabel} fallback={fallback} />}
      </div>
    </div>
  );
}
