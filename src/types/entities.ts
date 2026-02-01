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
