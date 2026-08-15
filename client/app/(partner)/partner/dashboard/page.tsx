// app/(partner)/partner/dashboard/page.tsx
"use client";

import { useAuth } from "@/hooks/useAuth";

export default function PartnerDashboardPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">
          Welcome, {user?.name ?? "Partner"}
        </h1>
        <p className="text-sm text-[#45443E]">
          This is your partner dashboard. More features are on the way.
        </p>
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
        <p className="text-sm text-[#6B6A62]">
          Loan and investment details for your account will show up here soon.
        </p>
      </div>
    </div>
  );
}
