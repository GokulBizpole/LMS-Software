// components/groups/GroupFormModal.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import { Search, Crown, X, Plus } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormField";
import CustomerFormModal from "@/components/customers/CustomerFormModal";
import PartnerCustomerFormModal from "@/components/partner/CustomerFormModal";
import {
  createGroup,
  getEligibleCustomers,
  updateMyGroup,
  type GroupScope,
} from "@/services/group.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { EligibleCustomer, GroupDetail } from "@/types/group";
import type { Customer } from "@/types/customer";

export default function GroupFormModal({
  open,
  scope,
  group,
  onClose,
  onSaved,
}: {
  open: boolean;
  scope: GroupScope;
  // Present = edit mode (partner only).
  group?: GroupDetail | null;
  onClose: () => void;
  onSaved: (group: GroupDetail) => void;
}) {
  const isEdit = !!group;
  const [name, setName] = useState("");
  const [selected, setSelected] = useState<EligibleCustomer[]>([]);
  const [headId, setHeadId] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [options, setOptions] = useState<EligibleCustomer[]>([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  // Bumped after a customer is created so the available list refetches and
  // shows the new customer (already checked).
  const [optionsReloadKey, setOptionsReloadKey] = useState(0);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    const reset = () => {
      setShowCreateCustomer(false);
      setName(group?.name ?? "");
      setSelected(group?.members.map((m) => m.customer) ?? []);
      setHeadId(group?.groupHeadId ?? "");
      setSearch("");
      setDebouncedSearch("");
    };
    reset();
  }, [open, group]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(t);
  }, [search]);

  // Admin groups can't mix partners, so once a member is picked the list
  // narrows to that member's partner (or to customers with no partner).
  const partnerFilter =
    scope === "admin" && selected.length > 0
      ? selected[0].partnerId ?? "unassigned"
      : undefined;
  const partnerLabel =
    scope === "admin" && selected.length > 0
      ? selected.find((c) => c.partner)?.partner?.name ??
        (selected[0].partnerId ? "the same partner" : "no partner")
      : null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const load = () => {
      setOptionsLoading(true);
      getEligibleCustomers(scope, {
        search: debouncedSearch || undefined,
        groupId: group?.id,
        partnerId: partnerFilter,
      })
        .then((list) => {
          if (!cancelled) setOptions(list);
        })
        .catch(() => {
          if (!cancelled) setOptions([]);
        })
        .finally(() => {
          if (!cancelled) setOptionsLoading(false);
        });
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [open, scope, debouncedSearch, group?.id, partnerFilter, optionsReloadKey]);

  const selectedIds = useMemo(() => new Set(selected.map((c) => c.id)), [selected]);

  const remove = (id: string) => {
    const next = selected.filter((c) => c.id !== id);
    setSelected(next);
    if (headId === id) setHeadId(next[0]?.id ?? "");
  };

  const toggle = (customer: EligibleCustomer) => {
    if (selectedIds.has(customer.id)) {
      remove(customer.id);
    } else {
      setSelected([...selected, customer]);
      if (!headId) setHeadId(customer.id);
    }
  };

  // Customer created from the nested popup: add it to the members (and make
  // it head if none is set yet). The API response includes partnerId even
  // though the shared Customer type doesn't declare it.
  const handleCustomerCreated = (customer: Customer) => {
    setShowCreateCustomer(false);

    const created: EligibleCustomer = {
      id: customer.id,
      customerCode: customer.customerCode,
      name: customer.name,
      phone: customer.phone,
      city: customer.city,
      status: customer.status,
      partnerId: (customer as Customer & { partnerId?: string | null }).partnerId ?? null,
    };

    // Admin-created customers have no partner, so they can't join a group
    // whose members already belong to a partner.
    if (
      scope === "admin" &&
      selected.length > 0 &&
      (selected[0].partnerId ?? null) !== created.partnerId
    ) {
      toast.warning(
        `${created.name} was created but can't be added — this group's members belong to ${partnerLabel}.`
      );
      setOptionsReloadKey((k) => k + 1);
      return;
    }

    if (!selectedIds.has(created.id)) {
      setSelected([...selected, created]);
      if (!headId) setHeadId(created.id);
    }
    setOptionsReloadKey((k) => k + 1);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Group name is required.");
      return;
    }
    if (!headId) {
      toast.error("Select members and choose a group head.");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: name.trim(),
        groupHeadId: headId,
        memberIds: selected.map((c) => c.id),
      };
      const { data, message } =
        isEdit && group
          ? await updateMyGroup(group.id, payload)
          : await createGroup(scope, payload);
      toast.success(message);
      onSaved(data);
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save group."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
    <Modal
      open={open}
      // Both modals listen for Escape; while the customer popup is open only
      // it should close, not the group form underneath.
      onClose={showCreateCustomer ? () => {} : onClose}
      title={isEdit ? "Edit group" : "Create group"}
      subtitle={
        isEdit
          ? `${group?.groupCode} · Update the group name, head or members.`
          : "Group code is generated automatically (GRP001, GRP002, ...)."
      }
      maxWidth="max-w-3xl"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="group-form"
            disabled={submitting}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Create group"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
          >
            Cancel
          </button>
          <span className="ml-auto text-xs text-[#6B6A62]">
            {selected.length} member{selected.length !== 1 ? "s" : ""} selected
          </span>
        </div>
      }
    >
      <form id="group-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <TextField
            label="Group name"
            name="name"
            value={name}
            onChange={(_, v) => setName(v)}
            required
          />
          <div>
            <label className="block text-xs text-[#6B6A62] mb-1">Group head *</label>
            <select
              value={headId}
              onChange={(e) => setHeadId(e.target.value)}
              disabled={selected.length === 0}
              className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] disabled:bg-[#F8FAFC] disabled:text-[#9C9A8D]"
            >
              {selected.length === 0 && <option value="">Select members first</option>}
              {selected.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.customerCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Available customers */}
          <div className="rounded-xl border border-[#E5E7EB] flex flex-col min-h-0">
            <div className="px-4 pt-3 pb-2 border-b border-[#E5E7EB] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-[#1A1A18]">Add members</h3>
                <button
                  type="button"
                  onClick={() => setShowCreateCustomer(true)}
                  className="flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg border border-[#9C9A8D] text-[#45443E] hover:bg-[#ECE9DF]"
                >
                  <Plus size={13} />
                  Create Customer
                </button>
              </div>
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9C9A8D]" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search by name, phone, code..."
                  className="w-full rounded-lg border border-[#9C9A8D] pl-8 pr-3 py-1.5 text-sm"
                />
              </div>
              {partnerLabel && (
                <p className="text-[11px] text-[#6B6A62]">
                  Showing customers of {partnerLabel} — a group can&apos;t mix partners.
                </p>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {optionsLoading ? (
                <div className="p-3 space-y-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="h-9 bg-[#ECE9DF] rounded animate-pulse" />
                  ))}
                </div>
              ) : options.length === 0 ? (
                <p className="p-4 text-center text-xs text-[#6B6A62]">
                  No available customers. Customers already in a group aren&apos;t listed.
                </p>
              ) : (
                options.map((c) => (
                  <label
                    key={c.id}
                    className="flex items-center gap-3 px-4 py-2 border-b border-[#E5E7EB] last:border-0 hover:bg-[#F8FAFC] cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.has(c.id)}
                      onChange={() => toggle(c)}
                      className="rounded border-[#C4C1B3] accent-[#1A1A18]"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-[#1A1A18] truncate">{c.name}</p>
                      <p className="text-xs text-[#6B6A62] truncate">
                        {c.customerCode} · {c.phone}
                        {scope === "admin" && c.partner ? ` · ${c.partner.name}` : ""}
                      </p>
                    </div>
                  </label>
                ))
              )}
            </div>
          </div>

          {/* Selected members */}
          <div className="rounded-xl border border-[#E5E7EB] flex flex-col min-h-0">
            <div className="px-4 pt-3 pb-2 border-b border-[#E5E7EB]">
              <h3 className="text-sm font-semibold text-[#1A1A18]">
                Selected members ({selected.length})
              </h3>
              <p className="text-[11px] text-[#6B6A62]">Click the crown to set the group head.</p>
            </div>
            <div className="max-h-72 overflow-y-auto">
              {selected.length === 0 ? (
                <p className="p-4 text-center text-xs text-[#6B6A62]">No members selected yet.</p>
              ) : (
                selected.map((c) => {
                  const isHead = c.id === headId;
                  return (
                    <div
                      key={c.id}
                      className={`flex items-center gap-3 px-4 py-2 border-b border-[#E5E7EB] last:border-0 ${
                        isHead ? "bg-[#FAEEDA]/50" : ""
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setHeadId(c.id)}
                        aria-label={`Make ${c.name} group head`}
                        title={isHead ? "Group head" : "Make group head"}
                        className={`shrink-0 ${isHead ? "text-[#854F0B]" : "text-[#C4C1B3] hover:text-[#854F0B]"}`}
                      >
                        <Crown size={16} />
                      </button>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm text-[#1A1A18] truncate">
                          {c.name}
                          {isHead && (
                            <span className="ml-2 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[#FAEEDA] text-[#854F0B]">
                              HEAD
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-[#6B6A62] truncate">
                          {c.customerCode} · {c.phone}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => remove(c.id)}
                        aria-label={`Remove ${c.name}`}
                        className="shrink-0 text-[#9C9A8D] hover:text-[#E31E24]"
                      >
                        <X size={15} />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </form>
    </Modal>

    {/* Rendered after the group modal so it stacks on top of it. Reuses the
        existing customer create modals (form, validation, API) unchanged. */}
    {scope === "admin" ? (
      <CustomerFormModal
        open={open && showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onSaved={handleCustomerCreated}
      />
    ) : (
      <PartnerCustomerFormModal
        open={open && showCreateCustomer}
        onClose={() => setShowCreateCustomer(false)}
        onSaved={handleCustomerCreated}
      />
    )}
    </>
  );
}
