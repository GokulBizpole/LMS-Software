import path from "path";
import { Request, Response } from "express";
import {
  getSettingsService,
  removeCompanyLogo,
  setCompanyLogo,
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

// POST /api/settings/logo
export const uploadLogo = async (req: any, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No logo uploaded",
      });
    }

    const relativePath = path
      .relative(process.cwd(), req.file.path)
      .split(path.sep)
      .join("/");

    const settings = await setCompanyLogo(relativePath);

    return res.status(200).json({
      success: true,
      message: "Logo uploaded successfully",
      data: settings,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE /api/settings/logo
export const deleteLogo = async (req: Request, res: Response) => {
  try {
    const settings = await removeCompanyLogo();

    return res.status(200).json({
      success: true,
      message: "Logo removed successfully",
      data: settings,
    });
  } catch (error: any) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
