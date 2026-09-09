// app/(dashboard)/settings/page.tsx
"use client";

import { useEffect, useRef, useState, type SubmitEvent, type ReactNode } from "react";
import { useAuthContext } from "@/contexts/AuthContext";
import { useSettings } from "@/hooks/useSettings";
import { useAuditLogs } from "@/hooks/useAuditLogs";
import AuditLogTable from "@/components/tables/AuditLogTable";
import Pagination from "@/components/ui/Pagination";
import FilterPopover, { type FilterFieldSpec } from "@/components/ui/FilterPopover";
import { ViewModalField } from "@/components/ui/ViewModal";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import { formatDate } from "@/utils/formatDate";
import {
  uploadCompanyLogo,
  removeCompanyLogo,
  settingsFileUrl,
} from "@/services/setting.service";
import {
  CURRENCY_OPTIONS,
  MONTH_OPTIONS,
  THEME_COLOR_OPTIONS,
  type Setting,
  type UpdateSettingData,
} from "@/types/setting";

const TABLE_NAMES = ["CUSTOMER", "PARTNER", "LOAN", "PAYMENT", "EXPENSE"];
const ACTIONS = ["CREATE", "UPDATE", "DELETE"];

const TABS = [
  { key: "general", label: "General" },
  { key: "legal", label: "Legal & Compliance" },
  { key: "branding", label: "Branding" },
  { key: "bank", label: "Bank Details" },
  { key: "audit", label: "Audit Log" },
] as const;

type TabKey = (typeof TABS)[number]["key"];
type SectionKey = Exclude<TabKey, "audit">;

const emptyForm: UpdateSettingData = {
  companyName: "",
  companyPhone: "",
  companyEmail: "",
  companyAddress: "",
  website: "",
  currency: "INR",
  receiptPrefix: "RCP",
  businessType: "",
  registrationNumber: "",
  gstin: "",
  pan: "",
  rbiLicenseNumber: "",
  dateOfIncorporation: "",
  defaultInterestPercentage: 0,
  defaultPenaltyPercentage: 0,
  financialYearStartMonth: 4,
  latePaymentGraceDays: 0,
  branchName: "",
  branchCode: "",
  branchManager: "",
  branchPhone: "",
  bankAccountHolderName: "",
  bankName: "",
  bankAccountNumber: "",
  bankIfscCode: "",
  bankBranchName: "",
  upiId: "",
  themeColor: THEME_COLOR_OPTIONS[0],
};

function toFormState(settings: Setting): UpdateSettingData {
  return {
    companyName: settings.companyName,
    companyPhone: settings.companyPhone,
    companyEmail: settings.companyEmail || "",
    companyAddress: settings.companyAddress || "",
    website: settings.website || "",
    currency: settings.currency || "INR",
    receiptPrefix: settings.receiptPrefix,
    businessType: settings.businessType || "",
    registrationNumber: settings.registrationNumber || "",
    gstin: settings.gstin || "",
    pan: settings.pan || "",
    rbiLicenseNumber: settings.rbiLicenseNumber || "",
    dateOfIncorporation: settings.dateOfIncorporation ? settings.dateOfIncorporation.slice(0, 10) : "",
    defaultInterestPercentage: Number(settings.defaultInterestPercentage),
    defaultPenaltyPercentage: Number(settings.defaultPenaltyPercentage),
    financialYearStartMonth: settings.financialYearStartMonth ?? 4,
    latePaymentGraceDays: settings.latePaymentGraceDays ?? 0,
    branchName: settings.branchName || "",
    branchCode: settings.branchCode || "",
    branchManager: settings.branchManager || "",
    branchPhone: settings.branchPhone || "",
    bankAccountHolderName: settings.bankAccountHolderName || "",
    bankName: settings.bankName || "",
    bankAccountNumber: settings.bankAccountNumber || "",
    bankIfscCode: settings.bankIfscCode || "",
    bankBranchName: settings.bankBranchName || "",
    upiId: settings.upiId || "",
    themeColor: settings.themeColor || THEME_COLOR_OPTIONS[0],
  };
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#6B6A62] mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18] placeholder:text-[#9C9A8D]"
      />
    </div>
  );
}

function SubHeading({ children }: { children: ReactNode }) {
  return <h3 className="text-xs font-semibold text-[#6B6A62] uppercase tracking-wide mb-3">{children}</h3>;
}

