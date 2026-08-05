import { Request, Response } from "express";
import { createLoan } from "../services/loan.service";

export const addLoan = async (
  req: Request,
  res: Response
) => {
  try {
    const loan = await createLoan(req.body);

    return res.status(201).json({
      success: true,
      message: "Loan created successfully",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};