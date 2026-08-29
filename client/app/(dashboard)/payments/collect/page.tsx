// app/(dashboard)/payments/collect/page.tsx

import { Wallet } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function CollectPaymentPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Collect Payment</h1>
        <p className="text-sm text-[#45443E]">Record a new payment collection</p>
      </div>
      <ComingSoon
        title="Admin payment collection is coming soon"
        description="Collecting payments directly from the admin dashboard is on the way. For now, partners collect payments from their side."
        icon={Wallet}
      />
    </div>
  );
}
