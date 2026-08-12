// app/(dashboard)/partners/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createPartner, type CreatePartnerData } from "@/services/partner.service";

interface FormState {
  partnerCode: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  investmentAmount: string;
  currentBalance: string;
}

const initialForm: FormState = {
  partnerCode: "",
  name: "",
  phone: "",
  email: "",
  address: "",
  investmentAmount: "",
  currentBalance: "",
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

export default function CreatePartnerPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: CreatePartnerData = {
        partnerCode: form.partnerCode,
        name: form.name,
        phone: form.phone,
        email: form.email || undefined,
        address: form.address || undefined,
        investmentAmount: Number(form.investmentAmount) || 0,
        currentBalance: Number(form.currentBalance || form.investmentAmount) || 0,
      };

      const partner = await createPartner(payload);
      router.push(`/partners/${partner.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not create partner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/partners" className="text-sm text-[#185FA5]">
        ← Back to partners
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Add partner</h1>
        <p className="text-sm text-[#5F5E5A]">Create a new investing partner.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Partner details</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextField label="Partner code" name="partnerCode" value={form.partnerCode} onChange={handleChange} required />
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
          <p className="text-xs text-[#888780] mt-3">
            Leave current balance empty to default it to the investment amount.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save partner"}
          </button>
          <Link
            href="/partners"
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A] hover:bg-[#F1EFE8]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
