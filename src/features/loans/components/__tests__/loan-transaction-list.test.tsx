import { describe, it, expect, vi, beforeAll, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

// The API client reads the base URL when it is first imported.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

vi.mock('next/link', () => ({
  default: ({ children, href, ...props }: { children: React.ReactNode; href: string }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/test-utils';
import { useAuthStore } from '@/stores/auth-store';
import { LoanTransactionList } from '../loan-transaction-list';

const API = 'http://localhost:3000/api/v1';

const row = (id: string, overrides: object = {}) => ({
  id,
  loanId: 'loan-1',
  transactionType: 'INTEREST_PAYMENT',
  amount: 2000,
  transactionDate: '2026-10-11',
  effectiveDate: '2026-10-11',
  approvalStatus: 'APPROVED',
  notes: null,
  createdAt: '2026-10-11T05:00:00Z',
  correctedTransactionId: null,
  isCorrection: false,
  isCorrected: false,
  canFix: false,
  ...overrides,
});

// newest first: the corrected interest payment, the reversal of the mistake, the mistake, and older rows
const rows = [
  row('fixed', { canFix: true }),
  row('undo', {
    transactionType: 'PRINCIPAL_RETURN',
    amount: -2000,
    effectiveDate: null,
    correctedTransactionId: 'wrong',
    isCorrection: true,
  }),
  row('wrong', { transactionType: 'PRINCIPAL_RETURN', effectiveDate: null, isCorrected: true }),
  row('older', { transactionDate: '2026-09-11', effectiveDate: '2026-09-11' }),
  row('disbursement', {
    transactionType: 'DISBURSEMENT',
    amount: 100000,
    transactionDate: '2026-06-11',
    effectiveDate: null,
  }),
];

function signIn(role: 'ADMIN' | 'COLLECTOR') {
  useAuthStore.setState({
    accessToken: 'token',
    user: { id: 'user-1', name: 'Test User', role, tenantId: 'tenant-1' },
  });
}

beforeAll(() => {
  // jsdom has no IntersectionObserver; the list uses one for infinite scrolling
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      disconnect() {}
      unobserve() {}
    },
  );
});

beforeEach(() => {
  server.use(
    http.get(`${API}/loans/loan-1/transactions`, () =>
      HttpResponse.json({
        success: true,
        data: rows,
        pagination: { page: 1, limit: 20, total: rows.length, totalPages: 1 },
      }),
    ),
  );
});

describe('LoanTransactionList', () => {
  it('admin: only the entry the server allows gets the Fix / Remove menu', async () => {
    const user = userEvent.setup();
    signIn('ADMIN');
    renderWithProviders(<LoanTransactionList loanId="loan-1" />);

    const menus = await screen.findAllByRole('button', { name: 'Entry actions' });
    expect(menus).toHaveLength(1);

    await user.click(menus[0]);
    const menu = await screen.findByRole('menu');
    expect(within(menu).getByRole('menuitem', { name: 'Fix' })).toHaveAttribute(
      'href',
      '/more/transactions/new?fix=fixed',
    );
    expect(within(menu).getByRole('menuitem', { name: 'Remove' })).toBeInTheDocument();
  });

  it('collector: no menu at all, even on an entry that could be fixed', async () => {
    signIn('COLLECTOR');
    renderWithProviders(<LoanTransactionList loanId="loan-1" />);

    await screen.findAllByText('Interest');
    expect(screen.queryByRole('button', { name: 'Entry actions' })).not.toBeInTheDocument();
  });

  it('marks the wrong entry as corrected and the row undoing it as a reversal', async () => {
    signIn('ADMIN');
    renderWithProviders(<LoanTransactionList loanId="loan-1" />);

    await screen.findAllByText('Interest');
    expect(screen.getAllByText('Corrected')).toHaveLength(1);
    expect(screen.getAllByText('Reversal')).toHaveLength(1);

    const struckThrough = screen
      .getAllByText('Principal Return')
      .filter((el) => el.className.includes('line-through'));
    expect(struckThrough).toHaveLength(1);
  });
});
