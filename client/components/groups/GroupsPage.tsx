// components/groups/GroupsPage.tsx
// Groups list page body, shared by the admin (/groups) and partner
// (/partner/groups) routes. `scope` controls data source and permissions.
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Boxes, Users, Sparkles, Search, Plus, FileText, Wallet } from "lucide-react";
import { useGroups } from "@/hooks/useGroups";
import GroupTable from "@/components/tables/GroupTable";
import GroupCard from "@/components/groups/GroupCard";
import { formatCurrency } from "@/utils/formatCurrency";
import GroupFormModal from "@/components/groups/GroupFormModal";
import GroupViewModal from "@/components/groups/GroupViewModal";
import ListStatCard from "@/components/ui/ListStatCard";
import Pagination from "@/components/ui/Pagination";
import type { GroupScope } from "@/services/group.service";

export default function GroupsPage({ scope }: { scope: GroupScope }) {
  const {
    groups,
    total,
    stats,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    search,
    setSearch,
    loading,
    error,
    refetch,
  } = useGroups(scope);

  const [showCreate, setShowCreate] = useState(false);
  // Admin views a group in a popup; partners open the full group page.
  const [viewingId, setViewingId] = useState<string | null>(null);
  const router = useRouter();

  // Partners get the card layout with loan/collection totals; admins keep the table.
  const isPartner = scope === "partner";

  const avgSize = stats.totalGroups > 0 ? (stats.totalMembers / stats.totalGroups).toFixed(1) : "0";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-[#1A1A18]">Groups</h1>
          {isPartner ? (
            <p className="text-sm text-[#45443E]">Manage area-wise groups, group heads and weekly collections.</p>
          ) : (
            <p className="text-sm text-[#45443E]">
              {stats.totalGroups} total group{stats.totalGroups !== 1 ? "s" : ""} · {stats.totalMembers} member
              {stats.totalMembers !== 1 ? "s" : ""}
            </p>
          )}
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          <Plus size={15} />
          Create group
        </button>
      </div>

      {isPartner ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <ListStatCard label="Total groups" value={stats.totalGroups} icon={Boxes} iconBg="#EEEDFE" iconColor="#534AB7" />
          <ListStatCard label="Total members" value={stats.totalMembers} icon={Users} iconBg="#E6F1FB" iconColor="#185FA5" />
          <ListStatCard label="Active loans" value={stats.activeLoans} icon={FileText} iconBg="#FAEEDA" iconColor="#854F0B" />
          <ListStatCard
            label="This week's collection"
            value={formatCurrency(stats.weekCollection)}
            icon={Wallet}
            iconBg="#EAF3DE"
            iconColor="#3B6D11"
          />
        </div>
      ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ListStatCard label="Total groups" value={stats.totalGroups} icon={Boxes} iconBg="#EEEDFE" iconColor="#534AB7" />
        <ListStatCard label="Total members" value={stats.totalMembers} icon={Users} iconBg="#E6F1FB" iconColor="#185FA5" />
        <ListStatCard label="Avg. group size" value={avgSize} icon={Users} iconBg="#EAF3DE" iconColor="#3B6D11" />
        <ListStatCard
          label="Added this month"
          value={stats.addedThisMonth}
          icon={Sparkles}
          iconBg="#EEEDFE"
          iconColor="#534AB7"
          badge="NEW"
        />
      </div>
      )}

      <div className="relative w-full max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by group name, code, head..."
          className="w-full rounded-lg border border-[#9C9A8D] pl-9 pr-3 py-2 text-sm"
        />
      </div>

      {isPartner ? (
        loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-60 rounded-2xl bg-[#ECE9DF] animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white text-center py-6">
            <p className="text-[#E31E24] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#E31E24] underline">
              Try again
            </button>
          </div>
        ) : groups.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-white flex items-center justify-center h-40 text-sm text-[#6B6A62]">
            No groups found.
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {groups.map((g) => (
                <GroupCard key={g.id} group={g} onView={(id) => router.push(`/partner/groups/${id}`)} />
              ))}
            </div>
            <Pagination
              page={page}
              totalPages={totalPages}
              total={total}
              pageSize={pageSize}
              onPageChange={setPage}
              onPageSizeChange={setPageSize}
            />
          </div>
        )
      ) : (
      <div className="rounded-2xl border border-[#E5E7EB] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-6">
            <p className="text-[#E31E24] text-sm mb-2">{error}</p>
            <button onClick={refetch} className="text-sm font-semibold text-[#E31E24] underline">
              Try again
            </button>
          </div>
        ) : (
          <>
            <GroupTable groups={groups} onView={setViewingId} showPartner={scope === "admin"} />

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
      )}

      <GroupFormModal
        open={showCreate}
        scope={scope}
        onClose={() => setShowCreate(false)}
        onSaved={() => {
          setShowCreate(false);
          refetch();
        }}
      />

      <GroupViewModal
        open={viewingId !== null}
        scope={scope}
        groupId={viewingId}
        onClose={() => setViewingId(null)}
        onChanged={refetch}
      />
    </div>
  );
}
