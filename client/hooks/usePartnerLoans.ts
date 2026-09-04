// hooks/usePartnerLoans.ts
"use client";

import { useEffect, useState, useCallback } from "react";
import { getMyLoans } from "@/services/partnerLoan.service";
import type { Loan } from "@/types/loan";

export function usePartnerLoans() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getMyLoans({ limit: 200 });
      setLoans(result.loans);
    } catch (err) {
      console.error(err);
      setError("Could not load loans. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { loans, loading, error, refetch: load };
}
