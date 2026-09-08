// components/ui/ViewModal.tsx
"use client";

import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import Link from "next/link";

export function ViewModalShell({
  open,
  onClose,
  title,
  actions,
  children,
  maxWidth = "max-w-2xl",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  actions?: ReactNode;
  children: ReactNode;
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
        <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-[#DAD7CA] shrink-0">
          <h2 className="text-lg font-semibold text-[#1A1A18]">{title}</h2>
          <div className="flex items-center gap-3 shrink-0">
            {actions}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="text-[#6B6A62] hover:text-[#1A1A18] text-2xl leading-none p-1"
            >
              ×
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

export function ViewModalSummary({
  initials,
  avatarBg,
  avatarColor,
  name,
  badge,
  subtitle,
  action,
}: {
  initials: string;
  avatarBg: string;
  avatarColor: string;
  name: string;
  badge?: ReactNode;
  subtitle: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4 px-6 py-4 bg-[#F8FAFC] border-b border-[#E5E7EB]">
      <div className="flex items-center gap-3 min-w-0">
        <div
          className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center text-sm font-semibold"
          style={{ backgroundColor: avatarBg, color: avatarColor }}
        >
          {initials}
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-[#1A1A18]">{name}</p>
            {badge}
          </div>
          <p className="text-xs text-[#6B6A62]">{subtitle}</p>
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function ViewModalTabs({
  tabs,
  active,
  onChange,
}: {
  tabs: { key: string; label: string }[];
  active: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="flex gap-1 border-b border-[#DAD7CA] px-6">
      {tabs.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onChange(t.key)}
          className={`px-3 py-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
            active === t.key
              ? "border-[#1A1A18] text-[#1A1A18]"
              : "border-transparent text-[#6B6A62] hover:text-[#45443E]"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}

export function ViewModalSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="rounded-xl border border-[#E5E7EB]">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-[#1A1A18]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#3B6D11]" />
          {title}
        </span>
        <ChevronDown
          size={16}
          className={`text-[#6B6A62] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function ViewModalField({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div>
      <p className="text-xs text-[#6B6A62] mb-1">{label}</p>
      <p className="text-sm text-[#1A1A18] wrap-break-word">{value || "—"}</p>
    </div>
  );
}

export function ViewModalFooterStrip({
  registered,
  updated,
}: {
  registered?: string;
  updated?: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-6 px-6 py-4 bg-[#ECE9DF]">
      <ViewModalField label="Registered" value={registered} />
      <ViewModalField label="Last updated" value={updated} />
    </div>
  );
}

export function ViewModalOpenFullPage({ href }: { href: string }) {
  return (
    <Link
      href={href}
      className="text-sm font-medium text-[#185FA5] hover:underline whitespace-nowrap"
    >
      Open full page →
    </Link>
  );
}
