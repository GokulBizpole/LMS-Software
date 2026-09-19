// utils/exportPdf.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export interface ReportSummaryItem {
  label: string;
  value: string;
}

export interface ExportReportPdfOptions {
  title: string;
  filtersSummary?: string;
  summary?: ReportSummaryItem[];
  columns: string[];
  rows: (string | number)[][];
  filename: string;
}

export function exportReportPdf({
  title,
  filtersSummary,
  summary = [],
  columns,
  rows,
  filename,
}: ExportReportPdfOptions) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? "landscape" : "portrait" });
  const marginX = 14;
  let cursorY = 14;

  // Brand letterhead — two-tone "SKA"/"Trust" wordmark. jsPDF can't embed the
  // brand icon's SVG without rasterizing it first, so this is text-only.
  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 36);
  doc.text("SKA", marginX, cursorY);
  doc.setTextColor(224, 32, 32);
  doc.text("Trust", marginX + doc.getTextWidth("SKA ") , cursorY);

  cursorY += 8;
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(26, 29, 36);
  doc.text(title, marginX, cursorY);

  cursorY += 6;
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(120, 120, 120);
  doc.text(`Generated on ${new Date().toLocaleString("en-IN")}`, marginX, cursorY);

  if (filtersSummary) {
    cursorY += 5;
    doc.text(`Filters: ${filtersSummary}`, marginX, cursorY);
  }

  if (summary.length > 0) {
    cursorY += 8;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    const perRow = 4;
    const colWidth = (doc.internal.pageSize.getWidth() - marginX * 2) / perRow;

    summary.forEach((item, i) => {
      const col = i % perRow;
      const row = Math.floor(i / perRow);
      const x = marginX + col * colWidth;
      const y = cursorY + row * 14;

      doc.setFont("helvetica", "normal");
      doc.setTextColor(120, 120, 120);
      doc.text(item.label, x, y);

      doc.setFont("helvetica", "bold");
      doc.setTextColor(30, 30, 30);
      doc.text(item.value, x, y + 5);
    });

    cursorY += Math.ceil(summary.length / perRow) * 14 + 4;
  }

  autoTable(doc, {
    startY: cursorY,
    head: [columns],
    body: rows,
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [44, 44, 42] },
    margin: { left: marginX, right: marginX },
  });

  doc.save(filename);
}
