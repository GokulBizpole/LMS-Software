// app/(dashboard)/partners/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getPartnerById,
  updatePartner,
  type UpdatePartnerData,
} from "@/services/partner.service";
import type { Partner } from "@/types/partner";

interface FormState {
  name: string;
  phone: string;
  email: string;
  address: string;
  investmentAmount: string;
  currentBalance: string;
  status: Partner["status"];
}

const emptyForm: FormState = {
  name: "",
  phone: "",
  email: "",
  address: "",
  investmentAmount: "",
  currentBalance: "",
  status: "ACTIVE",
};

function TextField({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  required?: boolean;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs text-[#888780] mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
      />
    </div>
  );
}

function EditSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-[#F1EFE8] rounded" />
      <div className="h-6 w-48 bg-[#F1EFE8] rounded" />
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 bg-[#F1EFE8] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditPartnerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [partnerCode, setPartnerCode] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getPartnerById(id)
      .then((partner: Partner) => {
        setPartnerCode(partner.partnerCode);
        setForm({
          name: partner.name,
          phone: partner.phone,
          email: partner.email ?? "",
          address: partner.address ?? "",
          investmentAmount: String(partner.investmentAmount ?? ""),
          currentBalance: String(partner.currentBalance ?? ""),
          status: partner.status,
        });
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load partner.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setSubmitError(null);
    setSubmitting(true);

    try {
      const payload: UpdatePartnerData = {
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        investmentAmount: Number(form.investmentAmount) || 0,
        currentBalance: Number(form.currentBalance) || 0,
        status: form.status,
      };

      await updatePartner(id, payload);
      router.push(`/partners/${id}`);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Could not update partner.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <EditSkeleton />;
  }

  if (loadError) {
    return (
      <div className="space-y-4">
        <Link href="/partners" className="text-sm text-[#185FA5]">
          ← Back to partners
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/partners/${id}`} className="text-sm text-[#185FA5]">
        ← Back to partner
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Edit partner</h1>
        <p className="text-sm text-[#5F5E5A]">{partnerCode}</p>
      </div>

      {submitError && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D]">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#2C2C2A]">Partner details</h2>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="rounded-lg border border-[#B4B2A9] px-3 py-1.5 text-sm text-[#2C2C2A]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="INACTIVE">INACTIVE</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Investment</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextField
              label="Investment amount"
              name="investmentAmount"
              value={form.investmentAmount}
              onChange={handleChange}
              type="number"
              required
            />
            <TextField
              label="Current balance"
              name="currentBalance"
              value={form.currentBalance}
              onChange={handleChange}
              type="number"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            href={`/partners/${id}`}
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A] hover:bg-[#F1EFE8]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
