// components/tables/EodReportViewModal.tsx
"use client";

import { useEffect, useState } from "react";
import {
  ViewModalShell,
  ViewModalSummary,
  ViewModalSection,
  ViewModalField,
  ViewModalFooterStrip,
  ViewModalOpenFullPage,
} from "@/components/ui/ViewModal";
import { getEodReportById } from "@/services/eod.service";
import type { EodReport, EodStatus } from "@/types/eod";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";

const STATUS_STYLES: Record<EodStatus, { bg: string; text: string }> = {
  PENDING: { bg: "#FAEEDA", text: "#854F0B" },
  CLOSED: { bg: "#EAF3DE", text: "#3B6D11" },
  REJECTED: { bg: "#FAECE7", text: "#993C1D" },
};

function StatusBadge({ status }: { status: EodStatus }) {
  const c = STATUS_STYLES[status] ?? STATUS_STYLES.PENDING;
  return (
    <span className="text-xs font-medium px-2 py-1 rounded-md" style={{ backgroundColor: c.bg, color: c.text }}>
      {status}
    </span>
  );
}

export default function EodReportViewModal({
  open,
  reportId,
  onClose,
}: {
  open: boolean;
  reportId: string | null;
  onClose: () => void;
}) {
  const [report, setReport] = useState<EodReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !reportId) return;

    const load = () => {
      setLoading(true);
      setError(null);
      getEodReportById(reportId)
        .then(setReport)
        .catch((err) => {
          console.error(err);
          setError("Could not load EOD report.");
        })
        .finally(() => setLoading(false));
    };
    load();
  }, [open, reportId]);

  const initials = report?.partner?.name
    ? report.partner.name.split(" ").filter(Boolean).map((w) => w[0]).join("").slice(0, 2).toUpperCase()
    : "?";

  return (
    <ViewModalShell
      open={open}
      onClose={onClose}
      title="View EOD Report"
      maxWidth="max-w-2xl"
      actions={report && <ViewModalOpenFullPage href={`/eod/${report.id}`} />}
    >
      {loading ? (
        <div className="p-6 space-y-3 animate-pulse">
          <div className="h-16 bg-[#ECE9DF] rounded-xl" />
          <div className="h-32 bg-[#ECE9DF] rounded-xl" />
        </div>
      ) : error || !report ? (
        <div className="p-6 text-center text-sm text-[#993C1D]">{error ?? "EOD report not found."}</div>
      ) : (
        <>
          <ViewModalSummary
            initials={initials}
            avatarBg="#E6F1FB"
            avatarColor="#185FA5"
            name={report.partner?.name ?? "—"}
            badge={<StatusBadge status={report.status} />}
            subtitle={`${report.partner?.partnerCode ?? "—"} · ${formatDate(report.reportDate)}`}
          />

          <div className="p-6 space-y-4">
            <ViewModalSection title="Summary">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                <ViewModalField label="Total collection" value={formatCurrency(report.totalCollection)} />
                <ViewModalField label="Total expenses" value={formatCurrency(report.totalExpenses)} />
                <ViewModalField label="Net remittance" value={formatCurrency(report.netRemittance)} />
              </div>
            </ViewModalSection>

            <ViewModalSection title={`Expenses (${report.expenses.length})`}>
              {report.expenses.length === 0 ? (
                <p className="text-sm text-[#6B6A62] pt-1">No expenses were added for this day.</p>
              ) : (
                <div className="space-y-3 pt-1">
                  {report.expenses.map((e) => (
                    <div key={e.id} className="flex items-center justify-between border-b border-[#ECE9DF] last:border-0 pb-3 last:pb-0">
                      <div>
                        <p className="text-sm text-[#1A1A18] font-medium">{e.category}</p>
                        {e.description && <p className="text-xs text-[#6B6A62]">{e.description}</p>}
                      </div>
                      <p className="text-sm text-[#1A1A18] font-medium">{formatCurrency(e.amount)}</p>
                    </div>
                  ))}
                </div>
              )}
            </ViewModalSection>

            {report.status === "REJECTED" && report.rejectionReason && (
              <ViewModalSection title="Rejection Reason">
                <p className="text-sm text-[#993C1D] pt-1">{report.rejectionReason}</p>
              </ViewModalSection>
            )}
          </div>

          <ViewModalFooterStrip registered={formatDate(report.createdAt)} updated={formatDate(report.updatedAt)} />
        </>
      )}
    </ViewModalShell>
  );
}
