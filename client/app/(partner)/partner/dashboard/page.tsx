// app/(partner)/partner/dashboard/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function PartnerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">
          Welcome, {user?.name ?? "Partner"}
        </h1>
        <p className="text-sm text-[#5F5E5A]">
          This is your partner dashboard. More features are on the way.
        </p>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
        <p className="text-sm text-[#888780]">
          Loan and investment details for your account will show up here soon.
        </p>
      </div>
    </div>
  );
}
