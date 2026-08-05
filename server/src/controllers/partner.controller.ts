import { Request, Response } from "express";
import { createPartner, deletePartnerById, getAllPartners, getPartnerById, updatePartnerById } from "../services/partner.service";

export const addPartner = async (req: Request, res: Response) => {
  try {
    const partner = await createPartner(req.body);

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

export const getPartners = async (
  req: Request,
  res: Response
) => {
  try {
    const partners = await getAllPartners();

    return res.status(200).json({
      success: true,
      data: partners,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
export const getPartner = async (
  req: Request,
  res: Response
) => {
  try {
   const id = String(req.params.id);

const partner = await getPartnerById(id);
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

export const updatePartner = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const partner = await updatePartnerById(id, req.body);

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

export const deletePartner = async (
  req: Request,
  res: Response
) => {
  try {
    const id = String(req.params.id);

    const partner = await deletePartnerById(id);

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