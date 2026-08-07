import { Request, Response } from "express";
import { getCollectionReport, getCustomerLedger, getExpenseReport, getLoanReport, getPartnerReport, getProfitLossReport } from "../services/report.service";

export const loanReport = async (
  req: Request,
  res: Response
) => {
  try {
    const { status, from, to } = req.query;

    const data = await getLoanReport({
      status: status as
        | "PENDING"
        | "ACTIVE"
        | "CLOSED"
        | undefined,

      from: from
        ? new Date(String(from))
        : undefined,

      to: to
        ? new Date(String(to))
        : undefined,
    });

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const collectionReport = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getCollectionReport();

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const expenseReport = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getExpenseReport();

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const profitLossReport = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getProfitLossReport();

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const customerLedger = async (
  req: Request,
  res: Response
) => {
  try {
    const customerId = String(req.params.customerId);

    const data = await getCustomerLedger(customerId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const partnerReport = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getPartnerReport();

    return res.status(200).json({
      success: true,
      total: data.length,
      data,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};