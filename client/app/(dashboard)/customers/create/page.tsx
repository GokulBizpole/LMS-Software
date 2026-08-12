// app/(dashboard)/customers/create/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createCustomer, type CreateCustomerData } from "@/services/customer.service";

const initialForm: CreateCustomerData = {
  customerCode: "",
  name: "",
  phone: "",
  alternatePhone: "",
  aadhaarNumber: "",
  panNumber: "",
  address: "",
  city: "",
  state: "",
  pincode: "",
  guarantorName: "",
  guarantorPhone: "",
};

function TextField({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: keyof CreateCustomerData;
  value: string;
  onChange: (name: keyof CreateCustomerData, value: string) => void;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs text-[#888780] mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full rounded-lg border border-[#B4B2A9] px-3 py-2 text-sm text-[#2C2C2A]"
      />
    </div>
  );
}

export default function CreateCustomerPage() {
  const router = useRouter();
  const [form, setForm] = useState<CreateCustomerData>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (name: keyof CreateCustomerData, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const payload: CreateCustomerData = {
        ...form,
        alternatePhone: form.alternatePhone || undefined,
        aadhaarNumber: form.aadhaarNumber || undefined,
        panNumber: form.panNumber || undefined,
        address: form.address || undefined,
        city: form.city || undefined,
        state: form.state || undefined,
        pincode: form.pincode || undefined,
        guarantorName: form.guarantorName || undefined,
        guarantorPhone: form.guarantorPhone || undefined,
      };

      const customer = await createCustomer(payload);
      router.push(`/customers/${customer.id}`);
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not create customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <Link href="/customers" className="text-sm text-[#185FA5]">
        ← Back to customers
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Add customer</h1>
        <p className="text-sm text-[#5F5E5A]">Create a new customer record.</p>
      </div>

      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Personal details</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <TextField label="Customer code" name="customerCode" value={form.customerCode} onChange={handleChange} required />
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <TextField label="Alternate phone" name="alternatePhone" value={form.alternatePhone ?? ""} onChange={handleChange} />
            <TextField label="Aadhaar number" name="aadhaarNumber" value={form.aadhaarNumber ?? ""} onChange={handleChange} />
            <TextField label="PAN number" name="panNumber" value={form.panNumber ?? ""} onChange={handleChange} />
            <TextField label="Address" name="address" value={form.address ?? ""} onChange={handleChange} />
            <TextField label="City" name="city" value={form.city ?? ""} onChange={handleChange} />
            <TextField label="State" name="state" value={form.state ?? ""} onChange={handleChange} />
            <TextField label="Pincode" name="pincode" value={form.pincode ?? ""} onChange={handleChange} />
          </div>
        </div>

        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Guarantor</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
            <TextField label="Guarantor name" name="guarantorName" value={form.guarantorName ?? ""} onChange={handleChange} />
            <TextField label="Guarantor phone" name="guarantorPhone" value={form.guarantorPhone ?? ""} onChange={handleChange} />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save customer"}
          </button>
          <Link
            href="/customers"
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
