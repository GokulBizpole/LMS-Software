// components/layout/PartnerLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import PartnerSidebar from "./PartnerSidebar";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);

  // Auth check — token lives in localStorage (backend doesn't set a cookie),
  // so this has to run client-side rather than in middleware.ts.
  useEffect(() => {
    const token = localStorage.getItem("token");
    const storedUser = localStorage.getItem("authUser");

    if (!token || !storedUser) {
      router.replace("/login");
      return;
    }

    try {
      const role = JSON.parse(storedUser)?.role;
      if (role !== "PARTNER") {
        router.replace("/dashboard");
        return;
      }
    } catch {
      router.replace("/login");
      return;
    }

    setChecked(true);
  }, [router]);

  if (!checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-8 w-8 border-2 border-[#C4C1B3] border-t-[#1A1A18] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#FFFFFF]">
      <PartnerSidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
