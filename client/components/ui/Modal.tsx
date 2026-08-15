// components/ui/Modal.tsx
"use client";

import { useEffect } from "react";
import type { ReactNode } from "react";

export default function Modal({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  maxWidth?: string;
}) {
  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKeyDown);

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = originalOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div
        className={`relative w-full ${maxWidth} max-h-[90vh] rounded-2xl bg-white shadow-xl flex flex-col`}
      >
        <div className="flex items-start justify-between gap-4 px-6 py-5 border-b border-[#DAD7CA] shrink-0">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold text-[#1A1A18]">{title}</h2>
            {subtitle && <p className="text-sm text-[#45443E] mt-0.5">{subtitle}</p>}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="shrink-0 text-[#6B6A62] hover:text-[#1A1A18] text-2xl leading-none p-1"
          >
            ×
          </button>
        </div>

        <div className="overflow-y-auto px-6 py-5 flex-1">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-[#DAD7CA] shrink-0">{footer}</div>
        )}
      </div>
    </div>
  );
}
