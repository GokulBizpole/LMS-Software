// app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useState, type SubmitEvent } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import AuditLogTable from "@/components/tables/AuditLogTable";
import type { UpdateSettingData } from "@/types/setting";

const TABLE_NAMES = ["CUSTOMER", "PARTNER", "LOAN", "PAYMENT", "EXPENSE"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE"];

const TABS = [
  { key: "general", label: "General" },
  { key: "audit", label: "Audit Log" },
] as const;

type TabKey = (typeof TABS)[number]["key"];

function GeneralSettingsTab() {
  const { settings, loading, saving, error, save } = useSettings();
  const { user } = useAuthContext();

  const [form, setForm] = useState<UpdateSettingData>({
    companyName: "",
    companyPhone: "",
    companyEmail: "",
    companyAddress: "",
    defaultInterestPercentage: 0,
    defaultPenaltyPercentage: 0,
    receiptPrefix: "RCP",
  });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!settings) return;
    setForm({
      companyName: settings.companyName,
      companyPhone: settings.companyPhone,
      companyEmail: settings.companyEmail || "",
      companyAddress: settings.companyAddress || "",
      defaultInterestPercentage: Number(settings.defaultInterestPercentage),
      defaultPenaltyPercentage: Number(settings.defaultPenaltyPercentage),
      receiptPrefix: settings.receiptPrefix,
    });
  }, [settings]);

  const handleSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaved(false);
    try {
      await save(form);
      setSaved(true);
    } catch (err) {
      console.error(err);
      setSaveError("Could not save settings. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-10 bg-[#F1EFE8] rounded animate-pulse" />
        ))}
      </div>
    );
  }

  if (error) {
    return <p className="text-sm text-[#993C1D]">{error}</p>;
  }

  return (
    <div className="space-y-6">
      {user && (
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-3">Signed in as</h2>
          <p className="text-sm text-[#2C2C2A]">{user.name}</p>
          <p className="text-xs text-[#888780]">
            {user.email} · {user.role}
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-[#E8E6DF] bg-white p-5 space-y-4"
      >
        <h2 className="text-sm font-semibold text-[#2C2C2A]">Company details</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#888780] mb-1">Company name</label>
            <input
              type="text"
              required
              value={form.companyName}
              onChange={(e) => setForm((f) => ({ ...f, companyName: e.target.value }))}
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888780] mb-1">Phone</label>
            <input
              type="text"
              required
              value={form.companyPhone}
              onChange={(e) => setForm((f) => ({ ...f, companyPhone: e.target.value }))}
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888780] mb-1">Email</label>
            <input
              type="email"
              value={form.companyEmail}
              onChange={(e) => setForm((f) => ({ ...f, companyEmail: e.target.value }))}
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888780] mb-1">Receipt prefix</label>
            <input
              type="text"
              required
              value={form.receiptPrefix}
              onChange={(e) => setForm((f) => ({ ...f, receiptPrefix: e.target.value }))}
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs text-[#888780] mb-1">Address</label>
            <textarea
              value={form.companyAddress}
              onChange={(e) => setForm((f) => ({ ...f, companyAddress: e.target.value }))}
              rows={2}
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888780] mb-1">
              Default interest %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.defaultInterestPercentage}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  defaultInterestPercentage: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs text-[#888780] mb-1">
              Default penalty %
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              required
              value={form.defaultPenaltyPercentage}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  defaultPenaltyPercentage: Number(e.target.value),
                }))
              }
              className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm"
            />
          </div>
        </div>

        {saveError && <p className="text-sm text-[#993C1D]">{saveError}</p>}
        {saved && <p className="text-sm text-[#3B6D11]">Settings saved.</p>}

        <button
          type="submit"
          disabled={saving}
          className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}

function AuditLogTab() {
  const {
    logs,
    total,
    page,
    setPage,
    totalPages,
    action,
    setAction,
    tableName,
    setTableName,
    loading,
    error,
    refetch,
  } = useAuditLogs();

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#5F5E5A]">
            {total} log{total !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          >
            <option value="all">All actions</option>
            {ACTIONS.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            value={tableName}
            onChange={(e) => {
              setTableName(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
          >
            <option value="all">All tables</option>
            {TABLE_NAMES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-5">
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-10 bg-[#F1EFE8] rounded animate-pulse" />
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
            <AuditLogTable logs={logs} />

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#F1EFE8]">
                <p className="text-xs text-[#888780]">
                  Page {page} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="w-8 h-8 rounded-lg border border-[#D3D1C7] text-sm disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Settings</h1>
        <p className="text-sm text-[#5F5E5A]">
          Manage company details and review the audit trail.
        </p>
      </div>

      <div className="flex gap-1 border-b border-[#E8E6DF]">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#2C2C2A] text-[#2C2C2A]"
                : "border-transparent text-[#888780] hover:text-[#5F5E5A]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "general" ? <GeneralSettingsTab /> : <AuditLogTab />}
    </div>
  );
}
