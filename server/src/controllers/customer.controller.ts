import { Request, Response } from "express";
import {
  createCustomer,
  deleteCustomerById,
  getAllCustomers,
  getCustomerById,
  updateCustomerById,
} from "../services/customer.service";

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