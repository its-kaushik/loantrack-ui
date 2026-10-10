import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

// The API client reads the base URL when it is first imported.
const nav = vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
  return { push: vi.fn(), back: vi.fn(), params: new URLSearchParams() };
});

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: nav.push, back: nav.back }),
  useSearchParams: () => nav.params,
}));

import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/test-utils';
import { RecordPaymentForm } from '../record-payment-form';

const API = 'http://localhost:3000/api/v1';

function todayString(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

// Rs 1,00,000 at 2% a month; this month's Rs 2,000 interest is due and unpaid
const monthlyLoan = {
  id: 'loan-1',
  loanNumber: 'ML-2026-0001',
  loanType: 'MONTHLY',
  borrowerId: 'cust-1',
  borrowerName: 'Ravi Kumar',
  principalAmount: 100000,
  interestRate: 2,
  disbursementDate: '2026-06-11',
  status: 'ACTIVE',
  guarantorId: null,
  guarantorName: null,
  isMigrated: false,
  createdAt: '2026-06-11T00:00:00Z',
  remainingPrincipal: 100000,
  billingPrincipal: 100000,
  advanceInterestAmount: 0,
  lastInterestPaidThrough: '2026-09-11',
  expectedMonths: null,
  monthlyDueDay: 11,
  monthlyInterestDue: 2000,
  nextDueDate: '2026-10-11',
  isOverdue: true,
  totalInterestCollected: 6000,
  monthsActive: 4,
  collateralDescription: null,
  collateralEstimatedValue: null,
  notes: null,
  closureDate: null,
  closedById: null,
};

const dailyLoan = {
  ...monthlyLoan,
  id: 'loan-2',
  loanNumber: 'DL-2026-0001',
  loanType: 'DAILY',
  termDays: 120,
  totalRepaymentAmount: 60000,
  dailyPaymentAmount: 500,
  totalCollected: 5000,
};

// The mistake being fixed: the Rs 2,000 interest was recorded as a principal return
const wrongEntry = {
  transactionId: 'txn-1',
  loanId: 'loan-1',
  loanNumber: 'ML-2026-0001',
  borrowerName: 'Ravi Kumar',
  loanType: 'MONTHLY',
  transactionType: 'PRINCIPAL_RETURN',
  amount: 2000,
  transactionDate: '2026-10-11',
  notes: null,
  canFix: true,
  reason: null,
  rows: [
    {
      id: 'txn-1',
      loanId: 'loan-1',
      transactionType: 'PRINCIPAL_RETURN',
      amount: 2000,
      transactionDate: '2026-10-11',
      effectiveDate: null,
      approvalStatus: 'APPROVED',
      notes: null,
      createdAt: '2026-10-11T05:00:00Z',
      correctedTransactionId: null,
      isCorrection: false,
      isCorrected: false,
    },
  ],
};

const ok = (data: unknown) => HttpResponse.json({ success: true, data });

function mockApi(overrides: { loan?: object; entry?: object } = {}) {
  const requests: Array<{ url: string; body: unknown }> = [];
  const record = async ({ request }: { request: Request }) => {
    requests.push({ url: new URL(request.url).pathname, body: await request.json() });
    return ok([]);
  };

  server.use(
    http.get(`${API}/loans/loan-1`, () => ok(overrides.loan ?? monthlyLoan)),
    http.get(`${API}/loans/loan-2`, () => ok(dailyLoan)),
    http.get(`${API}/transactions/txn-1/entry`, () => ok(overrides.entry ?? wrongEntry)),
    http.post(`${API}/transactions`, record),
    http.post(`${API}/transactions/txn-1/fix`, async (info) => {
      await record(info);
      return ok({ removed: [], recorded: [] });
    }),
  );

  return requests;
}

const typeButton = (name: string) => screen.getByRole('button', { name });
const amountInput = () => screen.getByPlaceholderText('Enter amount') as HTMLInputElement;
const principalEffect = (text: string) =>
  screen.queryByText((_content, el) => el?.tagName === 'P' && el.textContent === text);

beforeEach(() => {
  nav.push.mockReset();
  nav.back.mockReset();
  nav.params = new URLSearchParams();
});

describe('RecordPaymentForm — recording', () => {
  it('monthly loan: Interest is selected, the amount is filled in, and Penalty is not offered', async () => {
    mockApi();
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);

    await waitFor(() => expect(typeButton('Interest')).toHaveAttribute('aria-pressed', 'true'));
    expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'false');
    expect(screen.queryByRole('button', { name: 'Penalty' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Guarantor' })).not.toBeInTheDocument();
    await waitFor(() => expect(amountInput().value).toBe('2000'));
  });

  it('daily loan: Collection is selected and Penalty is offered', async () => {
    mockApi();
    nav.params = new URLSearchParams('loanId=loan-2');
    renderWithProviders(<RecordPaymentForm />);

    await waitFor(() => expect(typeButton('Collection')).toHaveAttribute('aria-pressed', 'true'));
    expect(typeButton('Penalty')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Interest' })).not.toBeInTheDocument();
    await waitFor(() => expect(amountInput().value).toBe('500'));
  });

  it('a defaulted loan also offers Guarantor', async () => {
    mockApi({ loan: { ...monthlyLoan, status: 'DEFAULTED' } });
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);

    expect(await screen.findByRole('button', { name: 'Guarantor' })).toBeInTheDocument();
  });

  it('an interest payment is recorded straight away, with no confirmation', async () => {
    const user = userEvent.setup();
    const requests = mockApi();
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(amountInput().value).toBe('2000'));

    await user.click(screen.getByRole('button', { name: 'Record Payment' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(requests[0]).toEqual({
      url: '/api/v1/transactions',
      body: {
        loan_id: 'loan-1',
        transaction_type: 'INTEREST_PAYMENT',
        amount: 2000,
        transaction_date: todayString(),
      },
    });
  });

  it('choosing Principal shows what happens to the principal', async () => {
    const user = userEvent.setup();
    mockApi();
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(amountInput().value).toBe('2000'));
    expect(principalEffect('Principal will go from Rs 1,00,000.00 to Rs 98,000.00')).toBeNull();

    await user.click(typeButton('Principal'));

    expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'true');
    expect(
      principalEffect('Principal will go from Rs 1,00,000.00 to Rs 98,000.00'),
    ).toBeInTheDocument();
  });

  it('a principal return is only sent after confirming, and the unpaid interest is pointed out', async () => {
    const user = userEvent.setup();
    const requests = mockApi();
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(amountInput().value).toBe('2000'));

    await user.click(typeButton('Principal'));
    await user.click(screen.getByRole('button', { name: 'Record Payment' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(within(dialog).getByText('Record as a principal return?')).toBeInTheDocument();
    expect(dialog).toHaveTextContent(
      'Rs 2,000.00 will be taken off the principal: Rs 1,00,000.00 to Rs 98,000.00.',
    );
    expect(dialog).toHaveTextContent(
      'Interest of Rs 2,000.00 due on 11 Oct 2026 has not been recorded yet.',
    );
    expect(dialog).toHaveTextContent(
      'If this was an interest payment, cancel and choose Interest.',
    );
    expect(requests).toHaveLength(0);

    await user.click(within(dialog).getByRole('button', { name: 'Yes, Principal Return' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].body).toEqual({
      loan_id: 'loan-1',
      transaction_type: 'PRINCIPAL_RETURN',
      amount: 2000,
      transaction_date: todayString(),
    });
  });

  it('cancelling the confirmation sends nothing', async () => {
    const user = userEvent.setup();
    const requests = mockApi();
    nav.params = new URLSearchParams('loanId=loan-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(amountInput().value).toBe('2000'));

    await user.click(typeButton('Principal'));
    await user.click(screen.getByRole('button', { name: 'Record Payment' }));
    const dialog = await screen.findByRole('alertdialog');
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }));

    await waitFor(() => expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument());
    expect(requests).toHaveLength(0);
    // still on the form, ready to choose Interest instead
    expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'true');
  });
});

describe('RecordPaymentForm — fixing an entry', () => {
  // the loan as it stands with the wrong principal return applied
  const loanAfterMistake = {
    ...monthlyLoan,
    remainingPrincipal: 98000,
    billingPrincipal: 98000,
    monthlyInterestDue: 1960,
  };

  it('starts from the entry exactly as it was recorded', async () => {
    mockApi({ loan: loanAfterMistake });
    nav.params = new URLSearchParams('fix=txn-1');
    renderWithProviders(<RecordPaymentForm />);

    expect(await screen.findByText('Fixing this entry')).toBeInTheDocument();
    expect(
      screen.getByText('It will be undone and replaced by what you save below.'),
    ).toBeInTheDocument();
    await waitFor(() => expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'true'));
    await waitFor(() => expect(amountInput().value).toBe('2000'));
    expect(screen.getByRole('button', { name: 'Save Correction' })).toBeInTheDocument();
    // the wrong return is undone first, so the preview starts from the principal without it
    await waitFor(() =>
      expect(
        principalEffect('Principal will go from Rs 1,00,000.00 to Rs 98,000.00'),
      ).toBeInTheDocument(),
    );
  });

  it('changing the type to Interest and saving replaces the entry in one request', async () => {
    const user = userEvent.setup();
    const requests = mockApi({ loan: loanAfterMistake });
    nav.params = new URLSearchParams('fix=txn-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'true'));

    await user.click(typeButton('Interest'));
    await user.click(screen.getByRole('button', { name: 'Save Correction' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0]).toEqual({
      url: '/api/v1/transactions/txn-1/fix',
      body: {
        loan_id: 'loan-1',
        transaction_type: 'INTEREST_PAYMENT',
        amount: 2000,
        transaction_date: '2026-10-11',
      },
    });
    await waitFor(() => expect(nav.push).toHaveBeenCalledWith('/loans/loan-1'));
  });

  it('saving without changing anything is refused before any request', async () => {
    const user = userEvent.setup();
    const requests = mockApi({ loan: loanAfterMistake });
    nav.params = new URLSearchParams('fix=txn-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(typeButton('Principal')).toHaveAttribute('aria-pressed', 'true'));

    await user.click(screen.getByRole('button', { name: 'Save Correction' }));

    expect(
      await screen.findByText('Change the loan, type, amount or date before saving.'),
    ).toBeInTheDocument();
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('fixing the amount of a principal return still asks for confirmation', async () => {
    const user = userEvent.setup();
    const requests = mockApi({ loan: loanAfterMistake });
    nav.params = new URLSearchParams('fix=txn-1');
    renderWithProviders(<RecordPaymentForm />);
    await waitFor(() => expect(amountInput().value).toBe('2000'));

    await user.clear(amountInput());
    await user.type(amountInput(), '500');
    await user.click(screen.getByRole('button', { name: 'Save Correction' }));

    const dialog = await screen.findByRole('alertdialog');
    expect(dialog).toHaveTextContent(
      'Rs 500.00 will be taken off the principal: Rs 1,00,000.00 to Rs 99,500.00.',
    );
    await user.click(within(dialog).getByRole('button', { name: 'Yes, Principal Return' }));

    await waitFor(() => expect(requests).toHaveLength(1));
    expect(requests[0].url).toBe('/api/v1/transactions/txn-1/fix');
    expect(requests[0].body).toMatchObject({ transaction_type: 'PRINCIPAL_RETURN', amount: 500 });
  });

  it('shows why an entry cannot be fixed, and no form', async () => {
    mockApi({
      entry: {
        ...wrongEntry,
        canFix: false,
        reason:
          'Only the latest entry on a monthly loan can be changed, and this loan has later entries',
      },
    });
    nav.params = new URLSearchParams('fix=txn-1');
    renderWithProviders(<RecordPaymentForm />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Only the latest entry on a monthly loan can be changed',
    );
    expect(screen.queryByRole('button', { name: 'Save Correction' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go Back' })).toBeInTheDocument();
  });
});
