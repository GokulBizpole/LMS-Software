import { Request, Response } from "express";
import { createExpense, deleteExpenseById, getAllExpenses, getExpenseById, updateExpenseById } from "../services/expense.service";

export const addExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const expense = await createExpense(req.body);

    return res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getExpenses = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const sortBy = String(req.query.sortBy || "expenseDate");
    const order =
      req.query.order === "asc" ? "asc" : "desc";

    const category = req.query.category
      ? String(req.query.category)
      : undefined;
    const partnerId = req.query.partnerId
      ? String(req.query.partnerId)
      : undefined;
    const startDate = req.query.startDate
      ? new Date(String(req.query.startDate))
      : undefined;
    const endDate = req.query.endDate
      ? new Date(String(req.query.endDate))
      : undefined;

    const data = await getAllExpenses(
      page,
      limit,
      search,
      sortBy,
      order,
      { category, partnerId, startDate, endDate }
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

export const getExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const expense = await getExpenseById(id);

    return res.status(200).json({
      success: true,
      data: expense,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const updateExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const expense = await updateExpenseById(
      id,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      data: expense,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteExpense = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const result = await deleteExpenseById(id);

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};