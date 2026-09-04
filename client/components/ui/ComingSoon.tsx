// components/ui/ComingSoon.tsx

import { Construction, type LucideIcon } from "lucide-react";

export default function ComingSoon({
  title,
  description,
  icon: Icon = Construction,
}: {
  title: string;
  description?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-[#DAD7CA] bg-white px-6 py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[#ECE9DF]">
        <Icon className="h-6 w-6 text-[#45443E]" />
      </div>
      <h2 className="text-lg font-semibold text-[#1A1A18]">{title}</h2>
      <p className="mt-1 max-w-sm text-sm text-[#6B6A62]">
        {description ?? "This page is coming soon. We're still building it out."}
      </p>
    </div>
  );
}
