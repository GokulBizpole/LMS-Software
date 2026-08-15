// components/ui/FilterPopover.tsx
"use client";

import { useEffect, useRef, useState } from "react";

export type FilterFieldSpec =
  | {
      key: string;
      label: string;
      kind: "select";
      value: string;
      onChange: (value: string) => void;
      options: { value: string; label: string }[];
      defaultValue?: string;
    }
  | {
      key: string;
      label: string;
      kind: "dateRange";
      startValue: string;
      endValue: string;
      onStartChange: (value: string) => void;
      onEndChange: (value: string) => void;
    };

function clearField(field: FilterFieldSpec) {
  if (field.kind === "select") {
    field.onChange(field.defaultValue ?? "all");
  } else {
    field.onStartChange("");
    field.onEndChange("");
  }
}

export default function FilterPopover({ fields }: { fields: FilterFieldSpec[] }) {
  const [open, setOpen] = useState(false);
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [visibleKeys, setVisibleKeys] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  const visibleFields = fields.filter((f) => visibleKeys.includes(f.key));
  const hiddenFields = fields.filter((f) => !visibleKeys.includes(f.key));

  useEffect(() => {
    if (!open) return;

    const onMouseDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setAddMenuOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setAddMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", onMouseDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onMouseDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const handleClearAll = () => {
    fields.forEach(clearField);
    setVisibleKeys([]);
  };

  const handleRemove = (field: FilterFieldSpec) => {
    clearField(field);
    setVisibleKeys((prev) => prev.filter((k) => k !== field.key));
  };

  const handleAdd = (field: FilterFieldSpec) => {
    setVisibleKeys((prev) => [...prev, field.key]);
    setAddMenuOpen(false);
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg border border-[#9C9A8D] px-4 py-2 text-sm font-medium text-[#1A1A18] hover:bg-[#ECE9DF]"
      >
        Filter
        {visibleKeys.length > 0 && (
          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#D98324] text-white text-[11px] font-semibold">
            {visibleKeys.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 z-40 mt-2 w-[340px] rounded-2xl border border-[#DAD7CA] bg-white p-5 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-[#1A1A18]">
              Filters{visibleKeys.length > 0 ? ` (${visibleKeys.length})` : ""}
            </h3>

            {hiddenFields.length > 0 && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAddMenuOpen((v) => !v)}
                  className="text-sm font-medium text-[#185FA5] hover:underline"
                >
                  + Add filter
                </button>
                {addMenuOpen && (
                  <div className="absolute right-0 z-50 mt-1 w-44 rounded-lg border border-[#DAD7CA] bg-white py-1 shadow-lg">
                    {hiddenFields.map((f) => (
                      <button
                        key={f.key}
                        type="button"
                        onClick={() => handleAdd(f)}
                        className="block w-full text-left px-3 py-1.5 text-sm text-[#1A1A18] hover:bg-[#ECE9DF]"
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {visibleFields.length === 0 ? (
            <p className="text-sm text-[#6B6A62] mb-4">No filters added yet.</p>
          ) : (
            <div className="space-y-3 mb-4">
              {visibleFields.map((field, i) => (
                <div
                  key={field.key}
                  className="rounded-lg border border-[#DAD7CA] bg-[#FAFAF7] p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium tracking-wide text-[#6B6A62]">
                      FILTER {i + 1} · {field.label.toUpperCase()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemove(field)}
                      aria-label={`Remove ${field.label} filter`}
                      className="text-[#6B6A62] hover:text-[#1A1A18]"
                    >
                      ×
                    </button>
                  </div>

                  {field.kind === "select" ? (
                    <select
                      value={field.value}
                      onChange={(e) => field.onChange(e.target.value)}
                      className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
                    >
                      {field.options.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <label className="block text-[10px] text-[#6B6A62] mb-1">From</label>
                        <input
                          type="date"
                          value={field.startValue}
                          onChange={(e) => field.onStartChange(e.target.value)}
                          className="w-full rounded-lg border border-[#9C9A8D] px-2 py-1.5 text-sm text-[#1A1A18]"
                        />
                      </div>
                      <span className="text-[#6B6A62] mt-4">→</span>
                      <div className="flex-1">
                        <label className="block text-[10px] text-[#6B6A62] mb-1">To</label>
                        <input
                          type="date"
                          value={field.endValue}
                          onChange={(e) => field.onEndChange(e.target.value)}
                          className="w-full rounded-lg border border-[#9C9A8D] px-2 py-1.5 text-sm text-[#1A1A18]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between pt-3 border-t border-[#ECE9DF]">
            <button
              type="button"
              onClick={handleClearAll}
              disabled={visibleKeys.length === 0}
              className="text-sm font-medium text-[#993C1D] hover:underline disabled:opacity-40 disabled:hover:no-underline"
            >
              Clear all
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="text-sm font-medium text-[#185FA5] hover:underline"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
