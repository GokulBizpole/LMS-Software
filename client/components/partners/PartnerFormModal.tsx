// components/partners/PartnerFormModal.tsx
"use client";

import { useEffect, useRef, useState } from "react";
import { User } from "lucide-react";
import Modal from "@/components/ui/Modal";
import { TextField } from "@/components/ui/FormField";
import {
  createPartner,
  getPartners,
  partnerFileUrl,
  removePartnerPhoto,
  updatePartner,
  uploadPartnerPhoto,
  type CreatePartnerData,
  type UpdatePartnerData,
} from "@/services/partner.service";
import { suggestCustomerCodePrefix, suggestNextCode } from "@/utils/generateCode";
import { useToast } from "@/hooks/useToast";
import { getErrorMessage } from "@/utils/getErrorMessage";
import type { Partner } from "@/types/partner";

interface FormState {
  partnerCode: string;
  // Empty means "not yet manually edited" — the create-mode field displays a
  // live suggestion derived from `name` until the admin types their own value.
  customerCodePrefix: string;
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
  customerCodePrefix: "",
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
  const toast = useToast();

  // Profile picture — edit mode uploads/removes immediately against the
  // existing partner; create mode just stages a file locally and uploads it
  // right after the new partner is created (there's no id to attach to yet).
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [stagedPhotoFile, setStagedPhotoFile] = useState<File | null>(null);
  const [stagedPhotoPreview, setStagedPhotoPreview] = useState<string | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Existing partners' customer-code prefixes, used to live-suggest a unique
  // one for a new partner as the admin types the name (create mode only).
  const [existingPrefixes, setExistingPrefixes] = useState<string[]>([]);

  useEffect(() => {
    if (!open) return;
    if (partner) {
      setForm({
        partnerCode: partner.partnerCode,
        customerCodePrefix: partner.customerCodePrefix ?? "",
        name: partner.name,
        phone: partner.phone,
        email: partner.email ?? "",
        password: "",
        address: partner.address ?? "",
        investmentAmount: String(partner.investmentAmount ?? ""),
        currentBalance: String(partner.currentBalance ?? ""),
        status: partner.status,
      });
      setPhotoUrl(partner.profilePicture ? partnerFileUrl(partner.profilePicture) : null);
    } else {
      setForm(emptyForm);
      setPhotoUrl(null);
      getPartners({ limit: 100 })
        .then((res) => {
          const codes = res.partners.map((p) => p.partnerCode).filter(Boolean);
          const suggested = suggestNextCode(codes, "PAR001");
          setForm((prev) => (prev.partnerCode ? prev : { ...prev, partnerCode: suggested }));
          setExistingPrefixes(
            res.partners.map((p) => p.customerCodePrefix).filter((p): p is string => Boolean(p))
          );
        })
        .catch(() => {});
    }
    setStagedPhotoFile(null);
    setStagedPhotoPreview(null);
  }, [open, partner]);

  // Revoke the staged-preview object URL once it's no longer needed.
  useEffect(() => {
    return () => {
      if (stagedPhotoPreview) URL.revokeObjectURL(stagedPhotoPreview);
    };
  }, [stagedPhotoPreview]);

  const handleChange = (name: string, value: string) => {
    setForm((prev) => ({ ...prev, [name as keyof FormState]: value }));
  };

