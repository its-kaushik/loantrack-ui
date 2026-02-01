import { z } from 'zod/v4';

export const createTransactionSchema = z.object({
  loanId: z.string().min(1, 'Loan is required'),
  transactionType: z.enum([
    'INTEREST_PAYMENT',
    'PRINCIPAL_RETURN',
    'DAILY_COLLECTION',
    'PENALTY',
    'GUARANTOR_PAYMENT',
  ]),
  amount: z.number().positive('Amount must be greater than 0'),
  transactionDate: z.string().min(1, 'Transaction date is required'),
  effectiveDate: z.string().optional(),
  penaltyId: z.string().optional(),
  correctedTransactionId: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export type CreateTransactionFormValues = z.infer<typeof createTransactionSchema>;
