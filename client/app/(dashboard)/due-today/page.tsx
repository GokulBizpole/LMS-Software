// app/(dashboard)/due-today/page.tsx
import { Clock } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function DueTodayPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Due Today</h1>
        <p className="text-sm text-[#45443E]">Installments due today across all loans</p>
      </div>
      <ComingSoon
        title="Due today is coming soon"
        description="A live view of every installment due today is on the way."
        icon={Clock}
      />
    </div>
  );
}
