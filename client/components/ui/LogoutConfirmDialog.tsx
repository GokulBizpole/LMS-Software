// components/ui/LogoutConfirmDialog.tsx
"use client";

import { LogOut } from "lucide-react";

export default function LogoutConfirmDialog({
  open,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-999 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl bg-white shadow-xl overflow-hidden">
        <div className="p-6 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-[#FCE4E4] flex items-center justify-center mb-4">
            <LogOut size={22} className="text-[#E31E24]" />
          </div>
          <h2 className="text-base font-bold text-[#1A1A18] mb-2">Logout confirmation</h2>
          <p className="text-sm text-[#6B6A62] mb-6">
            Are you sure you want to logout? You&apos;ll need to login again.
          </p>
          <div className="flex items-center gap-3 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 border border-[#9C9A8D] text-sm font-medium px-4 py-2.5 rounded-lg text-[#45443E] hover:bg-[#ECE9DF]"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="flex-1 flex items-center justify-center gap-2 bg-[#E31E24] text-white text-sm font-medium px-4 py-2.5 rounded-lg hover:bg-[#E31E24]/90"
            >
              <LogOut size={15} />
              Logout
            </button>
          </div>
        </div>
        <div className="bg-[#F8FAFC] py-2.5 text-center text-[10px] font-semibold tracking-wide text-[#9C9A8D] uppercase">
          SKA Trust · Secure session
        </div>
      </div>
    </div>
  );
}
