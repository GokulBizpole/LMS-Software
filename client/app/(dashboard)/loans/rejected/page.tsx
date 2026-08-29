// app/(dashboard)/loans/rejected/page.tsx

import { XCircle } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function RejectedLoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Rejected Loans</h1>
        <p className="text-sm text-[#45443E]">Loans that were declined</p>
      </div>
      <ComingSoon
        title="Rejected loans view is coming soon"
        description="A dedicated list for rejected loans is on the way. For now, use the Rejected tab on the Loans page."
        icon={XCircle}
      />
    </div>
  );
}
