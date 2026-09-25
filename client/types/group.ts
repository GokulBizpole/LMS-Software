// types/group.ts
import type { Customer } from "./customer";
import type { LoanStatus } from "./loan";

export type GroupCustomer = Pick<
  Customer,
  "id" | "customerCode" | "name" | "phone" | "city" | "status"
> & { partnerId?: string | null };

export interface GroupPartner {
  id: string;
  name: string;
  partnerCode: string;
}

export interface Group {
  id: string;
  groupCode: string;
  name: string;
  groupHeadId: string;
  groupHead: GroupCustomer;
  partnerId?: string | null;
  partner?: GroupPartner | null;
  createdByType: "ADMIN" | "PARTNER";
  createdById: string;
  createdByName: string;
  _count: { members: number };
  // List endpoint only: totals over members' approved/active loans.
  loanStats?: GroupLoanStats;
  createdAt: string;
  updatedAt: string;
}

export interface GroupLoanStats {
  activeLoans: number;
  totalLoan: number;
  outstanding: number;
  weekCollected: number;
}

export interface GroupMemberLoan {
  id: string;
  loanNumber: string;
  status: LoanStatus;
  principalAmount: string | number;
}

export interface GroupDetail extends Group {
  members: {
    id: string;
    customerId: string;
    // `loans` holds the member's most recent loans (newest first, max 3).
    customer: GroupCustomer & { loans?: GroupMemberLoan[] };
    createdAt: string;
  }[];
}

export interface GroupStats {
  totalGroups: number;
  totalMembers: number;
  addedThisMonth: number;
  activeLoans: number;
  weekCollection: number;
}

export interface GroupListResponse {
  success: boolean;
  groups: Group[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: GroupStats;
}

// Group page overview: loan totals, today's collection and each member's
// status for the current week — all computed by the server.
export type MemberWeekStatus = "PAID" | "DUE" | "MISSED" | "UPCOMING" | "NO_LOAN";

export interface GroupOverview {
  stats: {
    totalMembers: number;
    totalLoanGiven: number;
    outstanding: number;
    collectedTillDate: number;
  };
  today: {
    date: string;
    collectedToday: number;
    membersPaid: number;
    // Members with an installment this week (paid, due or carried).
    membersDueThisWeek: number;
  };
  members: {
    customerId: string;
    loan: { id: string; loanNumber: string; status: LoanStatus; installmentAmount: number } | null;
    weekStatus: MemberWeekStatus;
    weekAmount: number;
    dueNow: number;
    carriedForward: number;
    paidToday: number;
  }[];
}

export interface EligibleCustomer extends GroupCustomer {
  partner?: GroupPartner | null;
}
