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

  doc
    .fontSize(22)
    .text("LMS SOFTWARE", {
      align: "center",
    });

  doc.moveDown();

  doc
    .fontSize(18)
    .text("PAYMENT RECEIPT", {
      align: "center",
    });

  doc.moveDown();

  doc.fontSize(12);

  doc.text(`Receipt No : ${data.receiptNumber}`);
  doc.text(
    `Date : ${new Date(data.paidAt).toLocaleString()}`
  );

  doc.moveDown();

  doc.text("--------------------------------");

  doc.moveDown();

  doc.fontSize(14).text("Customer");

  doc.fontSize(12);

  doc.text(`Name : ${data.customerName}`);

  doc.text(`Phone : ${data.customerPhone}`);

  doc.moveDown();

  doc.fontSize(14).text("Loan");

  doc.fontSize(12);

  doc.text(`Loan No : ${data.loanNumber}`);

  doc.text(
    `Installment : ${data.installmentNumber}`
  );

  doc.moveDown();

  doc.fontSize(14).text("Payment");

  doc.fontSize(12);

  doc.text(`Amount : ₹${data.amount}`);

  doc.text(`Penalty : ₹${data.penalty}`);

  doc.text(
    `Received : ₹${data.totalReceived}`
  );

  doc.text(
    `Payment Method : ${data.paymentMethod}`
  );

  doc.moveDown();

  doc.text(
    `Collected By : ${data.collectedBy}`
  );

  doc.moveDown(2);

  doc
    .fontSize(16)
    .text("Thank You", {
      align: "center",
    });

  doc.end();
};