  const handlePhotoSelected = async (file: File) => {
    if (isEdit && partner) {
      setPhotoBusy(true);
      try {
        const { data: updated, message } = await uploadPartnerPhoto(partner.id, file);
        setPhotoUrl(updated.profilePicture ? partnerFileUrl(updated.profilePicture) : null);
        toast.success(message);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not upload profile picture."));
      } finally {
        setPhotoBusy(false);
      }
    } else {
      if (stagedPhotoPreview) URL.revokeObjectURL(stagedPhotoPreview);
      setStagedPhotoFile(file);
      setStagedPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handlePhotoRemove = async () => {
    if (isEdit && partner) {
      setPhotoBusy(true);
      try {
        const { message } = await removePartnerPhoto(partner.id);
        setPhotoUrl(null);
        toast.success(message);
      } catch (err) {
        toast.error(getErrorMessage(err, "Could not remove profile picture."));
      } finally {
        setPhotoBusy(false);
      }
    } else {
      if (stagedPhotoPreview) URL.revokeObjectURL(stagedPhotoPreview);
      setStagedPhotoFile(null);
      setStagedPhotoPreview(null);
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Live-suggested prefix for a new partner, derived from the name as it's
  // typed; stops applying the moment the admin edits the field themselves
  // (once form.customerCodePrefix is non-empty, that value wins instead).
  const suggestedPrefix = isEdit
    ? ""
    : suggestCustomerCodePrefix(form.name, existingPrefixes);
  const effectivePrefix = form.customerCodePrefix || suggestedPrefix;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
          customerCodePrefix: form.customerCodePrefix || undefined,
        };
        const { data: updated, message } = await updatePartner(partner.id, payload);
        toast.success(message);
        onSaved(updated);
      } else {
        const payload: CreatePartnerData = {
          partnerCode: form.partnerCode,
          customerCodePrefix: effectivePrefix || undefined,
          name: form.name,
          phone: form.phone,
          email: form.email || undefined,
          password: form.password || undefined,
          address: form.address || undefined,
          investmentAmount: Number(form.investmentAmount) || 0,
          currentBalance: Number(form.currentBalance || form.investmentAmount) || 0,
        };
        const { data: created, message } = await createPartner(payload);
        toast.success(message);

        if (stagedPhotoFile) {
          try {
            const { data: withPhoto } = await uploadPartnerPhoto(created.id, stagedPhotoFile);
            onSaved(withPhoto);
          } catch (photoErr) {
            toast.error(getErrorMessage(photoErr, "Partner saved, but the profile picture could not be uploaded."));
            onSaved(created);
          }
        } else {
          onSaved(created);
        }
      }
    } catch (err: any) {
      toast.error(getErrorMessage(err, "Could not save partner."));
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
            className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {submitting ? "Saving..." : isEdit ? "Save changes" : "Save partner"}
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
      <form id="partner-form" onSubmit={handleSubmit} className="space-y-6">
        <div>
          <h3 className="text-sm font-semibold text-[#1A1A18] mb-3">Profile picture</h3>
          <div className="flex items-center gap-4 mb-2">
            <div className="w-16 h-16 shrink-0 rounded-full bg-[#EEEDFE] overflow-hidden flex items-center justify-center text-[#534AB7]">
              {stagedPhotoPreview || photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={stagedPhotoPreview ?? photoUrl ?? undefined}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <User size={24} />
              )}
            </div>
            <div className="flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handlePhotoSelected(file);
                }}
              />
              <button
                type="button"
                disabled={photoBusy}
                onClick={() => fileInputRef.current?.click()}
                className="border border-[#9C9A8D] text-sm font-medium px-3 py-1.5 rounded-lg text-[#45443E] hover:bg-[#ECE9DF] disabled:opacity-50"
              >
                {photoUrl || stagedPhotoPreview ? "Change" : "Upload"}
              </button>
              {(photoUrl || stagedPhotoPreview) && (
                <button
                  type="button"
                  disabled={photoBusy}
                  onClick={handlePhotoRemove}
                  className="text-sm font-medium text-[#993C1D] hover:underline disabled:opacity-50"
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <p className="text-xs text-[#6B6A62]">JPG, PNG or WEBP, up to 5MB.</p>
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">Partner details</h3>
            {isEdit && (
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="rounded-lg border border-[#9C9A8D] px-3 py-1.5 text-sm text-[#1A1A18]"
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
            <TextField
              label="Customer code prefix"
              name="customerCodePrefix"
              value={effectivePrefix}
              onChange={handleChange}
              required
            />
            <TextField label="Name" name="name" value={form.name} onChange={handleChange} required />
            <TextField label="Phone" name="phone" value={form.phone} onChange={handleChange} required />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} type="email" />
            <TextField label="Address" name="address" value={form.address} onChange={handleChange} />
          </div>
          <p className="text-xs text-[#6B6A62] mt-3">
            Used to auto-generate this partner&apos;s customer codes, e.g. PCUS001, PCUS002...
          </p>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-[#1A1A18] mb-1">Partner login</h3>
          <p className="text-xs text-[#6B6A62] mb-4">
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
          <h3 className="text-sm font-semibold text-[#1A1A18] mb-4">Investment</h3>
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
            <p className="text-xs text-[#6B6A62] mt-3">
              Leave current balance empty to default it to the investment amount.
            </p>
          )}
        </div>
      </form>
    </Modal>
  );
}
