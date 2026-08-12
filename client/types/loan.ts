// types/loan.ts

export interface LoanCustomerRef {
  id?: string;
  customerCode: string;
  name: string;
  phone: string;
}

export interface LoanPartnerRef {
  id?: string;
  partnerCode: string;
  name: string;
  phone?: string;
}

export type LoanStatus =
  | "PENDING"
  | "APPROVED"
  | "ACTIVE"
  | "CLOSED"
  | "OVERDUE"
  | "REJECTED";

export interface Loan {
  id: string;
  loanNumber: string;
  customerId: string;
  partnerId: string;
  customer?: LoanCustomerRef;
  partner?: LoanPartnerRef;
  principalAmount: string | number;
  interestPercentage: string | number;
  interestAmount: string | number;
  totalPayable: string | number;
  balanceAmount: string | number;
  paymentFrequency: "WEEKLY" | "MONTHLY";
  duration: number;
  installmentAmount: string | number;
  paidInstallments: number;
  totalInstallments: number;
  penaltyPercentage?: string | number | null;
  penaltyAmount?: string | number | null;
  status: LoanStatus;
  approvedBy?: string | null;
  approvedAt?: string | null;
  startDate?: string | null;
  endDate?: string | null;
  remarks?: string | null;
  rejectionReason?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface LoanListResponse {
  success: boolean;
  loans: Loan[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
