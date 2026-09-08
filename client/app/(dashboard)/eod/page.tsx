// app/(dashboard)/eod/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useEodReports } from "@/hooks/useEodReports";
import EodReportTable from "@/components/tables/EodReportTable";
import EodReportViewModal from "@/components/tables/EodReportViewModal";
import Pagination from "@/components/ui/Pagination";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";

const EOD_STATUSES = ["PENDING", "REJECTED", "CLOSED"];

export default function EodReportsPage() {
  const {
    reports,
    total,
    totalNetRemittance,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    partnerId,
    setPartnerId,
    status,
    setStatus,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch,
  } = useEodReports();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [viewingId, setViewingId] = useState<string | null>(null);

  useEffect(() => {
    getPartners({ limit: 100 })
      .then((res) => setPartners(res.partners))
      .catch(() => setPartners([]));
  }, []);

  const filterFields: FilterFieldSpec[] = [
    {
      key: "partner",
      label: "Partner",
      kind: "select",
      value: partnerId,
      onChange: (v) => {
        setPartnerId(v);
        setPage(1);
      },
      options: [
        { value: "all", label: "All partners" },
        ...partners.map((p) => ({ value: p.id, label: `${p.partnerCode} · ${p.name}` })),
      ],
    },
    {
      key: "status",
      label: "Status",
      kind: "select",
      value: status,
      onChange: (v) => {
        setStatus(v);
        setPage(1);
      },
      options: [
        { value: "all", label: "All statuses" },
        ...EOD_STATUSES.map((s) => ({ value: s, label: s })),
      ],
    },
    {
      key: "date",
      label: "Date",
      kind: "dateRange",
      startValue: startDate,
      endValue: endDate,
      onStartChange: (v) => {
        setStartDate(v);
        setPage(1);
      },
      onEndChange: (v) => {
        setEndDate(v);
        setPage(1);
      },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">EOD Reports</h1>
          <p className="text-sm text-[#45443E]">
            {total} report{total !== 1 ? "s" : ""} · {formatCurrency(totalNetRemittance)} net remittance
          </p>
        </div>
      </div>

      <div className="flex items-center justify-end">
        <FilterPopover fields={filterFields} />
      </div>

      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-[#993C1D] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#993C1D] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <EodReportTable reports={reports} onView={setViewingId} />

            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </>
        )}
      </div>

      <EodReportViewModal
        open={viewingId !== null}
        reportId={viewingId}
        onClose={() => setViewingId(null)}
      />
    </div>
  );
}
