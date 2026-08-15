// components/ui/FormField.tsx
"use client";

export function TextField({
  label,
  name,
  value,
  onChange,
  required,
  type = "text",
  colSpan,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  type?: string;
  colSpan?: string;
}) {
  return (
    <div className={colSpan}>
      <label className="block text-xs text-[#6B6A62] mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
      />
    </div>
  );
}

export function SelectField({
  label,
  name,
  value,
  onChange,
  required,
  options,
  placeholder,
  colSpan,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  options: { value: string; label: string }[];
  placeholder?: string;
  colSpan?: string;
}) {
  return (
    <div className={colSpan}>
      <label className="block text-xs text-[#6B6A62] mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextareaField({
  label,
  name,
  value,
  onChange,
  required,
  rows = 3,
  colSpan,
}: {
  label: string;
  name: string;
  value: string;
  onChange: (name: string, value: string) => void;
  required?: boolean;
  rows?: number;
  colSpan?: string;
}) {
  return (
    <div className={colSpan}>
      <label className="block text-xs text-[#6B6A62] mb-1">
        {label}
        {required ? " *" : ""}
      </label>
      <textarea
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        required={required}
        rows={rows}
        className="w-full rounded-lg border border-[#9C9A8D] px-3 py-2 text-sm text-[#1A1A18]"
      />
    </div>
  );
}
