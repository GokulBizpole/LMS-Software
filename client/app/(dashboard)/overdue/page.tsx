// app/(dashboard)/overdue/page.tsx
import { AlertTriangle } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function OverduePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Overdue</h1>
        <p className="text-sm text-[#45443E]">Installments past their due date</p>
      </div>
      <ComingSoon
        title="Overdue tracking is coming soon"
        description="A consolidated view of overdue installments across all loans is on the way."
        icon={AlertTriangle}
      />
    </div>
  );
}
