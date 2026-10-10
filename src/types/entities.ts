import type {
  LoanType,
  LoanStatus,
  TransactionType,
  ApprovalStatus,
  PenaltyStatus,
  ExpenseCategory,
  FundEntryType,
  TenantStatus,
  UserRole,
} from './enums';

export interface Customer {
  id: string;
  fullName: string;
  phone: string;
  alternatePhone: string | null;
  address: string | null;
  aadhaarNumber: string | null;
  panNumber: string | null;
  idProofType: string | null;
  occupation: string | null;
  notes: string | null;
  isDefaulter: boolean;
  createdAt: string;
}

export interface GuarantorWarning {
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  status: string;
}

export interface CustomerDetail extends Customer {
  guarantorWarnings: GuarantorWarning[];
}

export interface CustomerLoan {
  id: string;
  loanNumber: string;
  loanType: LoanType;
  principalAmount: number;
  interestRate: number;
  status: LoanStatus;
  disbursementDate: string;
  createdAt: string;
}

export interface Loan {
  id: string;
  loanNumber: string;
  loanType: LoanType;
  borrowerId: string;
  borrowerName: string;
  principalAmount: number;
  interestRate: number;
  disbursementDate: string;
  status: LoanStatus;
  guarantorId: string | null;
  guarantorName: string | null;
  isMigrated: boolean;
  createdAt: string;
}

export interface MonthlyLoanDetail extends Loan {
  remainingPrincipal: number;
  billingPrincipal: number;
  advanceInterestAmount: number;
  lastInterestPaidThrough: string | null;
  expectedMonths: number | null;
  monthlyDueDay: number;
  monthlyInterestDue: number;
  nextDueDate: string | null;
  isOverdue: boolean;
  totalInterestCollected: number;
  monthsActive: number;
  collateralDescription: string | null;
  collateralEstimatedValue: number | null;
  notes: string | null;
  closureDate: string | null;
  closedById: string | null;
}

export interface DailyLoanDetail extends Loan {
  termDays: number;
  totalRepaymentAmount: number;
  dailyPaymentAmount: number;
  termEndDate: string;
  graceDays: number;
  totalCollected: number;
  /** True when the loan was closed for less than its scheduled total. */
  isSettled: boolean;
  /** The scheduled total before settlement; null unless the loan was settled. */
  originalTotalRepaymentAmount: number | null;
  settlementNote: string | null;
  totalRemaining: number;
  daysPaid: number;
  daysRemaining: number;
  daysElapsed: number;
  isOverdue: boolean;
  daysOverdue: number;
  isBasePaid: boolean;
  collateralDescription: string | null;
  collateralEstimatedValue: number | null;
  notes: string | null;
  closureDate: string | null;
  closedById: string | null;
}

export interface Transaction {
  id: string;
  loanId: string;
  transactionType: TransactionType;
  amount: number;
  transactionDate: string;
  effectiveDate: string | null;
  approvalStatus: ApprovalStatus;
  notes: string | null;
  createdAt: string;
  /** Set on a row that undoes another one. */
  correctedTransactionId: string | null;
  isCorrection: boolean;
  /** True once another row has undone this one. */
  isCorrected: boolean;
  /** Only on a loan's transaction list: whether an admin may fix or remove this entry. */
  canFix?: boolean;
}

/** One recorded payment as it was entered. It can be stored as several rows. */
export interface Entry {
  transactionId: string;
  loanId: string;
  loanNumber: string;
  borrowerName: string;
  loanType: LoanType;
  transactionType: TransactionType | null;
  amount: number;
  transactionDate: string | null;
  notes: string | null;
  canFix: boolean;
  /** Why it cannot be changed, when canFix is false. */
  reason: string | null;
  rows: Transaction[];
}

export interface FixEntryResult {
  removed: Transaction[];
  recorded: Transaction[];
}

export interface TransactionDetail extends Transaction {
  loanNumber: string;
  borrowerName: string;
  collectedById: string | null;
  collectorName: string | null;
  approvedById: string | null;
  approvedAt: string | null;
  rejectionReason: string | null;
}

export interface BulkCollectionResult {
  created: number;
  failed: number;
  results: Array<{
    success: boolean;
    transaction?: Transaction;
    error?: string;
  }>;
}

export interface Penalty {
  id: string;
  loanId: string;
  daysOverdue: number;
  monthsCharged: number;
  penaltyAmount: number;
  waivedAmount: number;
  netPayable: number;
  imposedDate: string;
  status: PenaltyStatus;
  amountCollected: number;
  notes: string | null;
  createdById: string;
  createdAt: string;
}

export interface PenaltyCalculation {
  daysOverdue: number;
  totalMonthsOwed: number;
  monthsAlreadyPenalised: number;
  incrementalMonths: number;
  principalAmount: number;
  interestRate: number;
  calculatedAmount: number;
  wasOverridden: boolean;
}

export interface PenaltyCalculationResponse {
  penalty: Penalty;
  calculation: PenaltyCalculation;
}

export interface Waiver {
  id: string;
  loanId: string;
  transactionType: string;
  amount: number;
  transactionDate: string;
  effectiveDate: string | null;
  penaltyId: string | null;
  notes: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  description: string | null;
  expenseDate: string;
  isDeleted: boolean;
  createdById: string;
  createdAt: string;
}

export interface FundEntry {
  id: string;
  entryType: FundEntryType;
  amount: number;
  description: string | null;
  entryDate: string;
  createdById: string;
  createdAt: string;
}

export interface FundSummary {
  totalCapitalInvested: string;
  moneyDeployed: string;
  totalInterestEarned: string;
  moneyLostToDefaults: string;
  totalExpenses: string;
  revenueForgone: string;
  netProfit: string;
  cashInHand: string;
}

export interface User {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string | null;
  address: string | null;
  status: TenantStatus;
  subscriptionPlan: string | null;
  createdAt: string;
  updatedAt: string;
}
