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
import { CancelLoanSheet } from '../cancel-loan-sheet';

const CANCEL_URL = 'http://localhost:3000/api/v1/loans/:id/cancel';

function mockCancelEndpoint() {
  const requests: Array<{ loanId: string; body: unknown }> = [];

  server.use(
    http.patch(CANCEL_URL, async ({ request, params }) => {
      requests.push({ loanId: String(params.id), body: await request.json() });
      return HttpResponse.json({ success: true, data: { id: params.id, status: 'CANCELLED' } });
    }),
  );

  return requests;
}

describe('CancelLoanSheet', () => {
  it('keeps the cancel button disabled until a reason is entered', async () => {
    const user = userEvent.setup();
    renderWithProviders(<CancelLoanSheet open onOpenChange={vi.fn()} loanId="loan-123" />);

    const button = screen.getByRole('button', { name: 'Cancel Loan' });
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Cancellation Reason'), '   ');
    expect(button).toBeDisabled();

    await user.type(screen.getByLabelText('Cancellation Reason'), 'Created in error');
    expect(button).toBeEnabled();
  });

  it('sends the trimmed reason to the cancel endpoint and closes on success', async () => {
    const user = userEvent.setup();
    const requests = mockCancelEndpoint();
    const onOpenChange = vi.fn();
    renderWithProviders(<CancelLoanSheet open onOpenChange={onOpenChange} loanId="loan-123" />);

    await user.type(screen.getByLabelText('Cancellation Reason'), '  Loan was created in error  ');
    await user.click(screen.getByRole('button', { name: 'Cancel Loan' }));

    await waitFor(() => {
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    expect(requests).toEqual([
      { loanId: 'loan-123', body: { cancellation_reason: 'Loan was created in error' } },
    ]);
  });

  it('stays open when the API rejects the cancellation', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    server.use(
      http.patch(CANCEL_URL, () =>
        HttpResponse.json(
          {
            success: false,
            error: {
              code: 'VALIDATION_ERROR',
              message: 'Cannot cancel loan with approved transactions beyond initial disbursement',
              details: [],
            },
          },
          { status: 400 },
        ),
      ),
    );
    renderWithProviders(<CancelLoanSheet open onOpenChange={onOpenChange} loanId="loan-123" />);

    await user.type(screen.getByLabelText('Cancellation Reason'), 'Created in error');
    await user.click(screen.getByRole('button', { name: 'Cancel Loan' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Cancel Loan' })).toBeEnabled();
    });
    expect(onOpenChange).not.toHaveBeenCalled();
    expect(screen.getByLabelText('Cancellation Reason')).toHaveValue('Created in error');
  });
});
