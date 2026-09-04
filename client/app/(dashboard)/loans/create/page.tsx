// app/(dashboard)/loans/create/page.tsx

import { FilePlus } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function CreateLoanPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Create Loan</h1>
        <p className="text-sm text-[#45443E]">Start a new loan application</p>
      </div>
      <ComingSoon
        title="Loan creation is coming soon"
        description="Admin-side loan creation is on the way. For now, loans are submitted by partners for approval."
        icon={FilePlus}
      />
    </div>
  );
}
