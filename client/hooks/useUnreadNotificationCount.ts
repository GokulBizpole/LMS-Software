// hooks/useUnreadNotificationCount.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { getUnreadNotificationCount } from "@/services/notification.service";

export function useUnreadNotificationCount() {
  const [count, setCount] = useState(0);

  const load = useCallback(async () => {
    try {
      const result = await getUnreadNotificationCount();
      setCount(result);
    } catch (err) {
      console.error(err);
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, [load]);

  return { count, refetch: load };
}
