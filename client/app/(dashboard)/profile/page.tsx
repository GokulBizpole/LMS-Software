// app/(dashboard)/profile/page.tsx

import { UserCircle } from "lucide-react";
import ComingSoon from "@/components/ui/ComingSoon";

export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Profile</h1>
        <p className="text-sm text-[#45443E]">Your account details</p>
      </div>
      <ComingSoon
        title="Profile page is coming soon"
        description="Viewing and editing your account details from here is on the way."
        icon={UserCircle}
      />
    </div>
  );
}
