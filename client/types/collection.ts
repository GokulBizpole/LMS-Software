// types/collection.ts
// Week-by-week loan history + what is due now, as computed by the server
// (payment.service getLoanCollection). The UI only displays these values.
import type { LoanStatus } from "./loan";
import type { PaymentMethod } from "./payment";

export interface CollectionWeekPayment {
  id: string;
  receiptNumber: string;
  amount: number;
  penalty: number;
  totalReceived: number;
  paymentMethod: PaymentMethod;
  paidAt: string | null;
}

export interface CollectionWeek {
  week: number;
  scheduleId: string;
  dueDate: string;
  // The week's own installment — never changes.
  originalDue: number;
  penalty: number;
  paid: number;
  pending: number;
  // Unpaid total from earlier weeks carried into this week.
  previousPending: number;
  // previousPending + this week's pending (0 once the week is paid).
  collectionDue: number;
  paymentDate: string | null;
  status: "PAID" | "UNPAID";
  payments: CollectionWeekPayment[];
}

export interface LoanCollection {
  loan: {
    id: string;
    loanNumber: string;
    status: LoanStatus;
    paymentFrequency: "WEEKLY" | "MONTHLY";
    principalAmount: number;
    totalPayable: number;
    balanceAmount: number;
    installmentAmount: number;
    customer: { id: string; name: string; customerCode: string };
  };
  summary: {
    dueNow: number;
    overdue: number;
    totalOutstanding: number;
    totalPaid: number;
    nextDue: { week: number; dueDate: string; amount: number } | null;
    canCollect: boolean;
  };
  weeks: CollectionWeek[];
}
