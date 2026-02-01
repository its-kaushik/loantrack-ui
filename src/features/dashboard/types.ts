export interface CollectionStats {
  count: number;
  totalAmount: string;
}

export interface MissedCollectionItem {
  loanId: string;
  borrowerName: string;
  borrowerPhone: string | null;
  dailyPaymentAmount: string;
}

export interface MonthlyInterestDueItem {
  loanId: string;
  borrowerName: string;
  borrowerPhone: string | null;
  interestAmount: string;
  dueDate: string;
}

export interface TodaySummary {
  activeDailyLoanCount: number;
  expectedCollections: CollectionStats;
  receivedCollections: CollectionStats;
  missedToday: MissedCollectionItem[];
  monthlyInterestDueToday: MonthlyInterestDueItem[];
  pendingApprovalsCount: number;
  totalCollectedToday: string;
}

export interface OverdueDailyLoan {
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  daysOverdue: number;
  amountRemaining: string;
  guarantorName: string | null;
  penaltyApplicable: string;
}

export interface OverdueMonthlyLoan {
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  monthsOverdue: number;
  interestDue: string;
  lastPaymentDate: string | null;
}

export interface OverdueSummary {
  overdueDailyLoans: OverdueDailyLoan[];
  overdueMonthlyLoans: OverdueMonthlyLoan[];
}

export interface DefaulterItem {
  loanId: string;
  loanNumber: string;
  status: string;
  borrowerName: string;
  borrowerPhone: string;
  guarantorName: string | null;
  guarantorPhone: string | null;
  outstandingAmount: string;
  defaultedAt: string | null;
  writtenOffAt: string | null;
}

export interface DefaultersSummary {
  defaulters: DefaulterItem[];
}
