import path from "path";
import { Response } from "express";
import prisma from "../config/db";
import {
  createCustomerDocument,
  deleteCustomerDocument,
  getCustomerDocuments,
} from "../services/document.service";

const assertOwnCustomer = async (customerId: string, partnerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer || customer.partnerId !== partnerId) {
    throw new Error("Customer not found");
  }

  return customer;
};

export const uploadMyCustomerDocument = async (req: any, res: Response) => {
  try {
    const customerId = String(req.params.id);
    await assertOwnCustomer(customerId, req.user?.id);

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const documentType = String(req.body?.documentType || "OTHER");
    const relativePath = path
      .relative(process.cwd(), req.file.path)
      .split(path.sep)
      .join("/");

    const document = await createCustomerDocument({
      customerId,
      documentType,
      fileName: req.file.originalname,
      filePath: relativePath,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: document,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const getMyCustomerDocuments = async (req: any, res: Response) => {
  try {
    const customerId = String(req.params.id);
    await assertOwnCustomer(customerId, req.user?.id);

    const documents = await getCustomerDocuments(customerId);

    return res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    return res.status(404).json({
      success: false,
      message: (error as Error).message,
    });
  }
};

export const removeMyCustomerDocument = async (req: any, res: Response) => {
  try {
    const documentId = String(req.params.docId);

    const document = await prisma.customerDocument.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new Error("Document not found");
    }

    await assertOwnCustomer(document.customerId, req.user?.id);
    await deleteCustomerDocument(documentId);

    return res.status(200).json({
      success: true,
      message: "Document deleted successfully",
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: (error as Error).message,
    });
  }
};
