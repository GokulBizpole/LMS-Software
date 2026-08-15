// components/layout/DashboardLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import Header from "./Header";

export default function DashboardLayout({
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
    if (!token) {
      router.replace("/login");
      return;
    }

    const storedUser = localStorage.getItem("authUser");
    try {
      const role = storedUser ? JSON.parse(storedUser)?.role : null;
      if (role === "PARTNER") {
        router.replace("/partner/dashboard");
        return;
      }
    } catch {
      // Malformed stored user — fall through and let the page load;
      // API calls will 401/403 if the token is actually bad.
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
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        <main className="flex-1 p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}