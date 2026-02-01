import type { LoanType, LoanStatus } from '@/types/enums';

export interface ListLoansParams {
  type?: LoanType;
  status?: LoanStatus;
  borrowerId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface MonthlyPaymentCycle {
  cycleYear: number;
  cycleMonth: number;
  dueDate: string;
  interestDue: number;
  interestPaid: number;
  interestWaived: number;
  isSettled: boolean;
  billingPrincipalForCycle: number;
}

export interface MonthlyPaymentStatus {
  loanId: string;
  loanNumber: string;
  cycles: MonthlyPaymentCycle[];
}

export interface DailyPaymentDay {
  dayNumber: number;
  date: string;
  dailyPaymentAmount: number;
  amountCollected: number;
  cumulativeCollected: number;
  isCovered: boolean;
}

export interface DailyPaymentStatus {
  loanId: string;
  loanNumber: string;
  totalRepaymentAmount: number;
  dailyPaymentAmount: number;
  totalCollected: number;
  days: DailyPaymentDay[];
}
