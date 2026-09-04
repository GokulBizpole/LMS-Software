// services/partnerDocument.service.ts
import api from "@/lib/axios";
import type { CustomerDocument } from "@/types/document";

interface DocumentListResponse {
  success: boolean;
  data: CustomerDocument[];
}

export async function getMyCustomerDocuments(
  customerId: string
): Promise<CustomerDocument[]> {
  const { data } = await api.get<DocumentListResponse>(
    `/partners/me/customers/${customerId}/documents`
  );

  if (!data.success) {
    throw new Error("Failed to load documents");
  }

  return data.data;
}

interface DocumentUploadResponse {
  success: boolean;
  message: string;
  data: CustomerDocument;
}

export async function uploadMyCustomerDocument(
  customerId: string,
  file: File,
  documentType: string
): Promise<CustomerDocument> {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("documentType", documentType);

  const { data } = await api.post<DocumentUploadResponse>(
    `/partners/me/customers/${customerId}/documents`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } }
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to upload document");
  }

  return data.data;
}

export async function deleteMyCustomerDocument(docId: string): Promise<void> {
  const { data } = await api.delete<{ success: boolean; message: string }>(
    `/partners/me/documents/${docId}`
  );

  if (!data.success) {
    throw new Error(data.message || "Failed to delete document");
  }
}

export function documentFileUrl(filePath: string): string {
  const base = (process.env.NEXT_PUBLIC_API_BASE_URL || "").replace(/\/api\/?$/, "");
  return `${base}/${filePath}`;
}
