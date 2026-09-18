// components/ui/StatusDot.tsx
// A small dot + label status indicator (e.g. "• Active"), for the newer
// list-page table style. Purely presentational — pass whatever color fits.
export default function StatusDot({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium" style={{ color }}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
