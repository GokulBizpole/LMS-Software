import { Request, Response } from "express";
import {
  adminLoginService,
  changePasswordService,
  loginService,
  partnerLoginService,
} from "../services/auth.service";

// Unified login for the single login page — works for both Admin and Partner
export const login = async (req: Request, res: Response) => {
  try {
    const data = await loginService(req.body);

    res.status(200).json({
      success: true,
      message: "Login successful",
      data,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const adminLogin = async (req: Request, res: Response) => {
  try {
    const data = await adminLoginService(req.body);

    res.status(200).json({
      success: true,
      message: "Admin login successful",
      data,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const partnerLogin = async (req: Request, res: Response) => {
  try {
    const data = await partnerLoginService(req.body);

    res.status(200).json({
      success: true,
      message: "Partner login successful",
      data,
    });
  } catch (error: any) {
    res.status(401).json({
      success: false,
      message: error.message,
    });
  }
};

export const changePassword = async (req: any, res: Response) => {
  try {
    const result = await changePasswordService({
      adminId: req.user.id,
      currentPassword: req.body.currentPassword,
      newPassword: req.body.newPassword,
    });

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};