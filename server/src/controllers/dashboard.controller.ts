import { Request, Response } from "express";
import { getDashboardStats, getPartnerDashboardStats } from "../services/dashboard.service";

export const dashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const data = await getDashboardStats();

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

export const myDashboard = async (req: any, res: Response) => {
  try {
    const data = await getPartnerDashboardStats(req.user?.id);

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