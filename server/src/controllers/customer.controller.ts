import { Request, Response } from "express";
import { createCustomer, deleteCustomerById, getAllCustomers, getCustomerById, updateCustomerById } from "../services/customer.service";

export const addCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const customer = await createCustomer(req.body);

    return res.status(201).json({
      success: true,
      message: "Customer created successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
export const getCustomers = async (
  req: Request,
  res: Response
) => {
  try {
    const customers = await getAllCustomers();

    return res.status(200).json({
      success: true,
      data: customers,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const customer = await getCustomerById(id);

    return res.status(200).json({
      success: true,
      data: customer,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
export const updateCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const customer = await updateCustomerById(id, req.body);

    return res.status(200).json({
      success: true,
      message: "Customer updated successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const deleteCustomer = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const customer = await deleteCustomerById(id);

    return res.status(200).json({
      success: true,
      message: "Customer blocked successfully",
      data: customer,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};