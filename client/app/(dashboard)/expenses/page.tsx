// app/(dashboard)/expenses/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import ExpenseTable from "@/components/tables/ExpenseTable";
import ExpenseFormModal from "@/components/expenses/ExpenseFormModal";
import Pagination from "@/components/ui/Pagination";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { getPartners } from "@/services/partner.service";
import type { Partner } from "@/types/partner";
import { EXPENSE_CATEGORIES } from "@/types/expense";
import { formatCurrency } from "@/utils/formatCurrency";

export default function ExpensesPage() {
  const {
    expenses,
    total,
    totalAmount,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    category,
    setCategory,
    partnerId,
    setPartnerId,
    startDate,
    setStartDate,
    endDate,
    setEndDate,
    loading,
    error,
    refetch,
  } = useExpenses();

  const [partners, setPartners] = useState<Partner[]>([]);
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    getPartners({ limit: 100 })
      .then((res) => setPartners(res.partners))
      .catch(() => setPartners([]));
  }, []);

  const filterFields: FilterFieldSpec[] = [
    {
      key: "category",
      label: "Category",
      kind: "select",
      value: category,
      onChange: (v) => {
        setCategory(v as typeof category);
        setPage(1);
      },
      options: [
        { value: "all", label: "All categories" },
        ...EXPENSE_CATEGORIES.map((c) => ({ value: c, label: c })),
      ],
    },
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Expenses</h1>
          <p className="text-sm text-[#45443E]">
            {total} expense{total !== 1 ? "s" : ""} · {formatCurrency(totalAmount)} total
          </p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Add expense
        </button>
      </div>

      <div className="flex items-center gap-3">
        <input
          type="text"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search description, partner..."
          className="w-full max-w-sm rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm"
        />
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
            <ExpenseTable expenses={expenses} onChanged={refetch} />

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

      <ExpenseFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={() => {
          setShowCreate(false);
          refetch();
        }}
      />
    </div>
  );
}
