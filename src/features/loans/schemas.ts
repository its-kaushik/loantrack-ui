import { z } from 'zod/v4';

export const createMonthlyLoanSchema = z.object({
  loanType: z.literal('MONTHLY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  expectedMonths: z.number().int().positive().optional(),
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export const createDailyLoanSchema = z.object({
  loanType: z.literal('DAILY'),
  borrowerId: z.string().min(1, 'Borrower is required'),
  principalAmount: z.number().positive('Principal must be greater than 0'),
  interestRate: z.number().positive('Interest rate must be greater than 0'),
  disbursementDate: z.string().min(1, 'Disbursement date is required'),
  termDays: z.number().int().positive('Term days is required'),
  graceDays: z.number().int().min(0).optional(),
  guarantorId: z.string().optional(),
  collateralDescription: z.string().max(2000).optional(),
  collateralEstimatedValue: z.number().positive().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateMonthlyLoanFormValues = z.infer<typeof createMonthlyLoanSchema>;
export type CreateDailyLoanFormValues = z.infer<typeof createDailyLoanSchema>;
