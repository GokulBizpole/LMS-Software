import { Request, Response } from "express";
import {
  getSettingsService,
  updateSettingsService,
} from "../services/settings.service";

// GET /api/settings
export const getSettings = async (req: Request, res: Response) => {
  try {
    const settings = await getSettingsService();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// PUT /api/settings
export const updateSettings = async (req: Request, res: Response) => {
  try {
    const settings = await updateSettingsService(req.body);

    res.status(200).json({
      success: true,
      message: "Settings updated successfully",
      data: settings,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};