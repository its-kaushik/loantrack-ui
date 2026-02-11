'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useLoanDetail } from '@/features/loans/hooks/use-loan-detail';
import { useCreateTransaction } from '@/features/transactions/hooks/use-create-transaction';
import { useState } from 'react';
import type { ApiError } from '@/types/api';
import type { DailyLoanDetail } from '@/types/entities';

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function RecordCollectionForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loanId = searchParams.get('loanId') ?? '';

  const { data: loanDetail, isLoading } = useLoanDetail(loanId);
  const createMutation = useCreateTransaction();

  const dailyLoan = loanDetail?.loanType === 'DAILY' ? (loanDetail as DailyLoanDetail) : null;
  const defaultAmount = dailyLoan?.dailyPaymentAmount;

  const [amountOverride, setAmountOverride] = useState<number | undefined>();
  const [userEdited, setUserEdited] = useState(false);
  const [notes, setNotes] = useState('');

  const amount = userEdited ? amountOverride : (amountOverride ?? defaultAmount);

  const handleAmountChange = (val: number | undefined) => {
    setUserEdited(true);
    setAmountOverride(val);
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
      </div>
    );
  }

  if (!loanDetail || loanDetail.loanType !== 'DAILY') {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Invalid loan. Collections can only be recorded for daily loans.
      </div>
    );
  }

  const handleSubmit = () => {
    if (!amount || amount <= 0) return;

    createMutation.mutate(
      {
        loanId,
        transactionType: 'DAILY_COLLECTION',
        amount,
        transactionDate: todayString(),
        notes: notes.trim() || undefined,
      },
      {
        onSuccess: () => {
          router.back();
        },
      },
    );
  };

  const apiError = createMutation.error as unknown as ApiError | undefined;

  return (
    <div className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to record collection.'}
        </div>
      )}

      {/* Loan Info */}
      <Card>
        <CardContent className="py-3 divide-y text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Loan</span>
            <span className="font-medium">{loanDetail.loanNumber}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Borrower</span>
            <span className="font-medium">{loanDetail.borrowerName}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Daily Amount</span>
            <span className="font-semibold">
              <CurrencyDisplay amount={dailyLoan!.dailyPaymentAmount} />
            </span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Remaining</span>
            <span className="font-medium">
              <CurrencyDisplay amount={dailyLoan!.totalRemaining} />
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Amount */}
      <div className="space-y-2">
        <Label>Collection Amount</Label>
        <CurrencyInput
          value={amount}
          onValueChange={handleAmountChange}
          placeholder="Enter amount"
        />
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="collection-notes">Notes (optional)</Label>
        <Textarea
          id="collection-notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Additional notes..."
          rows={2}
        />
      </div>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={!amount || amount <= 0 || createMutation.isPending}
      >
        {createMutation.isPending ? 'Submitting...' : 'Submit Collection'}
      </Button>

      <p className="text-xs text-muted-foreground text-center">
        Collection will be submitted as pending and await admin approval.
      </p>
    </div>
  );
}
