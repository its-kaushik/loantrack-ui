import { describe, it, expect } from 'vitest';
import {
  createMonthlyLoanSchema,
  createDailyLoanSchema,
  migrateMonthlyLoanSchema,
  migrateDailyLoanSchema,
  preExistingPenaltySchema,
} from '../schemas';

const validMonthlyLoan = {
  loanType: 'MONTHLY' as const,
  borrowerId: 'cust-1',
  principalAmount: 100000,
  interestRate: 2,
  disbursementDate: '2026-01-01',
};

const validDailyLoan = {
  loanType: 'DAILY' as const,
  borrowerId: 'cust-1',
  principalAmount: 50000,
  interestRate: 1.5,
  disbursementDate: '2026-01-01',
  termDays: 100,
};

describe('createMonthlyLoanSchema', () => {
  it('accepts valid input', () => {
    const result = createMonthlyLoanSchema.safeParse(validMonthlyLoan);
    expect(result.success).toBe(true);
  });

  it('rejects non-MONTHLY loanType', () => {
    const result = createMonthlyLoanSchema.safeParse({ ...validMonthlyLoan, loanType: 'DAILY' });
    expect(result.success).toBe(false);
  });

  it('rejects empty borrowerId', () => {
    const result = createMonthlyLoanSchema.safeParse({ ...validMonthlyLoan, borrowerId: '' });
    expect(result.success).toBe(false);
  });

  it('rejects zero principal', () => {
    const result = createMonthlyLoanSchema.safeParse({ ...validMonthlyLoan, principalAmount: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative interest rate', () => {
    const result = createMonthlyLoanSchema.safeParse({ ...validMonthlyLoan, interestRate: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts optional collateral fields', () => {
    const result = createMonthlyLoanSchema.safeParse({
      ...validMonthlyLoan,
      collateralDescription: 'Gold chain',
      collateralEstimatedValue: 50000,
      guarantorId: 'cust-2',
      expectedMonths: 12,
      notes: 'Test',
    });
    expect(result.success).toBe(true);
  });
});

describe('createDailyLoanSchema', () => {
  it('accepts valid input', () => {
    const result = createDailyLoanSchema.safeParse(validDailyLoan);
    expect(result.success).toBe(true);
  });

  it('rejects non-DAILY loanType', () => {
    const result = createDailyLoanSchema.safeParse({ ...validDailyLoan, loanType: 'MONTHLY' });
    expect(result.success).toBe(false);
  });

  it('rejects zero termDays', () => {
    const result = createDailyLoanSchema.safeParse({ ...validDailyLoan, termDays: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects negative graceDays', () => {
    const result = createDailyLoanSchema.safeParse({ ...validDailyLoan, graceDays: -1 });
    expect(result.success).toBe(false);
  });

  it('accepts zero graceDays', () => {
    const result = createDailyLoanSchema.safeParse({ ...validDailyLoan, graceDays: 0 });
    expect(result.success).toBe(true);
  });
});

describe('preExistingPenaltySchema', () => {
  it('accepts valid input', () => {
    const result = preExistingPenaltySchema.safeParse({
      daysOverdue: 30,
      monthsCharged: 1,
      penaltyAmount: 5000,
      status: 'PENDING',
    });
    expect(result.success).toBe(true);
  });

  it('accepts PAID status', () => {
    const result = preExistingPenaltySchema.safeParse({
      daysOverdue: 60,
      monthsCharged: 2,
      penaltyAmount: 10000,
      status: 'PAID',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid status', () => {
    const result = preExistingPenaltySchema.safeParse({
      daysOverdue: 30,
      monthsCharged: 1,
      penaltyAmount: 5000,
      status: 'WAIVED',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero daysOverdue', () => {
    const result = preExistingPenaltySchema.safeParse({
      daysOverdue: 0,
      monthsCharged: 1,
      penaltyAmount: 5000,
      status: 'PENDING',
    });
    expect(result.success).toBe(false);
  });
});

describe('migrateMonthlyLoanSchema', () => {
  it('accepts valid input', () => {
    const result = migrateMonthlyLoanSchema.safeParse({
      ...validMonthlyLoan,
      remainingPrincipal: 80000,
      lastInterestPaidThrough: '2025-12-01',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing remainingPrincipal', () => {
    const result = migrateMonthlyLoanSchema.safeParse({
      ...validMonthlyLoan,
      lastInterestPaidThrough: '2025-12-01',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing lastInterestPaidThrough', () => {
    const result = migrateMonthlyLoanSchema.safeParse({
      ...validMonthlyLoan,
      remainingPrincipal: 80000,
    });
    expect(result.success).toBe(false);
  });
});

describe('migrateDailyLoanSchema', () => {
  it('accepts valid input', () => {
    const result = migrateDailyLoanSchema.safeParse({
      ...validDailyLoan,
      totalBaseCollectedSoFar: 20000,
    });
    expect(result.success).toBe(true);
  });

  it('accepts zero totalBaseCollectedSoFar', () => {
    const result = migrateDailyLoanSchema.safeParse({
      ...validDailyLoan,
      totalBaseCollectedSoFar: 0,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative totalBaseCollectedSoFar', () => {
    const result = migrateDailyLoanSchema.safeParse({
      ...validDailyLoan,
      totalBaseCollectedSoFar: -1,
    });
    expect(result.success).toBe(false);
  });

  it('accepts preExistingPenalties array', () => {
    const result = migrateDailyLoanSchema.safeParse({
      ...validDailyLoan,
      totalBaseCollectedSoFar: 20000,
      preExistingPenalties: [
        { daysOverdue: 30, monthsCharged: 1, penaltyAmount: 5000, status: 'PENDING' },
      ],
    });
    expect(result.success).toBe(true);
  });
});
