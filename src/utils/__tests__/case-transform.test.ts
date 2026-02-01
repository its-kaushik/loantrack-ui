import { describe, it, expect } from 'vitest';
import {
  camelToSnakeKey,
  snakeToCamelKey,
  camelToSnake,
  snakeToCamel,
} from '../case-transform';

describe('camelToSnakeKey', () => {
  it('converts camelCase to snake_case', () => {
    expect(camelToSnakeKey('borrowerId')).toBe('borrower_id');
  });

  it('converts multiple humps', () => {
    expect(camelToSnakeKey('principalAmount')).toBe('principal_amount');
  });

  it('handles single word', () => {
    expect(camelToSnakeKey('name')).toBe('name');
  });

  it('handles multiple consecutive capitals', () => {
    expect(camelToSnakeKey('loanType')).toBe('loan_type');
  });
});

describe('snakeToCamelKey', () => {
  it('converts snake_case to camelCase', () => {
    expect(snakeToCamelKey('borrower_id')).toBe('borrowerId');
  });

  it('converts multiple underscores', () => {
    expect(snakeToCamelKey('principal_amount')).toBe('principalAmount');
  });

  it('handles single word', () => {
    expect(snakeToCamelKey('name')).toBe('name');
  });

  it('handles triple segments', () => {
    expect(snakeToCamelKey('last_interest_paid_through')).toBe('lastInterestPaidThrough');
  });
});

describe('camelToSnake', () => {
  it('transforms a flat object', () => {
    expect(
      camelToSnake({ borrowerId: '123', principalAmount: 100000 }),
    ).toEqual({ borrower_id: '123', principal_amount: 100000 });
  });

  it('transforms nested objects', () => {
    expect(
      camelToSnake({ loanInfo: { borrowerName: 'John', loanType: 'DAILY' } }),
    ).toEqual({ loan_info: { borrower_name: 'John', loan_type: 'DAILY' } });
  });

  it('transforms arrays', () => {
    expect(
      camelToSnake([{ loanId: '1' }, { loanId: '2' }]),
    ).toEqual([{ loan_id: '1' }, { loan_id: '2' }]);
  });

  it('handles null and undefined', () => {
    expect(camelToSnake(null)).toBeNull();
    expect(camelToSnake(undefined)).toBeUndefined();
  });

  it('handles primitives', () => {
    expect(camelToSnake('hello')).toBe('hello');
    expect(camelToSnake(42)).toBe(42);
    expect(camelToSnake(true)).toBe(true);
  });

  it('preserves Date objects', () => {
    const date = new Date('2026-01-15');
    expect(camelToSnake(date)).toBe(date);
  });

  it('handles arrays within objects', () => {
    expect(
      camelToSnake({
        collections: [
          { loanId: '1', transactionDate: '2026-01-15' },
          { loanId: '2', transactionDate: '2026-01-16' },
        ],
      }),
    ).toEqual({
      collections: [
        { loan_id: '1', transaction_date: '2026-01-15' },
        { loan_id: '2', transaction_date: '2026-01-16' },
      ],
    });
  });
});

describe('snakeToCamel', () => {
  it('transforms a flat object', () => {
    expect(
      snakeToCamel({ borrower_id: '123', principal_amount: 100000 }),
    ).toEqual({ borrowerId: '123', principalAmount: 100000 });
  });

  it('transforms nested objects', () => {
    expect(
      snakeToCamel({ loan_info: { borrower_name: 'John' } }),
    ).toEqual({ loanInfo: { borrowerName: 'John' } });
  });

  it('transforms arrays', () => {
    expect(
      snakeToCamel([{ loan_id: '1' }, { loan_id: '2' }]),
    ).toEqual([{ loanId: '1' }, { loanId: '2' }]);
  });

  it('handles null and undefined', () => {
    expect(snakeToCamel(null)).toBeNull();
    expect(snakeToCamel(undefined)).toBeUndefined();
  });
});
