export type LoanType = 'MONTHLY' | 'DAILY';

export type LoanStatus = 'ACTIVE' | 'CLOSED' | 'DEFAULTED' | 'WRITTEN_OFF' | 'CANCELLED';

export type TransactionType =
  | 'DISBURSEMENT'
  | 'ADVANCE_INTEREST'
  | 'INTEREST_PAYMENT'
  | 'PRINCIPAL_RETURN'
  | 'DAILY_COLLECTION'
  | 'PENALTY'
  | 'GUARANTOR_PAYMENT'
  | 'INTEREST_WAIVER'
  | 'PENALTY_WAIVER'
  | 'OPENING_BALANCE';

export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export type PenaltyStatus = 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'WAIVED';

export type ExpenseCategory = 'TRAVEL' | 'SALARY' | 'OFFICE' | 'LEGAL' | 'MISC';

export type FundEntryType = 'INJECTION' | 'WITHDRAWAL';

export type TenantStatus = 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';

export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'COLLECTOR';
