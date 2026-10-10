import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

// The API client reads the base URL when it is first imported.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/test-utils';
import { SettleLoanSheet } from '../settle-loan-sheet';
import type { DailyLoanDetail } from '@/types/entities';

const SETTLE_URL = 'http://localhost:3000/api/v1/loans/:id/settle';

// Rs 50,000 for 120 days at 5% (Rs 60,000 scheduled), repaid early with one month's interest
const loan: DailyLoanDetail = {
  id: 'loan-123',
  loanNumber: 'DL-2026-0001',
  loanType: 'DAILY',
  borrowerId: 'cust-1',
  borrowerName: 'Ravi Kumar',
  principalAmount: 50000,
  interestRate: 5,
  disbursementDate: '2026-09-01',
  status: 'ACTIVE',
  guarantorId: null,
  guarantorName: null,
  isMigrated: false,
  createdAt: '2026-09-01T00:00:00Z',
  termDays: 120,
  totalRepaymentAmount: 60000,
  dailyPaymentAmount: 500,
  termEndDate: '2026-12-30',
  graceDays: 7,
  totalCollected: 52500,
  isSettled: false,
  originalTotalRepaymentAmount: null,
  settlementNote: null,
  totalRemaining: 7500,
  daysPaid: 105,
  daysRemaining: 15,
  daysElapsed: 31,
  isOverdue: false,
  daysOverdue: 0,
  isBasePaid: false,
  collateralDescription: null,
  collateralEstimatedValue: null,
  notes: null,
  closureDate: null,
  closedById: null,
};

function mockSettleEndpoint() {
  const requests: Array<{ loanId: string; body: unknown }> = [];

  server.use(
    http.patch(SETTLE_URL, async ({ request, params }) => {
      requests.push({ loanId: String(params.id), body: await request.json() });
      return HttpResponse.json({ success: true, data: { ...loan, status: 'CLOSED' } });
    }),
  );

  return requests;
}

function rowValue(label: string) {
  const row = screen.getByText(label).parentElement as HTMLElement;
  return within(row).getByText(/Rs|^\d+$/).textContent;
}

describe('SettleLoanSheet', () => {
  it('shows what was lent, what came back and what will not be charged', () => {
    renderWithProviders(<SettleLoanSheet open onOpenChange={vi.fn()} loan={loan} />);

    expect(rowValue('Principal')).toBe('Rs 50,000.00');
    expect(rowValue('Collected')).toBe('Rs 52,500.00');
    expect(rowValue('Interest received')).toBe('Rs 2,500.00');
    expect(rowValue('Days since disbursement')).toBe('31');
    expect(rowValue('Scheduled total')).toBe('Rs 60,000.00');
    expect(rowValue('Will not be charged')).toBe('Rs 7,500.00');
    expect(screen.getByRole('button', { name: 'Settle at Rs 52,500.00' })).toBeEnabled();
  });

  it('settles at the amount collected, with the note, and closes on success', async () => {
    const user = userEvent.setup();
    const requests = mockSettleEndpoint();
    const onOpenChange = vi.fn();
    renderWithProviders(<SettleLoanSheet open onOpenChange={onOpenChange} loan={loan} />);

    await user.type(screen.getByLabelText('Note (optional)'), '  Repaid in one month  ');
    await user.click(screen.getByRole('button', { name: 'Settle at Rs 52,500.00' }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(requests).toEqual([
      { loanId: 'loan-123', body: { settlement_amount: 52500, note: 'Repaid in one month' } },
    ]);
  });

  it('sends no note when none is entered', async () => {
    const user = userEvent.setup();
    const requests = mockSettleEndpoint();
    const onOpenChange = vi.fn();
    renderWithProviders(<SettleLoanSheet open onOpenChange={onOpenChange} loan={loan} />);

    await user.click(screen.getByRole('button', { name: 'Settle at Rs 52,500.00' }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(requests).toEqual([{ loanId: 'loan-123', body: { settlement_amount: 52500 } }]);
  });

  it('stays open and keeps the note when the API refuses', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    server.use(
      http.patch(SETTLE_URL, () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: 'CONFLICT',
              message:
                'Settlement amount does not match total collected (52800.00), please review and retry',
              details: [],
            },
          },
          { status: 409 },
        ),
      ),
    );
    renderWithProviders(<SettleLoanSheet open onOpenChange={onOpenChange} loan={loan} />);

    await user.type(screen.getByLabelText('Note (optional)'), 'Agreed with borrower');
    await user.click(screen.getByRole('button', { name: 'Settle at Rs 52,500.00' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Settle at Rs 52,500.00' })).toBeEnabled();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Note (optional)')).toHaveValue('Agreed with borrower');
  });
});
