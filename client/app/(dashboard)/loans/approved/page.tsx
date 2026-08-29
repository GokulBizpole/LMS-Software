// app/(dashboard)/loans/approved/page.tsx

import { CheckCircle2 } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ApprovedLoansPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Approved Loans</h1>
        <p className="text-sm text-[#45443E]">Loans that have been approved</p>
      </div>
      <ComingSoon
        title="Approved loans view is coming soon"
        description="A dedicated list for approved loans is on the way. For now, use the Active tab on the Loans page."
        icon={CheckCircle2}
      />
    </div>
  );
}
