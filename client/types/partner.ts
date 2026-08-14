// types/partner.ts

export interface PartnerLoanCustomerRef {
  id: string;
  customerCode: string;
  name: string;
  phone: string;
}

export interface PartnerLoanSummary {
  id: string;
  loanNumber: string;
  principalAmount: string | number;
  interestPercentage: string | number;
  duration: number;
  installmentAmount: string | number;
  paidInstallments: number;
  totalInstallments: number;
  balanceAmount: string | number;
  status: "PENDING" | "APPROVED" | "ACTIVE" | "CLOSED" | "OVERDUE" | "REJECTED";
  createdAt: string;
  customer: PartnerLoanCustomerRef;
}

export interface PartnerStats {
  totalLoans: number;
  activeLoans: number;
  closedLoans: number;
  totalLoanAmount: number;
}

export interface Partner {
  id: string;
  partnerCode: string;
  name: string;
  phone: string;
  email: string;
  address?: string | null;
  investmentAmount: string | number;
  currentBalance: string | number;
  status: "ACTIVE" | "INACTIVE";
  loans?: PartnerLoanSummary[];
  stats?: PartnerStats;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerListResponse {
  success: boolean;
  partners: Partner[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}