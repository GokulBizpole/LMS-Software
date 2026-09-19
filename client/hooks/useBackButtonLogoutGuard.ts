// hooks/useBackButtonLogoutGuard.ts
"use client";

import { useEffect, useRef } from "react";

export function useBackButtonLogoutGuard(enabled: boolean, onBackPressed: () => void) {
  const callbackRef = useRef(onBackPressed);
  useEffect(() => {
    callbackRef.current = onBackPressed;
  }, [onBackPressed]);

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // Sentinel entry so the next Back press fires `popstate` here instead
    // of immediately leaving the current page.
    window.history.pushState(null, "", window.location.href);

    const handlePopState = () => {
      // Re-arm the trap immediately, then ask before actually leaving.
      window.history.pushState(null, "", window.location.href);
      callbackRef.current();
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [enabled]);
}
