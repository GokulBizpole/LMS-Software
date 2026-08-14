import { Request, Response } from "express";
import { getAuditLogsService } from "../services/audit.service";

// GET /api/audit-logs
export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const action = req.query.action ? String(req.query.action) : undefined;
    const tableName = req.query.tableName
      ? String(req.query.tableName)
      : undefined;
    const adminId = req.query.adminId ? String(req.query.adminId) : undefined;

    const data = await getAuditLogsService(page, limit, {
      action,
      tableName,
      adminId,
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
