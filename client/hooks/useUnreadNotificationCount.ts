// hooks/useUnreadNotificationCount.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/services/notification.service";

// Notifications are an admin-only feature today — pass enabled: false for
// roles (e.g. PARTNER) that have no notification inbox, so this never
// fires a request that's guaranteed to 403.
export function useUnreadNotificationCount(enabled = true) {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    if (!enabled) return;
    try {
      const result = await getUnreadNotificationCount();
      setCount(result);
    } catch (err) {
      console.error(err);
    }
  }, [enabled]);

  useEffect(() => {
    if (!enabled) return;
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load, enabled]);

  return { count, refetch: load };
}
