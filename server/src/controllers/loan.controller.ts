import { Response } from "express";
import {
  approveLoanById,
  closeLoanById,
  createLoan,
  getAllLoans,
  getLoanById,
  rejectLoanById,
  updateLoanById,
} from "../services/loan.service";

// CREATE LOAN
export const addLoan = async (req: any, res: Response) => {
  try {
    const loan = await createLoan(
      req.body,
      req.user?.id,
      req.ip
    );

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

// GET ALL LOANS
export const getLoans = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const sortBy = String(req.query.sortBy || "createdAt");
    const order = req.query.order === "asc" ? "asc" : "desc";

    const data = await getAllLoans(
      page,
      limit,
      search,
      sortBy,
      order
    );

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

// GET LOAN BY ID
export const getLoan = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);

    const loan = await getLoanById(id);

    return res.status(200).json({
      success: true,
      data: loan,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// UPDATE LOAN
export const updateLoan = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);

    const loan = await updateLoanById(
      id,
      req.body,
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Loan updated successfully",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const approveLoan = async (
  req: any,
  res: Response
) => {
  try {
    const loan = await approveLoanById(
      req.params.id,
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Loan approved successfully",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const rejectLoan = async (
  req: any,
  res: Response
) => {
  try {
    const loan = await rejectLoanById(
      req.params.id,
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Loan rejected successfully",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// CLOSE LOAN
export const closeLoan = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);

   const loan = await closeLoanById(
  id,
  req.user?.id,
  req.ip
);

    return res.status(200).json({
      success: true,
      message: "Loan closed successfully",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};