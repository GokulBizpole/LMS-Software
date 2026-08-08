// hooks/useDashboard.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getDashboardData } from "@/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

type DashboardErrorType = "unauthorized" | "forbidden" | "network" | "unknown";

interface UseDashboardResult {
  data: DashboardData | null;
  loading: boolean;
  error: string | null;
  errorType: DashboardErrorType | null;
  refetch: () => void;
}

export function useDashboard(): UseDashboardResult {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<DashboardErrorType | null>(null);
  const [reloadFlag, setReloadFlag] = useState(0);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      setErrorType(null);

      const result = await getDashboardData();
      setData(result);
    } catch (err: any) {
      const status = err?.response?.status;

      if (status === 401) {
        setErrorType("unauthorized");
        setError("Your session has expired. Please log in again.");
        // Redirect to login after a short delay so the message is visible
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
      console.error("Dashboard load error:", err);
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