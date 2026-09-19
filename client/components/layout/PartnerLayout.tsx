// components/layout/PartnerLayout.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "./Header";
import PartnerSidebar from "./PartnerSidebar";
import BackButtonLogoutGuard from "./BackButtonLogoutGuard";

export default function PartnerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [checked, setChecked] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Auth check — token lives in localStorage (backend doesn't set a cookie),
  // so this has to run client-side rather than in middleware.ts.
  useEffect(() => {
    // Named so it can re-run both on mount and on `pageshow` below — the
    // browser's back-forward cache can restore this exact page (frozen JS
    // state, no fresh mount) after a logout that happened elsewhere, so the
    // one-time mount check alone isn't enough to keep it out.
    const runAuthCheck = (isCacheRestore: boolean) => {
      const token = localStorage.getItem("token");
      const storedUser = localStorage.getItem("authUser");

      if (!token || !storedUser) {
        // A full navigation (not router.replace) guarantees a clean app
        // instance when recovering from a frozen bfcache page.
        if (isCacheRestore) {
          window.location.replace("/login");
        } else {
          router.replace("/login");
        }
        return;
      }

      try {
        const role = JSON.parse(storedUser)?.role;
        if (role !== "PARTNER") {
          router.replace("/dashboard");
          return;
        }
      } catch {
        if (isCacheRestore) {
          window.location.replace("/login");
        } else {
          router.replace("/login");
        }
        return;
      }

      setChecked(true);
    };

    runAuthCheck(false);

    const handlePageShow = (event: PageTransitionEvent) => {
      if (event.persisted) runAuthCheck(true);
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
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
      {/* Confirms before leaving via the browser Back button while authenticated. */}
      <BackButtonLogoutGuard enabled={checked} />
      <PartnerSidebar isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Header onMenuClick={() => setMobileNavOpen(true)} />
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
