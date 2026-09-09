import { Request, Response } from "express";
import { getDashboardStats, getPartnerDashboardStats, type DashboardPeriod } from "../services/dashboard.service";

const VALID_PERIODS: DashboardPeriod[] = ["today", "week", "month", "year"];

export const dashboard = async (
  req: Request,
  res: Response
) => {
  try {
    const rawPeriod = String(req.query.period || "month");
    const period = VALID_PERIODS.includes(rawPeriod as DashboardPeriod)
      ? (rawPeriod as DashboardPeriod)
      : "month";

    const data = await getDashboardStats(period);

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
