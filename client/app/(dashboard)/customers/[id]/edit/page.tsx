// app/(dashboard)/customers/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getCustomerById } from "@/services/customer.service";
import type { Customer } from "@/types/customer";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Customer["status"] }) {
  const map: Record<Customer["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    BLOCKED: { bg: "#FAEEDA", text: "#854F0B" },
    CLOSED: { bg: "#F1EFE8", text: "#5F5E5A" },
  };
  const c = map[status] ?? map.CLOSED;
  return (
    <span
      className="text-xs font-medium px-2 py-1 rounded-md"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {status}
    </span>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-[#888780] mb-1">{label}</p>
      <p className="text-sm text-[#2C2C2A]">{value || "—"}</p>
    </div>
  );
}

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    getCustomerById(id)
      .then(setCustomer)
      .catch((err) => {
        console.error(err);
        setError("Could not load customer.");
      })
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="h-40 bg-[#F1EFE8] rounded-2xl animate-pulse" />;
  }

  if (error || !customer) {
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
        {error ?? "Customer not found."}
      </div>
    );
  }

  const initials = customer.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <button
        onClick={() => router.push("/customers")}
        className="text-sm text-[#185FA5]"
      >
        ← Back to customers
      </button>

      {/* Profile header */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#FAECE7] flex items-center justify-center text-[#993C1D] text-lg font-semibold">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-[#2C2C2A]">{customer.name}</h1>
              <StatusBadge status={customer.status} />
            </div>
            <p className="text-sm text-[#5F5E5A]">
              {customer.customerCode} · {customer.phone}
              {customer.city ? ` · ${customer.city}, ${customer.state ?? ""}` : ""}
            </p>
          </div>
        </div>
        <Link
          href={`/customers/${customer.id}/edit`}
          className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A]"
        >
          Edit
        </Link>
      </div>

      {/* Details */}
      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Personal details</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <Field label="Phone" value={customer.phone} />
          <Field label="Alternate phone" value={customer.alternatePhone} />
          <Field label="Aadhaar number" value={customer.aadhaarNumber} />
          <Field label="PAN number" value={customer.panNumber} />
          <Field label="Address" value={customer.address} />
          <Field label="City" value={customer.city} />
          <Field label="State" value={customer.state} />
          <Field label="Pincode" value={customer.pincode} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-white p-6">
        <h2 className="text-sm font-semibold text-[#2C2C2A] mb-4">Guarantor</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
          <Field label="Guarantor name" value={customer.guarantorName} />
          <Field label="Guarantor phone" value={customer.guarantorPhone} />
        </div>
      </div>

      <div className="rounded-2xl border border-[#E8E6DF] bg-[#F1EFE8] p-6">
        <div className="grid grid-cols-2 gap-6">
          <Field label="Registered" value={formatDate(customer.createdAt)} />
          <Field label="Last updated" value={formatDate(customer.updatedAt)} />
        </div>
      </div>

      {/*
        NOTE: Loan history for this customer isn't wired up here yet —
        it needs a GET /loans?customerId=... (or similar) endpoint.
        Once confirmed, add a loans table section below.
      */}
    </div>
  );
}