import { Request, Response } from "express";
import {
  createPayment,
  getAllPayments,
  getPaymentById,
  getPaymentReceipt,
} from "../services/payment.service";
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

    const data = await getAllPayments(
      page,
      limit,
      search,
      sortBy,
      order
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