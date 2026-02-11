import { describe, it, expect } from 'vitest';
import { createTransactionSchema } from '../schemas';

const validTransaction = {
  loanId: 'loan-1',
  transactionType: 'INTEREST_PAYMENT' as const,
  amount: 5000,
  transactionDate: '2026-01-15',
};

describe('createTransactionSchema', () => {
  it('accepts valid input', () => {
    const result = createTransactionSchema.safeParse(validTransaction);
    expect(result.success).toBe(true);
  });

  it('accepts all valid transaction types', () => {
    const types = ['INTEREST_PAYMENT', 'PRINCIPAL_RETURN', 'DAILY_COLLECTION', 'PENALTY', 'GUARANTOR_PAYMENT'] as const;
    for (const type of types) {
      const result = createTransactionSchema.safeParse({ ...validTransaction, transactionType: type });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid transaction type', () => {
    const result = createTransactionSchema.safeParse({ ...validTransaction, transactionType: 'INVALID' });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = createTransactionSchema.safeParse({ ...validTransaction, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative amount', () => {
    const result = createTransactionSchema.safeParse({ ...validTransaction, amount: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects empty loanId', () => {
    const result = createTransactionSchema.safeParse({ ...validTransaction, loanId: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional fields', () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      penaltyId: 'pen-1',
      correctedTransactionId: 'txn-1',
      notes: 'Test note',
    });
    expect(result.success).toBe(true);
  });

  it('rejects notes exceeding 2000 characters', () => {
    const result = createTransactionSchema.safeParse({
      ...validTransaction,
      notes: 'a'.repeat(2001),
    });
    expect(result.success).toBe(false);
  });
});
