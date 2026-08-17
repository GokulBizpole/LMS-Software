// app/(partner)/partner/profile/page.tsx
"use client";

import { useEffect, useState } from "react";
import {
  getMyProfile,
  updateMyProfile,
  changeMyPassword,
} from "@/services/partnerProfile.service";
import { TextField } from "@/components/ui/FormField";
import type { Partner } from "@/types/partner";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

function StatusBadge({ status }: { status: Partner["status"] }) {
  const map: Record<Partner["status"], { bg: string; text: string }> = {
    ACTIVE: { bg: "#EAF3DE", text: "#3B6D11" },
    INACTIVE: { bg: "#ECE9DF", text: "#45443E" },
  };
  const c = map[status] ?? map.INACTIVE;
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function PartnerProfilePage() {
  const [partner, setPartner] = useState<Partner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profileForm, setProfileForm] = useState({ name: "", phone: "", address: "" });
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  const [passwordForm, setPasswordForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError(null);
    getMyProfile()
      .then((p) => {
        setPartner(p);
        setProfileForm({ name: p.name, phone: p.phone, address: p.address ?? "" });
      })
      .catch((err) => {
        console.error(err);
        setError("Could not load profile.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleProfileChange = (name: string, value: string) => {
    setProfileForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileError(null);
    setProfileMessage(null);
    setProfileSaving(true);
    try {
      const updated = await updateMyProfile(profileForm);
      setPartner(updated);
      setProfileMessage("Profile updated successfully.");
    } catch (err: any) {
      setProfileError(err?.response?.data?.message || err.message || "Could not update profile.");
    } finally {
      setProfileSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);
    setPasswordMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }

    setPasswordSaving(true);
    try {
      await changeMyPassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordMessage("Password changed successfully.");
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    } catch (err: any) {
      setPasswordError(err?.response?.data?.message || err.message || "Could not change password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 h-24" />
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 h-56" />
      </div>
    );
  }

  if (error || !partner) {
    return (
      <div className="rounded-2xl border border-[#FAECE7] bg-[#FAECE7] p-6 text-center text-[#993C1D] text-sm">
        <p className="mb-3">{error ?? "Profile not found."}</p>
        <button onClick={load} className="text-sm font-semibold underline">
          Try again
        </button>
      </div>
    );
  }

  const initials = partner.name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6 flex items-center gap-4">
        <div className="w-14 h-14 shrink-0 rounded-full bg-[#E6F1FB] flex items-center justify-center text-[#185FA5] text-lg font-semibold">
          {initials}
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-semibold text-[#1A1A18]">{partner.name}</h1>
            <StatusBadge status={partner.status} />
          </div>
          <p className="text-sm text-[#45443E]">
            {partner.partnerCode} · {partner.email}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Edit profile</h2>

          {profileError && (
            <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D] mb-4">
              {profileError}
            </div>
          )}
          {profileMessage && (
            <div className="rounded-lg border border-[#EAF3DE] bg-[#EAF3DE] p-3 text-sm text-[#3B6D11] mb-4">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <TextField label="Name" name="name" value={profileForm.name} onChange={handleProfileChange} required />
            <TextField label="Phone" name="phone" value={profileForm.phone} onChange={handleProfileChange} required />
            <TextField label="Address" name="address" value={profileForm.address} onChange={handleProfileChange} />
            <button
              type="submit"
              disabled={profileSaving}
              className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {profileSaving ? "Saving..." : "Save changes"}
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-[#DAD7CA] bg-white p-6">
          <h2 className="text-sm font-semibold text-[#1A1A18] mb-4">Change password</h2>

          {passwordError && (
            <div className="rounded-lg border border-[#FAECE7] bg-[#FAECE7] p-3 text-sm text-[#993C1D] mb-4">
              {passwordError}
            </div>
          )}
          {passwordMessage && (
            <div className="rounded-lg border border-[#EAF3DE] bg-[#EAF3DE] p-3 text-sm text-[#3B6D11] mb-4">
              {passwordMessage}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <TextField
              label="Current password"
              name="currentPassword"
              type="password"
              value={passwordForm.currentPassword}
              onChange={(name, value) => setPasswordForm((p) => ({ ...p, [name]: value }))}
              required
            />
            <TextField
              label="New password"
              name="newPassword"
              type="password"
              value={passwordForm.newPassword}
              onChange={(name, value) => setPasswordForm((p) => ({ ...p, [name]: value }))}
              required
            />
            <TextField
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(name, value) => setPasswordForm((p) => ({ ...p, [name]: value }))}
              required
            />
            <button
              type="submit"
              disabled={passwordSaving}
              className="bg-[#1A1A18] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
            >
              {passwordSaving ? "Updating..." : "Change password"}
            </button>
          </form>
        </div>
      </div>

      <div className="rounded-2xl border border-[#DAD7CA] bg-[#ECE9DF] p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <p className="text-xs text-[#6B6A62] mb-1">Total invested</p>
            <p className="text-sm text-[#1A1A18]">{formatCurrency(partner.investmentAmount)}</p>
          </div>
          <div>
            <p className="text-xs text-[#6B6A62] mb-1">Member since</p>
            <p className="text-sm text-[#1A1A18]">{formatDate(partner.createdAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
