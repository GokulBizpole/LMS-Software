import fs from "fs";
import path from "path";
import prisma from "../config/db";

interface CreateDocumentData {
  customerId: string;
  documentType: string;
  fileName: string;
  filePath: string;
}

export const createCustomerDocument = async (data: CreateDocumentData) => {
  const customer = await prisma.customer.findUnique({
    where: { id: data.customerId },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.customerDocument.create({
    data,
  });
};

export const getCustomerDocuments = async (customerId: string) => {
  const customer = await prisma.customer.findUnique({
    where: { id: customerId },
  });

  if (!customer) {
    throw new Error("Customer not found");
  }

  return prisma.customerDocument.findMany({

    
    where: { customerId },
    orderBy: { uploadedAt: "desc" },
  });
};

export const deleteCustomerDocument = async (id: string) => {
  const document = await prisma.customerDocument.findUnique({
    where: { id },
  });

  if (!document) {
    throw new Error("Document not found");
  }

  const absolutePath = path.join(process.cwd(), document.filePath);
  if (fs.existsSync(absolutePath)) {
    fs.unlinkSync(absolutePath);
  }

  await prisma.customerDocument.delete({ where: { id } });

  return document;
};
