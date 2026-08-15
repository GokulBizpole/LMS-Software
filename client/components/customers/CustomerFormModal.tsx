// components/customers/CustomerFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormField";
import {
  createCustomer,
  getCustomers,
  updateCustomer,
  type CreateCustomerData,
  type UpdateCustomerData,
} from "@/services/customer.service";
import { suggestNextCode } from "@/utils/generateCode";
import type { Customer } from "@/types/customer";

interface FormState {
  customerCode: string;
  name: string;
  phone: string;
  alternatePhone: string;
  aadhaarNumber: string;
  panNumber: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  guarantorName: string;
  guarantorPhone: string;
  status: Customer["status"];
}

const emptyForm: FormState = {
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
  status: "ACTIVE",
};

export default function CustomerFormModal({
  open,
  onClose,
  onSaved,
  customer,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
  customer?: Customer | null;
}) {
  const isEdit = Boolean(customer);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (customer) {
      setForm({
        customerCode: customer.customerCode,
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
    } else {
      setForm(emptyForm);
      getCustomers({ limit: 100 })
        .then((res) => {
          const codes = res.customers.map((c) => c.customerCode).filter(Boolean);
          const suggested = suggestNextCode(codes, "CUS001");
          setForm((prev) => (prev.customerCode ? prev : { ...prev, customerCode: suggested }));
        })
        .catch(() => {});
    }
  }, [open, customer]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit && customer) {
        const payload: UpdateCustomerData = {
          name: form.name,
          phone: form.phone,
          alternatePhone: form.alternatePhone || undefined,
          aadhaarNumber: form.aadhaarNumber || undefined,
          panNumber: form.panNumber || undefined,
          address: form.address || undefined,
          city: form.city || undefined,
          state: form.state || undefined,
          pincode: form.pincode || undefined,
          guarantorName: form.guarantorName || undefined,
          guarantorPhone: form.guarantorPhone || undefined,
          status: form.status,
        };
        const updated = await updateCustomer(customer.id, payload);
        onSaved(updated);
      } else {
        const payload: CreateCustomerData = {
          customerCode: form.customerCode,
          name: form.name,
          phone: form.phone,
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
        const created = await createCustomer(payload);
        onSaved(created);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not save customer.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit customer" : "Add customer"}
      subtitle={isEdit ? customer?.customerCode : "Create a new customer record."}
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="customer-form"
            disabled={submitting}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Save customer"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
          >
            Cancel
          </button>
        </div>
      }
    >
      {error && (
        <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-4 text-sm text-[#993C1D] mb-4">
          {error}
        </div>
      )}

      <form id="customer-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Personal details</h3>
            {isEdit && (
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="rounded-lg border border-[#9C9A8D] px-3 py-1.5 text-sm text-[#1A1A18]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="BLOCKED">BLOCKED</option>
                <option value="CLOSED">CLOSED</option>
              </select>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {!isEdit && (
              <TextField
                label="Customer code"
                name="customerCode"
                value={form.customerCode}
                onChange={handleChange}
                required
              />
            )}
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <TextField label="Alternate phone" name="alternatePhone" value={form.alternatePhone} onChange={handleChange} />
            <TextField label="Aadhaar number" name="aadhaarNumber" value={form.aadhaarNumber} onChange={handleChange} />
            <TextField label="PAN number" name="panNumber" value={form.panNumber} onChange={handleChange} />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} />
            <TextField label="City" name="city" value={form.city} onChange={handleChange} />
            <TextField label="State" name="state" value={form.state} onChange={handleChange} />
            <TextField label="Pincode" name="pincode" value={form.pincode} onChange={handleChange} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Guarantor</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextField label="Guarantor name" name="guarantorName" value={form.guarantorName} onChange={handleChange} />
            <TextField label="Guarantor phone" name="guarantorPhone" value={form.guarantorPhone} onChange={handleChange} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
