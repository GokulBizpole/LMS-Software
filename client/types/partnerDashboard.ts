// types/partnerDashboard.ts
import type { Customer } from "./customer";

export interface PartnerRecentLoan {
  id: string;
  loanNumber: string;
  principalAmount: string | number;
  status: string;
  createdAt: string;
  customer: { customerCode: string; name: string; phone: string };
}

export interface PartnerRecentPayment {
  id: string;
  receiptNumber: string;
  totalReceived: string | number;
  paidAt?: string | null;
  createdAt: string;
  loan: {
    loanNumber: string;
    customer: { customerCode: string; name: string; phone: string };
  };
}

export interface PartnerDashboardData {
  totalCustomers: number;
  activeLoans: number;
  pendingLoans: number;
  closedLoans: number;
  totalLoanAmount: string | number;
  outstandingAmount: string | number;
  totalCollection: string | number;
  todayCollection: string | number;
  recentCustomers: Customer[];
  recentLoans: PartnerRecentLoan[];
  recentPayments: PartnerRecentPayment[];
}

export interface PartnerDashboardResponse {
  success: boolean;
  data: PartnerDashboardData;
}
