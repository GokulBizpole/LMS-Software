// app/(dashboard)/loans/[id]/schedule/page.tsx

import { CalendarClock } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function LoanSchedulePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Repayment Schedule</h1>
        <p className="text-sm text-[#45443E]">Installment-wise breakdown for this loan</p>
      </div>
      <ComingSoon
        title="Repayment schedule view is coming soon"
        description="A full installment-by-installment schedule is on the way. For now, check the loan details page for progress."
        icon={CalendarClock}
      />
    </div>
  );
}
