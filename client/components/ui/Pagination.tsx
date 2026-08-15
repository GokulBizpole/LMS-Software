// components/ui/Pagination.tsx
"use client";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

function getPageNumbers(current: number, total: number): (number | "...")[] {
  const delta = 1;
  const range: number[] = [];

  for (let i = 1; i <= total; i++) {
    if (i === 1 || i === total || (i >= current - delta && i <= current + delta)) {
      range.push(i);
    }
  }

  const pages: (number | "...")[] = [];
  let prev = 0;
  for (const i of range) {
    if (prev) {
      if (i - prev === 2) pages.push(prev + 1);
      else if (i - prev > 2) pages.push("...");
    }
    pages.push(i);
    prev = i;
  }

  return pages;
}

export default function Pagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
}: {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
}) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);
  const pageNumbers = getPageNumbers(page, totalPages);

  return (
    <div className="flex items-center justify-between mt-4 pt-4 border-t border-[#ECE9DF] flex-wrap gap-3">
      <p className="text-xs text-[#6B6A62]">
        Showing {start}-{end} of {total}
      </p>

      <div className="flex items-center gap-4">
        {onPageSizeChange && (
          <div className="flex items-center gap-2 text-xs text-[#6B6A62]">
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="rounded-lg border border-[#C4C1B3] px-2 py-1 text-xs text-[#1A1A18] bg-white"
            >
              {pageSizeOptions.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="w-8 h-8 rounded-lg border border-[#C4C1B3] text-sm disabled:opacity-40"
          >
            ‹
          </button>

          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span key={`dots-${i}`} className="px-1 text-xs text-[#9C9A8D]">
                …
              </span>
            ) : (
              <button
                type="button"
                key={p}
                onClick={() => onPageChange(p)}
                className={`w-8 h-8 rounded-lg text-sm ${
                  p === page
                    ? "bg-[#378ADD] text-white font-medium"
                    : "border border-[#C4C1B3] text-[#45443E] hover:bg-[#ECE9DF]"
                }`}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="w-8 h-8 rounded-lg border border-[#C4C1B3] text-sm disabled:opacity-40"
          >
            ›
          </button>
        </div>
      </div>
    </div>
  );
}
