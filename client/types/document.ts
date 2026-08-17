// types/document.ts

export interface CustomerDocument {
  id: string;
  customerId: string;
  documentType: string;
  fileName: string;
  filePath: string;
  uploadedAt: string;
}
