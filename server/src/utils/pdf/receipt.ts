import PDFDocument from "pdfkit";
import { Response } from "express";

interface ReceiptData {
  receiptNumber: string;
  customerName: string;
  customerPhone: string;

  loanNumber: string;

  installmentNumber: number;

  amount: number;

  penalty: number;

  totalReceived: number;

  paymentMethod: string;

  paidAt: Date;

  collectedBy: string;
}

const BRAND_RED = "#e02020";
const DARK_INK = "#1a1d24";
const MUTED_INK = "#6b6a62";
const TINT_BG = "#fce4e4";

// Redraws the SKA Trust badge icon (rounded-square badge + coin ring +
// growth arrow) using PDFKit's own vector primitives, matching
// client/components/ui/BrandLogo.tsx's inline SVG shapes 1:1 (same 0-100
// coordinate space, scaled to `size`). PDFKit can't embed that SVG directly
// (no SVG support, and its base fonts have no ₹ glyph to render inside a
// tiny coin), so the icon is redrawn as vector shapes instead of a raster
// image — stays crisp at any size, no new dependency, no rasterization step.
function drawBrandIcon(doc: PDFKit.PDFDocument, x: number, y: number, size: number) {
  const s = size / 100;
  const px = (vx: number) => x + vx * s;
  const py = (vy: number) => y + vy * s;

  doc.roundedRect(px(15), py(15), 70 * s, 70 * s, 21 * s).fill(BRAND_RED);

  doc.circle(px(36), py(58), 13 * s).lineWidth(4 * s).stroke("#ffffff");

  doc
    .moveTo(px(26), py(62))
    .lineTo(px(48), py(40))
    .lineTo(px(62), py(50))
    .lineTo(px(76), py(26))
    .lineWidth(5 * s)
    .lineCap("round")
    .lineJoin("round")
    .stroke("#ffffff");

  doc
    .polygon([px(76), py(26)], [px(64), py(30)], [px(70), py(40)])
    .fill("#ffffff");
}

export const generateReceiptPDF = (
  data: ReceiptData,
  res: Response
) => {
  const doc = new PDFDocument({
    margin: 40,
    size: "A4",
  });

  res.setHeader(
    "Content-Type",
    "application/pdf"
  );

  res.setHeader(
    "Content-Disposition",
    `inline; filename=${data.receiptNumber}.pdf`
  );

  doc.pipe(res);

  const pageWidth = doc.page.width;
  const marginX = 40;
  const contentWidth = pageWidth - marginX * 2;

  // Letterhead — brand icon + two-tone wordmark
  const iconSize = 36;
  const textX = marginX + iconSize + 10;
  drawBrandIcon(doc, marginX, 36, iconSize);

  doc
    .font("Helvetica-Bold")
    .fontSize(20)
    .fillColor(DARK_INK)
    .text("SKA ", textX, 40, { continued: true })
    .fillColor(BRAND_RED)
    .text("Trust");

  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(BRAND_RED)
    .text("LOANS YOU CAN RELY ON", textX, 64, { characterSpacing: 1 });

  doc
    .font("Helvetica-Bold")
    .fontSize(15)
    .fillColor(DARK_INK)
    .text("PAYMENT RECEIPT", marginX, 40, { align: "right", width: contentWidth });

  doc
    .moveTo(marginX, 88)
    .lineTo(pageWidth - marginX, 88)
    .strokeColor(BRAND_RED)
    .lineWidth(2)
    .stroke();

  // Receipt No / Date strip
  let y = 104;
  doc.rect(marginX, y, contentWidth, 34).fill(TINT_BG);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor(MUTED_INK)
    .text("RECEIPT NO", marginX + 12, y + 6)
    .text("DATE", marginX + contentWidth / 2, y + 6);
  doc
    .font("Helvetica-Bold")
    .fontSize(12)
    .fillColor(DARK_INK)
    .text(data.receiptNumber, marginX + 12, y + 17)
    .text(new Date(data.paidAt).toLocaleString(), marginX + contentWidth / 2, y + 17);

  y += 34 + 20;

  const section = (title: string) => {
    doc
      .font("Helvetica-Bold")
      .fontSize(11)
      .fillColor(BRAND_RED)
      .text(title, marginX, y);
    doc
      .moveTo(marginX, y + 15)
      .lineTo(marginX + 60, y + 15)
      .strokeColor(BRAND_RED)
      .lineWidth(1)
      .stroke();
    y += 24;
  };

  const field = (label: string, value: string, x = marginX) => {
    doc.font("Helvetica").fontSize(8).fillColor(MUTED_INK).text(label, x, y);
    doc.font("Helvetica-Bold").fontSize(11).fillColor(DARK_INK).text(value, x, y + 11);
  };

  section("Customer");
  field("NAME", data.customerName);
  field("PHONE", data.customerPhone, marginX + contentWidth / 2);
  y += 34;

  section("Loan");
  field("LOAN NO", data.loanNumber);
  field("INSTALLMENT", String(data.installmentNumber), marginX + contentWidth / 2);
  y += 34;

  section("Payment");
  field("AMOUNT", `Rs ${data.amount}`);
  field("PENALTY", `Rs ${data.penalty}`, marginX + contentWidth / 2);
  y += 34;
  field("PAYMENT METHOD", data.paymentMethod);
  y += 34;

  // Total received — emphasized, tinted
  doc.rect(marginX, y, contentWidth, 40).fill(TINT_BG);
  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED_INK)
    .text("TOTAL RECEIVED", marginX + 12, y + 9);
  doc
    .font("Helvetica-Bold")
    .fontSize(16)
    .fillColor(BRAND_RED)
    .text(`Rs ${data.totalReceived}`, marginX + 12, y + 20);

  y += 40 + 20;

  doc
    .font("Helvetica")
    .fontSize(9)
    .fillColor(MUTED_INK)
    .text(`Collected by ${data.collectedBy}`, marginX, y);

  y += 40;

  doc
    .font("Helvetica-BoldOblique")
    .fontSize(14)
    .fillColor(BRAND_RED)
    .text("Thank You!", marginX, y, { align: "center", width: contentWidth });

  // Footer band — drawn well clear of the bottom margin so PDFKit doesn't
  // treat it as overflow and start an unwanted second page.
  const footerHeight = 28;
  const footerY = doc.page.height - doc.page.margins.bottom - footerHeight;
  doc.rect(0, footerY, pageWidth, footerHeight).fill(BRAND_RED);
  doc
    .font("Helvetica")
    .fontSize(8)
    .fillColor("#ffffff")
    .text("Generated by SKA Trust LMS", 0, footerY + 9, { align: "center", width: pageWidth });

  doc.end();
};
