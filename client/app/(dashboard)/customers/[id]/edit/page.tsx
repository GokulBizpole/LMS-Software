// app/(dashboard)/customers/[id]/edit/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getCustomerById,
  updateCustomer,
  type UpdateCustomerData,
} from "@/services/customer.service";
import type { Customer } from "@/types/customer";

type FormState = UpdateCustomerData;

const emptyForm: FormState = {
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
  status: "ACTIVE",
};

function TextField({
  label,
  name,
  value,
  onChange,
  required,
}: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
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

function EditSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 w-32 bg-[#F1EFE8] rounded" />
      <div className="h-6 w-48 bg-[#F1EFE8] rounded" />
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-9 bg-[#F1EFE8] rounded" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function EditCustomerPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [customerCode, setCustomerCode] = useState("");
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCustomerById(id)
      .then((customer: Customer) => {
        setCustomerCode(customer.customerCode);
        setForm({
          name: customer.name,
          phone: customer.phone,
          alternatePhone: customer.alternatePhone ?? "",
          aadhaarNumber: customer.aadhaarNumber ?? "",
          panNumber: customer.panNumber ?? "",
          address: customer.address ?? "",
          city: customer.city ?? "",
          state: customer.state ?? "",
          pincode: customer.pincode ?? "",
          guarantorName: customer.guarantorName ?? "",
          guarantorPhone: customer.guarantorPhone ?? "",
          status: customer.status,
        });
      })
      .catch((err) => {
        console.error(err);
        setLoadError("Could not load customer.");
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
      const payload: UpdateCustomerData = {
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

      await updateCustomer(id, payload);
      router.push(`/customers/${id}`);
    } catch (err: any) {
      setSubmitError(err?.response?.data?.message || err.message || "Could not update customer.");
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
        <Link href="/customers" className="text-sm text-[#185FA5]">
          ← Back to customers
        </Link>
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
          {loadError}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link href={`/customers/${id}`} className="text-sm text-[#185FA5]">
        ← Back to customer
      </Link>

      <div>
        <h1 className="text-xl font-semibold text-[#2C2C2A]">Edit customer</h1>
        <p className="text-sm text-[#5F5E5A]">{customerCode}</p>
      </div>

      {submitError && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D]">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-[#2C2C2A]">Personal details</h2>
            <select
              value={form.status}
              onChange={(e) => handleChange("status", e.target.value)}
              className="rounded-lg border border-[#B4B2A9] px-3 py-1.5 text-sm text-[#2C2C2A]"
            >
              <option value="ACTIVE">ACTIVE</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <TextField label="Name" name="name" value={form.name ?? ""} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone ?? ""} onChange={handleChange} required />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
            {submitting ? "Saving..." : "Save changes"}
          </button>
          <Link
            href={`/customers/${id}`}
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A] hover:bg-[#F1EFE8]"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
