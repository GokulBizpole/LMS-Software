import { Request, Response } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentReceipt,
} from "../services/payment.service";
import { getLoanById } from "../services/loan.service";
import { generateReceiptPDF } from "../utils/pdf/receipt";

// CREATE PAYMENT
export const addPayment = async (req: any, res: Response) => {
  try {
    const payment = await createPayment(
      req.body,
      req.user?.id,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Payment collected successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// GET ALL PAYMENTS
export const getPayments = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const sortBy = String(req.query.sortBy || "paidAt");
    const order =
      req.query.order === "asc" ? "asc" : "desc";

    const rawPeriod = req.query.period
      ? String(req.query.period)
      : undefined;
    const period = (["day", "week", "month"] as const).find(
      (p) => p === rawPeriod
    );

    const data = await getAllPayments(
      page,
      limit,
      search,
      sortBy,
      order,
      period
    );

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// GET PAYMENT BY ID
export const getPayment = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const payment = await getPaymentById(id);

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const downloadReceipt = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const payment = await getPaymentReceipt(id);

    generateReceiptPDF(
      {
        receiptNumber: payment.receiptNumber,
        customerName: payment.loan.customer.name,
        customerPhone: payment.loan.customer.phone,
        loanNumber: payment.loan.loanNumber,
        installmentNumber: payment.installmentNumber,
        amount: Number(payment.amount),
        penalty: Number(payment.penalty),
        totalReceived: Number(payment.totalReceived),
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt ?? new Date(),
        collectedBy: "Super Admin",
      },
      res
    );
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// ================= PARTNER SELF-SERVICE ======================
// ============================================================

// CREATE MY PAYMENT — partner collects a payment against one of their own
// loans; only APPROVED/ACTIVE loans can accept payments (enforced downstream).
export const addMyPayment = async (req: any, res: Response) => {
  try {
    const partnerId = String(req.user?.id);
    const loanId = String(req.body?.loanId);

    const loan = await getLoanById(loanId);

    if (loan.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: "You can only collect payments for your own loans",
      });
    }

    const payment = await createPayment(
      { ...req.body, loanId },
      undefined,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Payment collected successfully",
      data: payment,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// GET MY PAYMENTS
export const getMyPayments = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");
    const sortBy = String(req.query.sortBy || "paidAt");
    const order = req.query.order === "asc" ? "asc" : "desc";

    const rawPeriod = req.query.period ? String(req.query.period) : undefined;
    const period = (["day", "week", "month"] as const).find(
      (p) => p === rawPeriod
    );

    const data = await getAllPayments(page, limit, search, sortBy, order, period, {
      partnerId: req.user?.id,
    });

    return res.status(200).json({
      success: true,
      ...data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// GET MY PAYMENT BY ID
export const getMyPayment = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);
    const payment = await getPaymentById(id);

    if (payment.loan.partnerId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this payment",
      });
    }

    return res.status(200).json({
      success: true,
      data: payment,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// DOWNLOAD MY RECEIPT
export const downloadMyReceipt = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);
    const payment = await getPaymentReceipt(id);

    if (payment.loan.partnerId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this receipt",
      });
    }

    generateReceiptPDF(
      {
        receiptNumber: payment.receiptNumber,
        customerName: payment.loan.customer.name,
        customerPhone: payment.loan.customer.phone,
        loanNumber: payment.loan.loanNumber,
        installmentNumber: payment.installmentNumber,
        amount: Number(payment.amount),
        penalty: Number(payment.penalty),
        totalReceived: Number(payment.totalReceived),
        paymentMethod: payment.paymentMethod,
        paidAt: payment.paidAt ?? new Date(),
        collectedBy: payment.loan.partner.name,
      },
      res
    );
  } catch (error: any) {
    return res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};