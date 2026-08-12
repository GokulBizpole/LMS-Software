// hooks/useCollectionReport.ts
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { getPayments } from "@/services/payment.service";
import type { Payment, PaymentStatus } from "@/types/payment";

const PAGE_SIZE = 10;

function inRange(dateStr: string | null | undefined, start: string, end: string) {
  if (!start && !end) return true;
  if (!dateStr) return false;
  const d = new Date(dateStr).getTime();
  if (start && d < new Date(start).getTime()) return false;
  if (end && d > new Date(end).getTime() + 24 * 60 * 60 * 1000 - 1) return false;
  return true;
}

export function useCollectionReport() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<PaymentStatus | "all">("all");
  const [partnerCode, setPartnerCode] = useState("all");
  const [customerCode, setCustomerCode] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getPayments({ limit: 1000 });
      setPayments(result.payments);
    } catch (err) {
      console.error(err);
      setError("Could not load the collection report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    setPage(1);
  }, [search, status, partnerCode, customerCode, startDate, endDate]);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    return payments.filter((p) => {
      if (status !== "all" && p.paymentStatus !== status) return false;
      if (partnerCode !== "all" && p.loan.partner?.partnerCode !== partnerCode) return false;
      if (customerCode !== "all" && p.loan.customer.customerCode !== customerCode) return false;
      if (!inRange(p.paidAt, startDate, endDate)) return false;
      if (term) {
        const haystack = [
          p.receiptNumber,
          p.loan.loanNumber,
          p.loan.customer.name,
          p.loan.customer.customerCode,
          p.loan.customer.phone,
        ]
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      return true;
    });
  }, [payments, search, status, partnerCode, customerCode, startDate, endDate]);

  const summary = useMemo(() => {
    return filtered.reduce(
      (acc, p) => {
        acc.totalReceived += Number(p.totalReceived);
        acc.totalPenalty += Number(p.penalty);
        acc.count += 1;
        acc.byStatus[p.paymentStatus] = (acc.byStatus[p.paymentStatus] ?? 0) + 1;
        return acc;
      },
      {
        totalReceived: 0,
        totalPenalty: 0,
        count: 0,
        byStatus: {} as Record<PaymentStatus, number>,
      }
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return {
    payments: paginated,
    filtered,
    summary,
    page,
    setPage,
    totalPages,
    search,
    setSearch,
    status,
    setStatus,
    partnerCode,
    setPartnerCode,
    customerCode,
    setCustomerCode,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch: load,
  };
}
