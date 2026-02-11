import type { ExpenseCategory, FundEntryType } from './enums';

export interface CreateCustomerRequest {
  fullName: string;
  phone: string;
  alternatePhone?: string;
  address?: string;
  aadhaarNumber?: string;
  panNumber?: string;
  idProofType?: string;
  occupation?: string;
  notes?: string;
}

export interface UpdateCustomerRequest {
  fullName?: string | null;
  phone?: string | null;
  alternatePhone?: string | null;
  address?: string | null;
  aadhaarNumber?: string | null;
  panNumber?: string | null;
  idProofType?: string | null;
  occupation?: string | null;
  notes?: string | null;
}

export interface CreateMonthlyLoanRequest {
  loanType: 'MONTHLY';
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  expectedMonths?: number;
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

export interface CreateDailyLoanRequest {
  loanType: 'DAILY';
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  termDays: number;
  graceDays?: number;
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

export type CreateLoanRequest = CreateMonthlyLoanRequest | CreateDailyLoanRequest;

export interface CreateTransactionRequest {
  loanId: string;
  transactionType:
    | 'INTEREST_PAYMENT'
    | 'PRINCIPAL_RETURN'
    | 'DAILY_COLLECTION'
    | 'PENALTY'
    | 'GUARANTOR_PAYMENT';
  amount: number;
  transactionDate: string;
  penaltyId?: string;
  correctedTransactionId?: string;
  notes?: string;
}

export interface BulkCollectionRequest {
  collections: Array<{
    loanId: string;
    amount: number;
    transactionDate: string;
    notes?: string;
  }>;
}

export interface CreateExpenseRequest {
  category: ExpenseCategory;
  amount: number;
  description?: string;
  expenseDate: string;
}

export interface CreateFundEntryRequest {
  entryType: FundEntryType;
  amount: number;
  description?: string;
  entryDate: string;
}

export interface PreExistingPenalty {
  daysOverdue: number;
  monthsCharged: number;
  penaltyAmount: number;
  status: 'PENDING' | 'PAID';
}

export interface MigrateMonthlyLoanRequest {
  loanType: 'MONTHLY';
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  expectedMonths?: number;
  remainingPrincipal: number;
  lastInterestPaidThrough: string;
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

export interface MigrateDailyLoanRequest {
  loanType: 'DAILY';
  borrowerId: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  termDays: number;
  graceDays?: number;
  totalBaseCollectedSoFar: number;
  preExistingPenalties?: PreExistingPenalty[];
  guarantorId?: string;
  collateralDescription?: string;
  collateralEstimatedValue?: number;
  notes?: string;
}

export type MigrateLoanRequest = MigrateMonthlyLoanRequest | MigrateDailyLoanRequest;

export interface CreateUserRequest {
  name: string;
  phone: string;
  email?: string;
  password: string;
  role: 'COLLECTOR';
}

export interface CreateTenantRequest {
  name: string;
  slug: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail?: string;
  address?: string;
  adminName: string;
  adminPhone: string;
  adminPassword: string;
}