// Wraps one settings section with the shared View/Edit chrome: a header with
// an Edit button in view mode, and a Submit/Cancel footer in edit mode.
function Section({
  title,
  description,
  isEditing,
  onEdit,
  onCancel,
  onSubmit,
  saving,
  view,
  edit,
}: {
  title: string;
  description?: string;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSubmit: (e: SubmitEvent) => void;
  saving: boolean;
  view: ReactNode;
  edit: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-[#DAD7CA] bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-sm font-semibold text-[#1A1A18]">{title}</h2>
          {description && <p className="text-xs text-[#6B6A62] mt-0.5">{description}</p>}
        </div>
        {!isEditing && (
          <button
            type="button"
            onClick={onEdit}
            className="shrink-0 border border-[#9C9A8D] text-sm font-medium px-3 py-1.5 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
          >
            Edit
          </button>
        )}
      </div>

      <div className="mt-4">
        {isEditing ? (
          <form onSubmit={onSubmit}>
            {edit}
            <div className="flex items-center justify-end gap-3 border-t border-[#DAD7CA] mt-6 pt-4">
              <button
                type="button"
                onClick={onCancel}
                className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
              >
                {saving ? "Saving..." : "Submit"}
              </button>
            </div>
          </form>
        ) : (
          view
        )}
      </div>
    </div>
  );
}

export default function SettingsPage() {
  const [tab, setTab] = useState<TabKey>("general");
  const [editingSection, setEditingSection] = useState<SectionKey | null>(null);
  const { settings, loading, saving, error, save, refetch } = useSettings();
  const { user } = useAuthContext();
  const toast = useToast();

  const [form, setForm] = useState<UpdateSettingData>(emptyForm);
  const [logoBusy, setLogoBusy] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!settings) return;

    const load = () => setForm(toFormState(settings));
    load();
  }, [settings]);

  const set = <K extends keyof UpdateSettingData>(key: K, value: UpdateSettingData[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
  };

  // Leaving a section mid-edit (Cancel, a successful Submit, or navigating to
  // a different tab) always reverts any unsaved changes back to the last
  // saved values — a section is never left in an unsaved edit state.
  const exitEditMode = () => {
    setEditingSection(null);
    if (settings) setForm(toFormState(settings));
  };

  const handleTabChange = (key: TabKey) => {
    if (editingSection) exitEditMode();
    setTab(key);
  };

  const handleSectionSubmit = async (e: SubmitEvent) => {
    e.preventDefault();
    try {
      const { message } = await save(form);
      toast.success(message);
      setEditingSection(null);
      // `save` already updates `settings`, which re-syncs `form` via the
      // effect above — the section returns to view mode with fresh values.
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not save settings. Please try again."));
    }
  };

  const handleLogoSelected = async (file: File) => {
    setLogoBusy(true);
    try {
      const { message } = await uploadCompanyLogo(file);
      toast.success(message);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not upload logo."));
    } finally {
      setLogoBusy(false);
    }
  };

  const handleLogoRemove = async () => {
    setLogoBusy(true);
    try {
      const { message } = await removeCompanyLogo();
      toast.success(message);
      refetch();
    } catch (err) {
      toast.error(getErrorMessage(err, "Could not remove logo."));
    } finally {
      setLogoBusy(false);
    }
    if (logoInputRef.current) logoInputRef.current.value = "";
  };

  const currencyLabel = CURRENCY_OPTIONS.find((c) => c.value === settings?.currency)?.label ?? settings?.currency;
  const monthLabel = MONTH_OPTIONS.find((m) => m.value === settings?.financialYearStartMonth)?.label;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-[#1A1A18]">Settings</h1>
        <p className="text-sm text-[#45443E]">
          Everything about your company, business identity, and financial settings in one place.
        </p>
      </div>

      <div className="flex gap-1 border-b border-[#DAD7CA] flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => handleTabChange(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
              tab === t.key
                ? "border-[#1A1A18] text-[#1A1A18]"
                : "border-transparent text-[#6B6A62] hover:text-[#45443E]"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-10 bg-[#ECE9DF] rounded animate-pulse" />
          ))}
        </div>
      ) : error ? (
        <p className="text-sm text-[#993C1D]">{error}</p>
      ) : tab === "audit" ? (
        <AuditLogTab />
      ) : (
        <div className="space-y-6">
          {user && (
            <div className="rounded-2xl border border-[#DAD7CA] bg-white p-5">
              <h2 className="text-sm font-semibold text-[#1A1A18] mb-3">Signed in as</h2>
              <p className="text-sm text-[#1A1A18]">{user.name}</p>
              <p className="text-xs text-[#6B6A62]">
                {user.email} · {user.role}
              </p>
            </div>
          )}

          {tab === "general" && settings && (
            <Section
              title="General"
              description="Company identity and the financial/branch defaults applied across the app."
              isEditing={editingSection === "general"}
              onEdit={() => setEditingSection("general")}
              onCancel={exitEditMode}
              onSubmit={handleSectionSubmit}
              saving={saving}
              view={
                <div className="space-y-6">
                  <div>
                    <SubHeading>Company Details</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ViewModalField label="Company name" value={settings.companyName} />
                      <ViewModalField label="Phone" value={settings.companyPhone} />
                      <ViewModalField label="Email" value={settings.companyEmail} />
                      <ViewModalField label="Website" value={settings.website} />
                      <ViewModalField label="Receipt prefix" value={settings.receiptPrefix} />
                      <ViewModalField label="Currency" value={currencyLabel} />
                      <div className="sm:col-span-2">
                        <ViewModalField label="Registered address" value={settings.companyAddress} />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#ECE9DF] pt-4">
                    <SubHeading>Financial Settings</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ViewModalField label="Default interest %" value={`${settings.defaultInterestPercentage}%`} />
                      <ViewModalField label="Default penalty %" value={`${settings.defaultPenaltyPercentage}%`} />
                      <ViewModalField label="Financial year starts" value={monthLabel} />
                      <ViewModalField
                        label="Late payment grace period (days)"
                        value={String(settings.latePaymentGraceDays ?? 0)}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#ECE9DF] pt-4">
                    <SubHeading>Branch Details</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <ViewModalField label="Branch name" value={settings.branchName} />
                      <ViewModalField label="Branch code" value={settings.branchCode} />
                      <ViewModalField label="Branch manager" value={settings.branchManager} />
                      <ViewModalField label="Branch phone" value={settings.branchPhone} />
                    </div>
                  </div>
                </div>
              }
              edit={
                <div className="space-y-6">
                  <div>
                    <SubHeading>Company Details</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Company name" value={form.companyName} onChange={(v) => set("companyName", v)} required />
                      <Field label="Phone" value={form.companyPhone} onChange={(v) => set("companyPhone", v)} required />
                      <Field label="Email" value={form.companyEmail ?? ""} onChange={(v) => set("companyEmail", v)} type="email" />
                      <Field
                        label="Website"
                        value={form.website ?? ""}
                        onChange={(v) => set("website", v)}
                        placeholder="www.example.com"
                      />
                      <Field label="Receipt prefix" value={form.receiptPrefix} onChange={(v) => set("receiptPrefix", v)} required />
                      <div>
                        <label className="block text-xs text-[#6B6A62] mb-1">Currency</label>
                        <select
                          value={form.currency ?? "INR"}
                          onChange={(e) => set("currency", e.target.value)}
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        >
                          {CURRENCY_OPTIONS.map((c) => (
                            <option key={c.value} value={c.value}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs text-[#6B6A62] mb-1">Registered address</label>
                        <textarea
                          value={form.companyAddress ?? ""}
                          onChange={(e) => set("companyAddress", e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="border-t border-[#ECE9DF] pt-4">
                    <SubHeading>Financial Settings</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field
                        label="Default interest %"
                        type="number"
                        value={form.defaultInterestPercentage}
                        onChange={(v) => set("defaultInterestPercentage", Number(v))}
                        required
                      />
                      <Field
                        label="Default penalty %"
                        type="number"
                        value={form.defaultPenaltyPercentage}
                        onChange={(v) => set("defaultPenaltyPercentage", Number(v))}
                        required
                      />
                      <div>
                        <label className="block text-xs text-[#6B6A62] mb-1">Financial year starts</label>
                        <select
                          value={form.financialYearStartMonth ?? 4}
                          onChange={(e) => set("financialYearStartMonth", Number(e.target.value))}
                          className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                        >
                          {MONTH_OPTIONS.map((m) => (
                            <option key={m.value} value={m.value}>
                              {m.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Field
                        label="Late payment grace period (days)"
                        type="number"
                        value={form.latePaymentGraceDays ?? 0}
                        onChange={(v) => set("latePaymentGraceDays", Number(v))}
                      />
                    </div>
                  </div>

                  <div className="border-t border-[#ECE9DF] pt-4">
                    <SubHeading>Branch Details</SubHeading>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Field label="Branch name" value={form.branchName ?? ""} onChange={(v) => set("branchName", v)} />
                      <Field label="Branch code" value={form.branchCode ?? ""} onChange={(v) => set("branchCode", v)} />
                      <Field
                        label="Branch manager"
                        value={form.branchManager ?? ""}
                        onChange={(v) => set("branchManager", v)}
                        placeholder="Name of branch manager"
                      />
                      <Field
                        label="Branch phone"
                        value={form.branchPhone ?? ""}
                        onChange={(v) => set("branchPhone", v)}
                        placeholder="Branch contact number"
                      />
                    </div>
                  </div>
                </div>
              }
            />
          )}

          {tab === "legal" && settings && (
            <Section
              title="Legal & Compliance"
              description="Statutory identifiers required for filings and audits."
              isEditing={editingSection === "legal"}
              onEdit={() => setEditingSection("legal")}
              onCancel={exitEditMode}
              onSubmit={handleSectionSubmit}
              saving={saving}
              view={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ViewModalField label="Business type" value={settings.businessType} />
                  <ViewModalField label="Registration number" value={settings.registrationNumber} />
                  <ViewModalField label="GSTIN" value={settings.gstin} />
                  <ViewModalField label="PAN" value={settings.pan} />
                  <ViewModalField label="RBI / NBFC license no." value={settings.rbiLicenseNumber} />
                  <ViewModalField
                    label="Date of incorporation"
                    value={settings.dateOfIncorporation ? formatDate(settings.dateOfIncorporation) : undefined}
                  />
                </div>
              }
              edit={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Business type"
                    value={form.businessType ?? ""}
                    onChange={(v) => set("businessType", v)}
                    placeholder="NBFC / Partnership"
                  />
                  <Field
                    label="Registration number"
                    value={form.registrationNumber ?? ""}
                    onChange={(v) => set("registrationNumber", v)}
                    placeholder="e.g. U65999TN2022PTC000000"
                  />
                  <Field
                    label="GSTIN"
                    value={form.gstin ?? ""}
                    onChange={(v) => set("gstin", v.toUpperCase())}
                    placeholder="27ABCDE1234F1Z5"
                  />
                  <Field
                    label="PAN"
                    value={form.pan ?? ""}
                    onChange={(v) => set("pan", v.toUpperCase())}
                    placeholder="ABCDE1234F"
                  />
                  <Field
                    label="RBI / NBFC license no."
                    value={form.rbiLicenseNumber ?? ""}
                    onChange={(v) => set("rbiLicenseNumber", v)}
                    placeholder="N-14.03268"
                  />
                  <Field
                    label="Date of incorporation"
                    type="date"
                    value={form.dateOfIncorporation ?? ""}
                    onChange={(v) => set("dateOfIncorporation", v)}
                  />
                </div>
              }
            />
          )}

          {tab === "bank" && settings && (
            <Section
              title="Bank Details"
              description="Used for disbursements and receiving repayments."
              isEditing={editingSection === "bank"}
              onEdit={() => setEditingSection("bank")}
              onCancel={exitEditMode}
              onSubmit={handleSectionSubmit}
              saving={saving}
              view={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ViewModalField label="Account holder name" value={settings.bankAccountHolderName} />
                  <ViewModalField label="Bank name" value={settings.bankName} />
                  <ViewModalField label="Account number" value={settings.bankAccountNumber} />
                  <ViewModalField label="IFSC code" value={settings.bankIfscCode} />
                  <ViewModalField label="Branch" value={settings.bankBranchName} />
                  <ViewModalField label="UPI ID" value={settings.upiId} />
                </div>
              }
              edit={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Account holder name"
                    value={form.bankAccountHolderName ?? ""}
                    onChange={(v) => set("bankAccountHolderName", v)}
                  />
                  <Field
                    label="Bank name"
                    value={form.bankName ?? ""}
                    onChange={(v) => set("bankName", v)}
                    placeholder="e.g. Indian Bank"
                  />
                  <Field
                    label="Account number"
                    value={form.bankAccountNumber ?? ""}
                    onChange={(v) => set("bankAccountNumber", v)}
                    placeholder="XXXXXXXXXXXX"
                  />
                  <Field
                    label="IFSC code"
                    value={form.bankIfscCode ?? ""}
                    onChange={(v) => set("bankIfscCode", v.toUpperCase())}
                    placeholder="e.g. IDIB000T123"
                  />
                  <Field
                    label="Branch"
                    value={form.bankBranchName ?? ""}
                    onChange={(v) => set("bankBranchName", v)}
                    placeholder="Bank branch name"
                  />
                  <Field
                    label="UPI ID"
                    value={form.upiId ?? ""}
                    onChange={(v) => set("upiId", v)}
                    placeholder="company@upi"
                  />
                </div>
              }
            />
          )}

          {tab === "branding" && settings && (
            <Section
              title="Branding"
              description="Logo and theme color used across the app and receipts."
              isEditing={editingSection === "branding"}
              onEdit={() => setEditingSection("branding")}
              onCancel={exitEditMode}
              onSubmit={handleSectionSubmit}
              saving={saving}
              view={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <p className="text-xs text-[#6B6A62] mb-1">Company logo</p>
                    {settings.companyLogo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={settingsFileUrl(settings.companyLogo)}
                        alt="Company logo"
                        className="w-14 h-14 rounded-xl object-cover"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl bg-[#0E6B4F] flex items-center justify-center text-white text-lg font-semibold">
                        {settings.companyName?.[0]?.toUpperCase() ?? "A"}
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-xs text-[#6B6A62] mb-1">Theme color</p>
                    <div
                      className="w-8 h-8 rounded-lg"
                      style={{ backgroundColor: settings.themeColor || THEME_COLOR_OPTIONS[0] }}
                    />
                  </div>
                </div>
              }
              edit={
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs text-[#6B6A62] mb-1">Company logo</label>
                    <input
                      ref={logoInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/webp,image/svg+xml"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleLogoSelected(file);
                      }}
                    />
                    <button
                      type="button"
                      disabled={logoBusy}
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-[#9C9A8D] bg-[#F8FAFC] py-6 text-center disabled:opacity-50"
                    >
                      {settings.companyLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={settingsFileUrl(settings.companyLogo)}
                          alt="Company logo"
                          className="w-14 h-14 rounded-xl object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-xl bg-[#0E6B4F] flex items-center justify-center text-white text-lg font-semibold">
                          {form.companyName?.[0]?.toUpperCase() ?? "A"}
                        </div>
                      )}
                      <span className="text-xs text-[#6B6A62]">Click to upload logo (PNG/SVG, max 2MB)</span>
                    </button>
                    {settings.companyLogo && (
                      <button
                        type="button"
                        disabled={logoBusy}
                        onClick={handleLogoRemove}
                        className="mt-2 text-xs font-medium text-[#993C1D] hover:underline disabled:opacity-50"
                      >
                        Remove logo
                      </button>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-[#6B6A62] mb-1">Theme color</label>
                    <div className="flex items-center gap-2">
                      {THEME_COLOR_OPTIONS.map((color) => (
                        <button
                          key={color}
                          type="button"
                          onClick={() => set("themeColor", color)}
                          aria-label={`Select ${color}`}
                          className={`w-8 h-8 rounded-lg ${
                            form.themeColor === color ? "ring-2 ring-offset-2 ring-[#1A1A18]" : ""
                          }`}
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              }
            />
          )}
        </div>
      )}
    </div>
  );
}

function AuditLogTab() {
  const {
    logs,
    total,
    page,
    setPage,
    pageSize,
    setPageSize,
    totalPages,
    action,
    setAction,
    tableName,
    setTableName,
    loading,
    error,
    refetch,
  } = useAuditLogs();

  const filterFields: FilterFieldSpec[] = [
    {
      key: "action",
      label: "Action",
      kind: "select",
      value: action,
      onChange: (v) => {
        setAction(v);
        setPage(1);
      },
      options: [
        { value: "all", label: "All actions" },
        ...ACTIONS.map((a) => ({ value: a, label: a })),
      ],
    },
    {
      key: "table",
      label: "Table",
      kind: "select",
      value: tableName,
      onChange: (v) => {
        setTableName(v);
        setPage(1);
      },
      options: [
        { value: "all", label: "All tables" },
        ...TABLE_NAMES.map((t) => ({ value: t, label: t })),
      ],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-5">
        <div className="flex items-center justify-between">
          <p className="text-sm text-[#45443E]">
            {total} log{total !== 1 ? "s" : ""}
          </p>
          <FilterPopover fields={filterFields} />
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
            <AuditLogTable logs={logs} />

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
    </div>
  );
}
