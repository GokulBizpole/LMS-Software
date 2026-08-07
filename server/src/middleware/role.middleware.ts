import { Response, NextFunction } from "express";
import { AuthRequest } from "./auth.middleware";

export const adminOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.type !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  next();
};

export const partnerOnly = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.user?.type !== "PARTNER") {
    return res.status(403).json({
      success: false,
      message: "Partner access only",
    });
  }

  next();
};