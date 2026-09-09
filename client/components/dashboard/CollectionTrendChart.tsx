// components/dashboard/CollectionTrendChart.tsx
"use client";

import { useState } from "react";
import type { WeeklyTrendDay } from "@/types/dashboard";
import { formatCurrency } from "@/utils/formatCurrency";

const BAR_COLOR = "#185FA5";
const FUTURE_BAR_COLOR = "#E6F1FB";

export default function CollectionTrendChart({
  data,
  total,
}: {
  data: WeeklyTrendDay[];
  total: string | number;
}) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const max = Math.max(1, ...data.map((d) => d.amount));

  return (
    <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
      <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Collection trend</h3>

      <div className="flex items-end justify-between gap-2 h-36 mb-2" role="img" aria-label="Collections for each day of this week">
        {data.map((d, i) => {
          const heightPct = d.future ? 6 : Math.max(4, (d.amount / max) * 100);
          const isHovered = hoverIndex === i;

          return (
            <div
              key={i}
              className="relative flex-1 flex flex-col items-center justify-end h-full"
              onMouseEnter={() => setHoverIndex(i)}
              onMouseLeave={() => setHoverIndex(null)}
            >
              {isHovered && !d.future && (
                <div className="absolute -top-8 whitespace-nowrap rounded-md bg-[#1A1A18] text-white text-[11px] px-2 py-1 z-10">
                  {formatCurrency(d.amount)}
                </div>
              )}
              <div
                className="w-full rounded-t-md transition-[height] duration-150"
                style={{
                  height: `${heightPct}%`,
                  backgroundColor: d.future ? FUTURE_BAR_COLOR : BAR_COLOR,
                  opacity: isHovered && !d.future ? 0.85 : 1,
                }}
              />
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between gap-2 mb-4">
        {data.map((d, i) => (
          <span key={i} className="flex-1 text-center text-xs text-[#6B6A62]">
            {d.day}
          </span>
        ))}
      </div>

      <p className="text-lg font-bold text-[#1A1A18]">{formatCurrency(total)}</p>
      <p className="text-xs text-[#6B6A62]">collected this week</p>
    </div>
  );
}
