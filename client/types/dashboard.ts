
export type DashboardPeriod = "today" | "week" | "month" | "year";

export interface Trend {
  percent: number | null;
  direction: "up" | "down" | "flat";
}

export interface WeeklyTrendDay {
  day: string;
  amount: number;
  future: boolean;
}

export interface DashboardTrends {
  totalCollection: Trend;
  outstandingAmount: Trend;
  totalLoanAmount: Trend;
  netProfit: Trend;
  todayCollection: Trend;
  monthlyCollection: Trend;
  todayExpense: Trend;
  monthlyExpense: Trend;
}

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
  netProfit: string | number;

  todayCollection: string | number;
  monthlyCollection: string | number;
  todayExpense: string | number;
  monthlyExpense: string | number;

  weeklyTrend: WeeklyTrendDay[];
  weeklyTotal: string | number;

  period: DashboardPeriod;
  trends: DashboardTrends;
}

export interface DashboardResponse {
  success: boolean;
  data: DashboardData;
}

export const DASHBOARD_PERIOD_OPTIONS: { value: DashboardPeriod; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
  { value: "year", label: "This year" },
];
