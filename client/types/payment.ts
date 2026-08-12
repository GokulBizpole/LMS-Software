// types/payment.ts

export interface PaymentLoanRef {
  loanNumber: string;
  customer: {
    customerCode: string;
    name: string;
    phone: string;
  };
  partner?: {
    partnerCode: string;
    name: string;
  };
}

export type PaymentMethod = "CASH" | "UPI" | "BANK_TRANSFER";
export type PaymentStatus = "PAID" | "PENDING" | "LATE";

export interface Payment {
  id: string;
  receiptNumber: string;
  loanId: string;
  scheduleId?: string | null;
  loan: PaymentLoanRef;
  installmentNumber: number;
  amount: string | number;
  penalty: string | number;
  totalReceived: string | number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paidAt?: string | null;
  remarks?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentListResponse {
  success: boolean;
  payments: Payment[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
