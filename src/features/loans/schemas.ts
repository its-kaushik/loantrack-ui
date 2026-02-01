import { z } from 'zod/v4';

const optionalPositiveInt = z.preprocess(
  (val) => (val === '' || Number.isNaN(val) ? undefined : val),
  z.number().int().positive().optional(),
);

const optionalPositiveNumber = z.preprocess(
  (val) => (val === '' || Number.isNaN(val) ? undefined : val),
  z.number().positive().optional(),
);

export const createMonthlyLoanSchema = z.object({
  loanType: z.literal('MONTHLY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  expectedMonths: optionalPositiveInt,
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: optionalPositiveNumber,
  notes: z.string().max(2000).optional(),
});

export const createDailyLoanSchema = z.object({
  loanType: z.literal('DAILY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  termDays: z.number().int().positive('Term days is required'),
  graceDays: z.preprocess(
    (val) => (val === '' || Number.isNaN(val) ? undefined : val),
    z.number().int().min(0).optional(),
  ),
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: optionalPositiveNumber,
  notes: z.string().max(2000).optional(),
});

export type CreateMonthlyLoanFormValues = z.infer<typeof createMonthlyLoanSchema>;
export type CreateDailyLoanFormValues = z.infer<typeof createDailyLoanSchema>;

export const preExistingPenaltySchema = z.object({
  daysOverdue: z.number().int().positive('Days overdue is required'),
  monthsCharged: z.number().int().positive('Months charged is required'),
  penaltyAmount: z.number().positive('Penalty amount is required'),
  status: z.enum(['PENDING', 'PAID']),
});

export const migrateMonthlyLoanSchema = z.object({
  loanType: z.literal('MONTHLY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  expectedMonths: optionalPositiveInt,
  remainingPrincipal: z.number().positive('Remaining principal is required'),
  lastInterestPaidThrough: z.string().min(1, 'Last interest paid through date is required'),
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: optionalPositiveNumber,
  notes: z.string().max(2000).optional(),
});

export const migrateDailyLoanSchema = z.object({
  loanType: z.literal('DAILY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  termDays: z.number().int().positive('Term days is required'),
  graceDays: z.preprocess(
    (val) => (val === '' || Number.isNaN(val) ? undefined : val),
    z.number().int().min(0).optional(),
  ),
  totalBaseCollectedSoFar: z.number().min(0, 'Total collected is required'),
  preExistingPenalties: z.array(preExistingPenaltySchema).optional(),
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: optionalPositiveNumber,
  notes: z.string().max(2000).optional(),
});

export type MigrateMonthlyLoanFormValues = z.infer<typeof migrateMonthlyLoanSchema>;
export type MigrateDailyLoanFormValues = z.infer<typeof migrateDailyLoanSchema>;
