import { Request, Response } from "express";
import {
  approveEodById,
  getEodReportById,
  getEodReports,
  getMyEodPreview,
  rejectEodById,
  submitMyEod,
} from "../services/eod.service";

export const myEodPreview = async (req: any, res: Response) => {
  try {
    const date = String(req.query.date || "");
    if (!date) {
      throw new Error("date query parameter is required");
    }

    const data = await getMyEodPreview(req.user?.id, date);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const submitEod = async (req: any, res: Response) => {
  try {
    const { reportDate, expenses } = req.body || {};

    const report = await submitMyEod(
      req.user?.id,
      String(reportDate || ""),
      expenses || [],
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "EOD report submitted successfully",
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getEodList = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const partnerId = req.query.partnerId ? String(req.query.partnerId) : undefined;
    const status = req.query.status ? String(req.query.status) : undefined;
    const startDate = req.query.startDate ? new Date(String(req.query.startDate)) : undefined;
    const endDate = req.query.endDate ? new Date(String(req.query.endDate)) : undefined;

    const data = await getEodReports(page, limit, {
      partnerId,
      status,
      startDate,
      endDate,
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

export const getEod = async (req: Request, res: Response) => {
  try {
    const report = await getEodReportById(String(req.params.id));

    return res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const approveEod = async (req: any, res: Response) => {
  try {
    const report = await approveEodById(req.params.id, req.user?.id, req.ip);

    return res.status(200).json({
      success: true,
      message: "EOD report approved successfully",
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const rejectEod = async (req: any, res: Response) => {
  try {
    const report = await rejectEodById(
      req.params.id,
      String(req.body?.reason || ""),
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "EOD report rejected successfully",
      data: report,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
