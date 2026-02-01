import { describe, it, expect } from 'vitest';
import { createExpenseSchema } from '../schemas';

const validExpense = {
  category: 'TRAVEL' as const,
  amount: 1500,
  expenseDate: '2026-01-15',
};

describe('createExpenseSchema', () => {
  it('accepts valid input', () => {
    const result = createExpenseSchema.safeParse(validExpense);
    expect(result.success).toBe(true);
  });

  it('accepts all valid categories', () => {
    const categories = ['TRAVEL', 'SALARY', 'OFFICE', 'LEGAL', 'MISC'] as const;
    for (const category of categories) {
      const result = createExpenseSchema.safeParse({ ...validExpense, category });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid category', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, category: 'FOOD' });
    expect(result.success).toBe(false);
  });

  it('rejects zero amount', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, amount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects empty expenseDate', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, expenseDate: '' });
    expect(result.success).toBe(false);
  });

  it('accepts optional description', () => {
    const result = createExpenseSchema.safeParse({ ...validExpense, description: 'Fuel cost' });
    expect(result.success).toBe(true);
  });
});
