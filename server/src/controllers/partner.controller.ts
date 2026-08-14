import { Request, Response } from "express";
import {
  createPartner,
  deletePartnerById,
  getAllPartners,
  getPartnerById,
  updatePartnerById,
} from "../services/partner.service";

// ================= CREATE PARTNER =================

export const addPartner = async (req: any, res: Response) => {
  try {
    const partner = await createPartner(
      req.body,
      req.user?.id,
      req.ip
    );

    return res.status(201).json({
      success: true,
      message: "Partner created successfully",
      data: partner,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// ================= GET ALL PARTNERS =================

export const getPartners = async (
  req: Request,
  res: Response
) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = String(req.query.search || "");

    const sortBy = String(req.query.sortBy || "createdAt");
    const order =
      req.query.order === "asc" ? "asc" : "desc";

    const data = await getAllPartners(
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

// ================= GET PARTNER =================

export const getPartner = async (
  req: Request,
  res: Response
) => {
  try {
    const partner = await getPartnerById(
      String(req.params.id)
    );

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// ================= GET MY PARTNER PROFILE (self-service) =================

export const getMyPartnerProfile = async (req: any, res: Response) => {
  try {
    const partner = await getPartnerById(String(req.user?.id));

    return res.status(200).json({
      success: true,
      data: partner,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// ================= UPDATE PARTNER =================

export const updatePartner = async (
  req: any,
  res: Response
) => {
  try {
    const partner = await updatePartnerById(
      String(req.params.id),
      req.body,
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Partner updated successfully",
      data: partner,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

// ================= DELETE PARTNER =================

export const deletePartner = async (
  req: any,
  res: Response
) => {
  try {
    const partner = await deletePartnerById(
      String(req.params.id),
      req.user?.id,
      req.ip
    );

    return res.status(200).json({
      success: true,
      message: "Partner deactivated successfully",
      data: partner,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};