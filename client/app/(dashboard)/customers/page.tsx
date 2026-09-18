"use client";

import { useState } from "react";
import { Users, CheckCircle2, Ban, Sparkles, Search, ArrowUpDown, MoreVertical, Download, Plus } from "lucide-react";
import { useCustomers, type CustomerStatusFilter } from "@/hooks/useCustomers";
import AdminCustomerTable from "@/components/tables/AdminCustomerTable";
import CustomerFormModal from "@/components/customers/CustomerFormModal";
import CustomerViewModal from "@/components/customers/CustomerViewModal";
import ListStatCard from "@/components/ui/ListStatCard";
import Pagination from "@/components/ui/Pagination";

const FILTER_PILLS: { key: CustomerStatusFilter; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "ACTIVE", label: "Active" },
  { key: "BLOCKED", label: "Blocked" },
];

export default function CustomersPage() {
  const {
    customers,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    stats,
    loading,
    error,
    refetch,
    removeCustomer,
  } = useCustomers();

  const [showCreate, setShowCreate] = useState(false);
  const [viewingId, setViewingId] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Customers</h1>
          <p className="text-sm text-[#45443E]">
            {stats.total} total customer{stats.total !== 1 ? "s" : ""} · {stats.active} active
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="flex items-center gap-2 border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
          >
            <Download size={15} />
            Export
          </button>
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-2 bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
          >
            <Plus size={15} />
            Add customer
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ListStatCard label="Total customers" value={stats.total} icon={Users} iconBg="#E6F1FB" iconColor="#185FA5" />
        <ListStatCard label="Active" value={stats.active} icon={CheckCircle2} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <ListStatCard label="Blocked" value={stats.blocked} icon={Ban} iconBg="#FAECE7" iconColor="#993C1D" />
        <ListStatCard
          label="Added this month"
          value={stats.addedThisMonth}
          icon={Sparkles}
          iconBg="#EEEDFE"
          iconColor="#534AB7"
          badge="NEW"
        />
      </div>

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="relative w-full max-w-sm">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, phone, code..."
            className="w-full rounded-lg border border-[#9C9A8D] pl-9 pr-3 py-2 text-sm"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-[#C4C1B3] p-0.5">
            {FILTER_PILLS.map((pill) => (
              <button
                key={pill.key}
                type="button"
                onClick={() => setStatusFilter(pill.key)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium ${
                  statusFilter === pill.key
                    ? "bg-[#1A1A18] text-white"
                    : "text-[#45443E] hover:bg-[#ECE9DF]"
                }`}
              >
                {pill.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            aria-label="Sort"
            className="w-9 h-9 rounded-lg border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
          >
            <ArrowUpDown size={15} />
          </button>
          <button
            type="button"
            aria-label="More options"
            className="w-9 h-9 rounded-lg border border-[#C4C1B3] flex items-center justify-center text-[#45443E] hover:bg-[#ECE9DF]"
          >
            <MoreVertical size={15} />
          </button>
        </div>
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
            <AdminCustomerTable customers={customers} onView={setViewingId} />

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

      <CustomerFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
        onSaved={() => {
          setShowCreate(false);
          refetch();
        }}
      />

      <CustomerViewModal
        open={viewingId !== null}
        customerId={viewingId}
        onClose={() => setViewingId(null)}
        onChanged={refetch}
        onDeleted={removeCustomer}
      />
    </div>
  );
}
