import type { Loan } from '@/types/entities';

export interface CollectionTodayItem extends Loan {
  /** Borrower phone for tap-to-call */
  borrowerPhone: string | null;
  /** Whether a DAILY_COLLECTION has already been submitted today for this loan */
  submittedToday: boolean;
  /** Amount submitted today (0 if not yet submitted) */
  submittedAmount: number;
}
