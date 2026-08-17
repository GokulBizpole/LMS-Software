import { Request, Response } from "express";
import {
  createCustomer,
  deleteCustomerById,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
} from "../services/customer.service";
import { getAllLoans } from "../services/loan.service";
import { getAllPayments } from "../services/payment.service";

// ================= CREATE CUSTOMER =================
export const addCustomer = async (req: any, res: Response) => {
  try {
    const customer = await createCustomer(
      req.body,
      req.user?.id,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET ALL CUSTOMERS =================
export const getCustomers = async (req: Request, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";

    const result = await getAllCustomers(
      page,
      limit,
      search,
      sortBy,
      order
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET CUSTOMER =================
export const getCustomer = async (req: any, res: Response) => {
  try {
    const customer = await getCustomerById(
      req.params.id as string
    );

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= UPDATE CUSTOMER =================
export const updateCustomer = async (req: any, res: Response) => {
  try {
    const customer = await updateCustomerById(
      req.params.id as string,
      req.body,
      req.user?.id,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= DELETE CUSTOMER =================
export const deleteCustomer = async (req: any, res: Response) => {
  try {
    const customer = await deleteCustomerById(
      req.params.id as string,
      req.user?.id,
      req.ip
    );

    res.status(200).json({
      success: true,
      message: "Customer deleted successfully",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ============================================================
// ================= PARTNER SELF-SERVICE ======================
// ============================================================

const assertOwnCustomer = async (customerId: string, partnerId: string) => {
  const customer = await getCustomerById(customerId);

  if (customer.partnerId !== partnerId) {
    throw new Error("Customer not found");
  }

  return customer;
};

// ================= CREATE MY CUSTOMER =================
export const addMyCustomer = async (req: any, res: Response) => {
  try {
    const customer = await createCustomer(
      { ...req.body, partnerId: req.user?.id },
      undefined,
      req.ip
    );

    res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET MY CUSTOMERS =================
export const getMyCustomers = async (req: any, res: Response) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = (req.query.search as string) || "";
    const sortBy = (req.query.sortBy as string) || "createdAt";
    const order = (req.query.order as "asc" | "desc") || "desc";

    const result = await getAllCustomers(page, limit, search, sortBy, order, {
      partnerId: req.user?.id,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET MY CUSTOMER =================
export const getMyCustomer = async (req: any, res: Response) => {
  try {
    const customer = await assertOwnCustomer(
      req.params.id as string,
      req.user?.id
    );

    res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET MY CUSTOMER'S LOAN HISTORY =================
export const getMyCustomerLoans = async (req: any, res: Response) => {
  try {
    await assertOwnCustomer(req.params.id as string, req.user?.id);

    const result = await getAllLoans(1, 200, "", "createdAt", "desc", {
      partnerId: req.user?.id,
      customerId: req.params.id as string,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= GET MY CUSTOMER'S PAYMENT HISTORY =================
export const getMyCustomerPayments = async (req: any, res: Response) => {
  try {
    await assertOwnCustomer(req.params.id as string, req.user?.id);

    const result = await getAllPayments(1, 200, "", "paidAt", "desc", undefined, {
      partnerId: req.user?.id,
      customerId: req.params.id as string,
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error: any) {
    res.status(404).json({
      success: false,
      message: error.message,
    });
  }
};