import { describe, it, expect, vi } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { http, HttpResponse } from 'msw';

// The API client reads the base URL when it is first imported.
vi.hoisted(() => {
  process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3000';
});

import { server } from '@/test/mocks/server';
import { renderWithProviders } from '@/test/test-utils';
import { RemoveEntrySheet } from '../remove-entry-sheet';

const API = 'http://localhost:3000/api/v1';

const row = (id: string, transactionType: string, amount: number) => ({
  id,
  loanId: 'loan-1',
  transactionType,
  amount,
  transactionDate: '2026-10-11',
  effectiveDate: null,
  approvalStatus: 'APPROVED',
  notes: null,
  createdAt: '2026-10-11T05:00:00Z',
  correctedTransactionId: null,
  isCorrection: false,
  isCorrected: false,
});

const entry = {
  transactionId: 'txn-1',
  loanId: 'loan-1',
  loanNumber: 'DL-2026-0001',
  borrowerName: 'Ravi Kumar',
  loanType: 'DAILY',
  transactionType: 'DAILY_COLLECTION',
  amount: 500,
  transactionDate: '2026-10-11',
  notes: null,
  canFix: true,
  reason: null,
  rows: [row('txn-1', 'DAILY_COLLECTION', 500)],
};

const ok = (data: unknown) => HttpResponse.json({ success: true, data });

function mockApi(entryOverride: object = entry) {
  const requests: unknown[] = [];
  server.use(
    http.get(`${API}/transactions/txn-1/entry`, () => ok(entryOverride)),
    http.post(`${API}/transactions/txn-1/remove`, async ({ request }) => {
      requests.push(await request.json());
      return ok({ removed: [], recorded: [] });
    }),
  );
  return requests;
}

describe('RemoveEntrySheet', () => {
  it('shows the payment that will be removed', async () => {
    mockApi();
    renderWithProviders(<RemoveEntrySheet open onOpenChange={vi.fn()} transactionId="txn-1" />);

    expect(await screen.findByText('DL-2026-0001 — Ravi Kumar')).toBeInTheDocument();
    expect(screen.getByText('Collection')).toBeInTheDocument();
    expect(screen.getByText('Rs 500.00')).toBeInTheDocument();
    expect(screen.getByText('11 Oct 2026')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove Entry' })).toBeEnabled();
  });

  it('removes with the reason given and closes', async () => {
    const user = userEvent.setup();
    const requests = mockApi();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <RemoveEntrySheet open onOpenChange={onOpenChange} transactionId="txn-1" />,
    );

    await user.type(await screen.findByLabelText('Reason (optional)'), '  Recorded twice  ');
    await user.click(screen.getByRole('button', { name: 'Remove Entry' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(requests).toEqual([{ reason: 'Recorded twice' }]);
  });

  it('sends no reason when none is entered', async () => {
    const user = userEvent.setup();
    const requests = mockApi();
    const onOpenChange = vi.fn();
    renderWithProviders(
      <RemoveEntrySheet open onOpenChange={onOpenChange} transactionId="txn-1" />,
    );

    await screen.findByLabelText('Reason (optional)');
    await user.click(screen.getByRole('button', { name: 'Remove Entry' }));

    await waitFor(() => expect(onOpenChange).toHaveBeenCalledWith(false));
    expect(requests).toEqual([{}]);
  });

  it('says so when the payment was stored as several rows', async () => {
    mockApi({
      ...entry,
      loanType: 'MONTHLY',
      transactionType: 'INTEREST_PAYMENT',
      amount: 2500,
      rows: [row('txn-1', 'INTEREST_PAYMENT', 2000), row('txn-2', 'PRINCIPAL_RETURN', 500)],
    });
    renderWithProviders(<RemoveEntrySheet open onOpenChange={vi.fn()} transactionId="txn-1" />);

    expect(
      await screen.findByText('This payment was recorded as 2 rows. All of them will be undone.'),
    ).toBeInTheDocument();
    expect(screen.getByText('Rs 2,500.00')).toBeInTheDocument();
  });

  it('explains and blocks when the entry cannot be changed', async () => {
    const requests = mockApi({
      ...entry,
      canFix: false,
      reason: 'Entries on a closed loan cannot be changed',
    });
    renderWithProviders(<RemoveEntrySheet open onOpenChange={vi.fn()} transactionId="txn-1" />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Entries on a closed loan cannot be changed',
    );
    expect(screen.getByRole('button', { name: 'Remove Entry' })).toBeDisabled();
    expect(screen.queryByLabelText('Reason (optional)')).not.toBeInTheDocument();
    expect(requests).toHaveLength(0);
  });

  it('stays open when the server refuses', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    server.use(
      http.get(`${API}/transactions/txn-1/entry`, () => ok(entry)),
      http.post(`${API}/transactions/txn-1/remove`, () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'This entry has already been corrected',
              details: [],
            },
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(
      <RemoveEntrySheet open onOpenChange={onOpenChange} transactionId="txn-1" />,
    );

    await screen.findByLabelText('Reason (optional)');
    await user.click(screen.getByRole('button', { name: 'Remove Entry' }));

    await waitFor(() => expect(screen.getByRole('button', { name: 'Remove Entry' })).toBeEnabled());
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
