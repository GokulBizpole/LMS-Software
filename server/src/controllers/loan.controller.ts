import { Response } from "express";
import {
  approveLoanById,
  closeLoanById,
  createLoan,
  generateLoanNumber,
  getAllLoans,
  getLoanById,
  rejectLoanById,
  updateLoanById,
} from "../services/loan.service";
import { getCustomerById } from "../services/customer.service";

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

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "ACTIVE",
      "CLOSED",
      "OVERDUE",
      "REJECTED",
    ] as const;
    const rawStatus = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const status = allowedStatuses.find((s) => s === rawStatus);

    const partnerId = req.query.partnerId
      ? String(req.query.partnerId)
      : undefined;
    const customerId = req.query.customerId
      ? String(req.query.customerId)
      : undefined;

    const data = await getAllLoans(
      page,
      limit,
      search,
      sortBy,
      order,
      { status, partnerId, customerId }
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
      String(req.body?.reason || ""),
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

// ============================================================
// ================= PARTNER SELF-SERVICE ======================
// ============================================================

// CREATE MY LOAN — partner submits a loan application for one of their own
// customers; it always starts PENDING and must go to Admin for approval.
export const addMyLoan = async (req: any, res: Response) => {
  try {
    const partnerId = String(req.user?.id);
    const customerId = String(req.body?.customerId);

    const customer = await getCustomerById(customerId);

    if (customer.partnerId !== partnerId) {
      return res.status(403).json({
        success: false,
        message: "You can only submit loans for your own customers",
      });
    }

    const loanNumber = await generateLoanNumber();

    const loan = await createLoan(
      {
        ...req.body,
        loanNumber,
        customerId,
        partnerId,
      },
      undefined,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Loan submitted for admin review",
      data: loan,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// GET MY LOANS
export const getMyLoans = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");
    const sortBy = String(req.query.sortBy || "createdAt");
    const order = req.query.order === "asc" ? "asc" : "desc";

    const allowedStatuses = [
      "PENDING",
      "APPROVED",
      "ACTIVE",
      "CLOSED",
      "OVERDUE",
      "REJECTED",
    ] as const;
    const rawStatus = req.query.status
      ? String(req.query.status).toUpperCase()
      : undefined;
    const status = allowedStatuses.find((s) => s === rawStatus);

    const customerId = req.query.customerId
      ? String(req.query.customerId)
      : undefined;

    const data = await getAllLoans(page, limit, search, sortBy, order, {
      status,
      partnerId: req.user?.id,
      customerId,
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

// GET MY LOAN BY ID
export const getMyLoan = async (req: any, res: Response) => {
  try {
    const id = String(req.params.id);
    const loan = await getLoanById(id);

    if (loan.partnerId !== req.user?.id) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this loan",
      });
    }

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