import type { DailyLoanDetail } from '@/types/entities';

type SettlementFields = Pick<
  DailyLoanDetail,
  'status' | 'principalAmount' | 'totalCollected' | 'totalRepaymentAmount'
>;

/**
 * Whether a daily loan can be settled: closed at what has been collected, for
 * less than its scheduled total. Mirrors the API's rule — the loan is active,
 * the principal has been recovered, and the scheduled total has not been
 * reached (a fully repaid loan is closed normally instead).
 */
export function canSettleDailyLoan(loan: SettlementFields): boolean {
  return (
    loan.status === 'ACTIVE' &&
    loan.totalCollected >= loan.principalAmount &&
    loan.totalCollected < loan.totalRepaymentAmount
  );
}
