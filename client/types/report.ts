// types/report.ts

export interface ProfitLossSummary {
  totalLoanAmount: number;
  totalCollection: number;
  totalExpense: number;
  outstandingAmount: number;
  netProfit: number;
}

export interface PartnerFinancials {
  partnerCode: string;
  name: string;
  investmentAmount: number;
  currentBalance: number;
  totalLoans: number;
  loanAmount: number;
  collection: number;
  outstanding: number;
}

export interface PartnerReportRow extends PartnerFinancials {
  id: string;
  phone: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
}

export interface DateRangeFilter {
  startDate: string;
  endDate: string;
}
