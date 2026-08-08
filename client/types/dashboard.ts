
export interface DashboardData {
  totalCustomers: number;
  totalPartners: number;

  activeLoans: number;
  pendingLoans: number;
  closedLoans: number;
  activePartners: number;
  inactivePartners: number;
  approvedLoans: number;
  rejectedLoans: number;

  totalLoanAmount: string | number;
  outstandingAmount: string | number;
  totalCollection: string | number;
  totalExpense: string | number;

  todayCollection: string | number;
  monthlyCollection: string | number;
  todayExpense: string | number;
  monthlyExpense: string | number;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}