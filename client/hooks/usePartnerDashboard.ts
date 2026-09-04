// hooks/usePartnerDashboard.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getMyDashboardData } from "@/services/partnerDashboard.service";
import type { PartnerDashboardData } from "@/types/partnerDashboard";

type DashboardErrorType = "unauthorized" | "forbidden" | "network" | "unknown";

export function usePartnerDashboard() {
  const router = useRouter();
  const [data, setData] = useState<PartnerDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<DashboardErrorType | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      const result = await getMyDashboardData();
      setData(result);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setErrorType("unauthorized");
        setError("Your session has expired. Please log in again.");
        setTimeout(() => router.push("/login"), 1200);
      } else if (status === 403) {
        setErrorType("forbidden");
        setError("You don't have permission to view this dashboard.");
      } else if (!err?.response) {
        setErrorType("network");
        setError("Network error. Check your connection and try again.");
      } else {
        setErrorType("unknown");
        setError("Something went wrong while loading the dashboard.");
      }
      console.error("Partner dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    load();
  }, [load, reloadFlag]);

  const refetch = () => setReloadFlag((f) => f + 1);

  return { data, loading, error, errorType, refetch };
}
