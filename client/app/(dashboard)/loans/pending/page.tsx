// app/(dashboard)/loans/pending/page.tsx

import { Clock } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function PendingLoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Pending Loans</h1>
        <p className="text-sm text-[#45443E]">Loans awaiting review and approval</p>
      </div>
      <ComingSoon
        title="Pending loans view is coming soon"
        description="A dedicated queue for loans awaiting approval is on the way. For now, use the Pending tab on the Loans page."
        icon={Clock}
      />
    </div>
  );
}
