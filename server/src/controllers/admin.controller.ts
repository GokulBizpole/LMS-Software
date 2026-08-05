import { Request, Response } from "express";
import {
  registerAdmin,
  loginAdmin,
} from "../services/admin.service";

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    const admin = await registerAdmin(
      name,
      email,
      password
    );

    return res.status(201).json({
      success: true,
      message: "Admin registered successfully",
      data: admin,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const result = await loginAdmin(email, password);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: result,
    });
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: (error as Error).message,
    });
  }
};