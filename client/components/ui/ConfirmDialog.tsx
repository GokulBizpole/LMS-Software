// components/ui/ConfirmDialog.tsx
"use client";

import Modal from "@/components/ui/Modal";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmLabel = "Delete",
  confirming = false,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message: string;
  confirmLabel?: string;
  confirming?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      maxWidth="max-w-md"
      footer={
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onConfirm}
            disabled={confirming}
            className="bg-[#993C1D] text-white text-sm font-medium px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {confirming ? "Deleting..." : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={confirming}
            className="border border-[#9C9A8D] text-sm font-medium px-4 py-2 rounded-lg text-[#45443E] hover:bg-[#ECE9DF] disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      }
    >
      <p className="text-sm text-[#45443E]">{message}</p>
    </Modal>
  );
}
