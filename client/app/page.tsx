// app/page.tsx
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    router.replace(token ? "/dashboard" : "/login");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="h-8 w-8 border-2 border-[#C4C1B3] border-t-[#1A1A18] rounded-full animate-spin" />
    </div>
  );
}