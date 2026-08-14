// components/partners/PartnerFormModal.tsx
"use client";

import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormField";
import {
  createPartner,
  getPartners,
  updatePartner,
  type CreatePartnerData,
  type UpdatePartnerData,
} from "@/services/partner.service";
import { suggestNextCode } from "@/utils/generateCode";
import type { Partner } from "@/types/partner";

interface FormState {
  partnerCode: string;
  name: string;
  phone: string;
  email: string;
  password: string;
  address: string;
  investmentAmount: string;
  currentBalance: string;
  status: Partner["status"];
}

const emptyForm: FormState = {
  partnerCode: "",
  name: "",
  phone: "",
  email: "",
  password: "",
  address: "",
  investmentAmount: "",
  currentBalance: "",
  status: "ACTIVE",
};

export default function PartnerFormModal({
  open,
  onClose,
  onSaved,
  partner,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: (partner: Partner) => void;
  partner?: Partner | null;
}) {
  const isEdit = Boolean(partner);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setError(null);
    if (partner) {
      setForm({
        partnerCode: partner.partnerCode,
        name: partner.name,
        phone: partner.phone,
        email: partner.email ?? "",
        password: "",
        address: partner.address ?? "",
        investmentAmount: String(partner.investmentAmount ?? ""),
        currentBalance: String(partner.currentBalance ?? ""),
        status: partner.status,
      });
    } else {
      setForm(emptyForm);
      getPartners({ limit: 100 })
        .then((res) => {
          const codes = res.partners.map((p) => p.partnerCode).filter(Boolean);
          const suggested = suggestNextCode(codes, "PAR001");
          setForm((prev) => (prev.partnerCode ? prev : { ...prev, partnerCode: suggested }));
        })
        .catch(() => {});
    }
  }, [open, partner]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEdit && partner) {
        const payload: UpdatePartnerData = {
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password || undefined,
          address: form.address || undefined,
          investmentAmount: Number(form.investmentAmount) || 0,
          currentBalance: Number(form.currentBalance) || 0,
          status: form.status,
        };
        const updated = await updatePartner(partner.id, payload);
        onSaved(updated);
      } else {
        const payload: CreatePartnerData = {
          partnerCode: form.partnerCode,
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password || undefined,
          address: form.address || undefined,
          investmentAmount: Number(form.investmentAmount) || 0,
          currentBalance: Number(form.currentBalance || form.investmentAmount) || 0,
        };
        const created = await createPartner(payload);
        onSaved(created);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || err.message || "Could not save partner.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit partner" : "Add partner"}
      subtitle={isEdit ? partner?.partnerCode : "Create a new investing partner."}
      footer={
        <div className="flex items-center gap-3">
          <button
            type="submit"
            form="partner-form"
            disabled={submitting}
            className="bg-[#2C2C2A] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Save partner"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="border border-[#B4B2A9] text-sm font-medium px-4 py-2 rounded-lg text-[#5F5E5A] hover:bg-[#F1EFE8]"
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

      <form id="partner-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#2C2C2A]">Partner details</h3>
            {isEdit && (
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="rounded-lg border border-[#B4B2A9] px-3 py-1.5 text-sm text-[#2C2C2A]"
              >
                <option value="ACTIVE">ACTIVE</option>
                <option value="INACTIVE">INACTIVE</option>
              </select>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {!isEdit && (
              <TextField
                label="Partner code"
                name="partnerCode"
                value={form.partnerCode}
                onChange={handleChange}
                required
              />
            )}
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#2C2C2A] mb-1">Partner login</h3>
          <p className="text-xs text-[#888780] mb-4">
            {isEdit
              ? "Leave blank to keep the current password unchanged."
              : "Optional. Set a password so this partner can sign in with the email above."}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <TextField
              label={isEdit ? "New password" : "Password"}
              name="password"
              value={form.password}
              onChange={handleChange}
              type="password"
            />
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#2C2C2A] mb-4">Investment</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
          {!isEdit && (
            <p className="text-xs text-[#888780] mt-3">
              Leave current balance empty to default it to the investment amount.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
