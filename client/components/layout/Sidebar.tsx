// components/layout/Sidebar.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { ADMIN_NAV_SECTIONS } from "@/config/adminNav";
import { getSettings } from "@/services/setting.service";
import BrandLogo from "@/components/ui/BrandLogo";

export default function Sidebar() {
  const pathname = usePathname();
  const [branchName, setBranchName] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    getSettings()
      .then((s) => setBranchName(s.branchName || s.companyName))
      .catch(() => {});
  }, []);

  return (
    <aside
      className={`shrink-0 bg-white border-r border-[#E5E7EB] sticky top-0 h-screen flex flex-col p-4 transition-[width] duration-200 ${
        collapsed ? "w-18" : "w-60"
      }`}
    >
      <button
        type="button"
        onClick={() => setCollapsed((v) => !v)}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 top-8 w-6 h-6 rounded-full border border-[#E5E7EB] bg-white flex items-center justify-center text-[#6B6A62] hover:bg-[#F8FAFC] shadow-sm z-10"
      >
        {collapsed ? <ChevronRight size={13} /> : <ChevronLeft size={13} />}
      </button>

      <div className={`flex items-center mb-6 px-1 ${collapsed ? "justify-center" : ""}`}>
        <BrandLogo size="sm" showWordmark={!collapsed} />
      </div>

      <nav className="flex flex-col gap-5 flex-1 overflow-y-auto overflow-x-hidden">
        {ADMIN_NAV_SECTIONS.map((section) => (
          <div key={section.label}>
            {!collapsed && (
              <p className="px-3 mb-1.5 text-[10px] font-semibold tracking-wide text-[#9C9A8D] uppercase">
                {section.label}
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {section.items.map((item) => {
                const isActive = pathname?.startsWith(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    title={collapsed ? item.label : undefined}
                    className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm transition-colors ${
                      collapsed ? "justify-center" : ""
                    } ${
                      isActive
                        ? "bg-[#E31E24]/10 text-[#E31E24] font-semibold"
                        : "text-[#6B6A62] hover:bg-[#F8FAFC]"
                    }`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.75 h-5 rounded-full bg-[#E31E24]" />
                    )}
                    <Icon size={17} className="shrink-0" />
                    {!collapsed && item.label}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      <div
        className={`flex items-center gap-2.5 rounded-xl border border-[#E31E24]/20 bg-[#E31E24]/5 px-3 py-2.5 mt-4 ${
          collapsed ? "justify-center" : ""
        }`}
      >
        <div className="w-8 h-8 shrink-0 rounded-lg bg-[#E31E24]/10 flex items-center justify-center">
          <Building2 size={14} className="text-[#E31E24]" />
        </div>
        {!collapsed && (
          <div className="leading-tight min-w-0">
            <p className="text-xs font-semibold text-[#1A1A18] truncate">SKA Trust LMS</p>
            <p className="text-xs text-[#6B6A62] truncate">{branchName ?? "—"}</p>
          </div>
        )}
      </div>
    </aside>
  );
}
