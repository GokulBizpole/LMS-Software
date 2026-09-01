// components/ui/Toast.tsx
"use client";

import toastLib, { Toaster, type Toast as HotToast } from "react-hot-toast";
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from "lucide-react";

export type ToastVariant = "success" | "error" | "warning" | "info";

const VARIANT_STYLES: Record<
  ToastVariant,
  { bg: string; text: string; Icon: typeof CheckCircle2 }
> = {
  success: { bg: "#EAF3DE", text: "#3B6D11", Icon: CheckCircle2 },
  error: { bg: "#FAECE7", text: "#993C1D", Icon: XCircle },
  warning: { bg: "#FAEEDA", text: "#854F0B", Icon: AlertTriangle },
  info: { bg: "#E6F1FB", text: "#185FA5", Icon: Info },
};

const VARIANT_DURATION: Record<ToastVariant, number> = {
  success: 3500,
  info: 3500,
  warning: 5000,
  error: 5000,
};

function ToastCard({
  t,
  variant,
  message,
}: {
  t: HotToast;
  variant: ToastVariant;
  message: string;
}) {
  const { bg, text, Icon } = VARIANT_STYLES[variant];

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-lg w-full max-w-sm transition-all duration-200 ${
        t.visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      }`}
      style={{ backgroundColor: bg, borderColor: bg }}
    >
      <Icon size={18} className="shrink-0 mt-0.5" style={{ color: text }} />
      <p className="text-sm flex-1" style={{ color: text }}>
        {message}
      </p>
      <button
        type="button"
        onClick={() => toastLib.dismiss(t.id)}
        aria-label="Dismiss"
        className="shrink-0 opacity-70 hover:opacity-100"
        style={{ color: text }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function showToast(variant: ToastVariant, message: string) {
  return toastLib.custom((t) => <ToastCard t={t} variant={variant} message={message} />, {
    duration: VARIANT_DURATION[variant],
  });
}

export function AppToaster() {
  return <Toaster position="top-right" gutter={8} />;
}
