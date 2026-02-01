import { describe, it, expect } from 'vitest';
import { queryKeys } from '../query-keys';

describe('queryKeys', () => {
  describe('dashboard', () => {
    it('today returns deterministic key', () => {
      expect(queryKeys.dashboard.today()).toEqual(['dashboard', 'today']);
    });

    it('overdue returns deterministic key', () => {
      expect(queryKeys.dashboard.overdue()).toEqual(['dashboard', 'overdue']);
    });

    it('defaulters returns deterministic key', () => {
      expect(queryKeys.dashboard.defaulters()).toEqual(['dashboard', 'defaulters']);
    });

    it('fundSummary returns deterministic key', () => {
      expect(queryKeys.dashboard.fundSummary()).toEqual(['dashboard', 'fund-summary']);
    });
  });

  describe('loans', () => {
    it('all returns base key', () => {
      expect(queryKeys.loans.all()).toEqual(['loans']);
    });

    it('list includes filters', () => {
      const filters = { status: 'ACTIVE', page: 1 };
      expect(queryKeys.loans.list(filters)).toEqual(['loans', 'list', filters]);
    });

    it('detail includes id', () => {
      expect(queryKeys.loans.detail('loan-1')).toEqual(['loans', 'detail', 'loan-1']);
    });

    it('transactions includes loan id', () => {
      expect(queryKeys.loans.transactions('loan-1')).toEqual([
        'loans',
        'loan-1',
        'transactions',
        undefined,
      ]);
    });

    it('transactions includes loan id and filters', () => {
      const f = { page: 1 };
      expect(queryKeys.loans.transactions('loan-1', f)).toEqual([
        'loans',
        'loan-1',
        'transactions',
        f,
      ]);
    });

    it('paymentStatus includes loan id', () => {
      expect(queryKeys.loans.paymentStatus('loan-1')).toEqual([
        'loans',
        'loan-1',
        'payment-status',
      ]);
    });

    it('penalties includes loan id', () => {
      expect(queryKeys.loans.penalties('loan-1')).toEqual(['loans', 'loan-1', 'penalties']);
    });
  });

  describe('transactions', () => {
    it('all returns base key', () => {
      expect(queryKeys.transactions.all()).toEqual(['transactions']);
    });

    it('list includes filters', () => {
      const filters = { type: 'INTEREST_PAYMENT' };
      expect(queryKeys.transactions.list(filters)).toEqual(['transactions', 'list', filters]);
    });

    it('pending without filters', () => {
      expect(queryKeys.transactions.pending()).toEqual(['transactions', 'pending', undefined]);
    });

    it('pending with filters', () => {
      const f = { page: 2 };
      expect(queryKeys.transactions.pending(f)).toEqual(['transactions', 'pending', f]);
    });
  });

  describe('customers', () => {
    it('all returns base key', () => {
      expect(queryKeys.customers.all()).toEqual(['customers']);
    });

    it('list includes filters', () => {
      const filters = { search: 'John' };
      expect(queryKeys.customers.list(filters)).toEqual(['customers', 'list', filters]);
    });

    it('detail includes id', () => {
      expect(queryKeys.customers.detail('cust-1')).toEqual(['customers', 'detail', 'cust-1']);
    });

    it('loans includes customer id', () => {
      expect(queryKeys.customers.loans('cust-1')).toEqual(['customers', 'cust-1', 'loans']);
    });
  });

  describe('expenses', () => {
    it('list includes filters', () => {
      const f = { month: '2026-01' };
      expect(queryKeys.expenses.list(f)).toEqual(['expenses', 'list', f]);
    });
  });

  describe('fund', () => {
    it('entries without filters', () => {
      expect(queryKeys.fund.entries()).toEqual(['fund', 'entries', undefined]);
    });

    it('entries with filters', () => {
      const f = { type: 'INJECTION' };
      expect(queryKeys.fund.entries(f)).toEqual(['fund', 'entries', f]);
    });

    it('summary returns deterministic key', () => {
      expect(queryKeys.fund.summary()).toEqual(['fund', 'summary']);
    });
  });

  describe('reports', () => {
    it('profitLoss includes date range', () => {
      expect(queryKeys.reports.profitLoss('2026-01-01', '2026-01-31')).toEqual([
        'reports',
        'pl',
        '2026-01-01',
        '2026-01-31',
      ]);
    });

    it('collectorSummary includes date range', () => {
      expect(queryKeys.reports.collectorSummary('2026-01-01', '2026-01-31')).toEqual([
        'reports',
        'cs',
        '2026-01-01',
        '2026-01-31',
      ]);
    });

    it('loanBook returns deterministic key', () => {
      expect(queryKeys.reports.loanBook()).toEqual(['reports', 'loan-book']);
    });
  });

  describe('users', () => {
    it('list returns deterministic key', () => {
      expect(queryKeys.users.list()).toEqual(['users', 'list']);
    });
  });

  describe('platform', () => {
    it('stats returns deterministic key', () => {
      expect(queryKeys.platform.stats()).toEqual(['platform', 'stats']);
    });

    it('tenants.list without filters', () => {
      expect(queryKeys.platform.tenants.list()).toEqual(['platform', 'tenants', undefined]);
    });

    it('tenants.list with filters', () => {
      const f = { status: 'ACTIVE' };
      expect(queryKeys.platform.tenants.list(f)).toEqual(['platform', 'tenants', f]);
    });

    it('tenants.detail includes id', () => {
      expect(queryKeys.platform.tenants.detail('t-1')).toEqual(['platform', 'tenants', 't-1']);
    });
  });
});
