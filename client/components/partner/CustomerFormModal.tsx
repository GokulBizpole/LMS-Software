// components/partner/CustomerFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormField";
import {
  createMyCustomer,
  type CreateMyCustomerData,
} from "@/services/partnerCustomer.service";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Customer } from "@/types/customer";

interface FormState {
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
}

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
};

export default function PartnerCustomerFormModal({
  open,
  onClose,
  onSaved,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (customer: Customer) => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (!open) return;
    setForm(emptyForm);
  }, [open]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const payload: CreateMyCustomerData = {
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
      const { data: created, message } = await createMyCustomer(payload);
      toast.success(message);
      onSaved(created);
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Could not save customer."));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add customer"
      subtitle="Create a new customer record under your account."
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="partner-customer-form"
            disabled={submitting}
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save customer"}
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
      <form id="partner-customer-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Personal details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
