import type { LoanType, LoanStatus } from '@/types/enums';

export interface ProfitLossReport {
  totalCapitalInvested: string;
  moneyDeployed: string;
  dailyDisbursed: string;
  monthlyDisbursed: string;
  totalInterestEarned: string;
  totalReceived: string;
  moneyLostToDefaults: string;
  totalExpenses: string;
  revenueForgone: string;
  netProfit: string;
  cashInHand: string;
}

export interface CollectorSummaryItem {
  userId: string;
  name: string;
  totalTransactions: number;
  totalAmount: string;
  loansServiced: number;
  approved: number;
  pending: number;
  rejected: number;
}

export interface LoanBookItem {
  loanId: string;
  loanNumber: string;
  loanType: LoanType;
  status: LoanStatus;
  borrowerName: string;
  principalAmount: string;
  disbursementDate: string;
  outstandingAmount: string;
  interestEarned: string;
  guarantorName: string | null;
}
