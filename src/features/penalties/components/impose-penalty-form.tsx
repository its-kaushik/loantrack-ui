'use client';

import { useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useLoanDetail } from '@/features/loans/hooks/use-loan-detail';
import { useImposePenalty } from '../hooks/use-impose-penalty';
import type { ApiError } from '@/types/api';
import type { DailyLoanDetail } from '@/types/entities';

export function ImposePenaltyForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const loanId = searchParams.get('loanId') ?? '';

  const { data: loanDetail, isLoading: loanLoading } = useLoanDetail(loanId);
  const imposeMutation = useImposePenalty(loanId);

  const [overrideAmount, setOverrideAmount] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const [useOverride, setUseOverride] = useState(false);

  if (loanLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (!loanDetail || loanDetail.loanType !== 'DAILY') {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Penalties can only be imposed on daily loans.
      </div>
    );
  }

  const loan = loanDetail as DailyLoanDetail;

  if (!loan.isOverdue) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        This loan is not overdue. Penalties can only be imposed on overdue loans.
      </div>
    );
  }

  // Estimate penalty (same formula as backend for preview)
  const daysOverdue = loan.daysOverdue;
  const estimatedMonths = Math.ceil(daysOverdue / 30);
  const estimatedAmount = loan.principalAmount * (loan.interestRate / 100) * estimatedMonths;

  const handleSubmit = () => {
    const body = useOverride && overrideAmount
      ? { overrideAmount, notes: notes.trim() || undefined }
      : { notes: notes.trim() || undefined };

    imposeMutation.mutate(body, {
      onSuccess: () => router.push(`/loans/${loanId}`),
    });
  };

  const apiError = imposeMutation.error as unknown as ApiError | undefined;

  return (
    <div className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to impose penalty.'}
        </div>
      )}

      {/* Loan Info */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">Loan Info</CardTitle>
        </CardHeader>
        <CardContent className="divide-y text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Loan</span>
            <span className="font-medium">{loan.loanNumber}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Borrower</span>
            <span className="font-medium">{loan.borrowerName}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Principal</span>
            <span className="font-medium"><CurrencyDisplay amount={loan.principalAmount} /></span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Interest Rate</span>
            <span className="font-medium">{loan.interestRate}% / month</span>
          </div>
        </CardContent>
      </Card>

      {/* Penalty Calculation */}
      <Card className="border-destructive/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-destructive">Penalty Calculation</CardTitle>
        </CardHeader>
        <CardContent className="divide-y text-sm">
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Days Overdue</span>
            <span className="font-medium text-destructive">{daysOverdue}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Months Charged</span>
            <span className="font-medium">{estimatedMonths}</span>
          </div>
          <div className="flex justify-between py-1.5">
            <span className="text-muted-foreground">Calculated Amount</span>
            <span className="font-semibold"><CurrencyDisplay amount={estimatedAmount} /></span>
          </div>
        </CardContent>
      </Card>

      {/* Override Option */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="useOverride"
            checked={useOverride}
            onChange={(e) => setUseOverride(e.target.checked)}
            className="rounded"
          />
          <Label htmlFor="useOverride" className="text-sm font-normal">
            Override calculated amount
          </Label>
        </div>
        {useOverride && (
          <CurrencyInput
            value={overrideAmount}
            onValueChange={setOverrideAmount}
            placeholder="Enter override amount"
          />
        )}
      </div>

      {/* Notes */}
      <div className="space-y-2">
        <Label htmlFor="penalty-notes">Notes (optional)</Label>
        <Textarea
          id="penalty-notes"
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
        disabled={imposeMutation.isPending || (useOverride && !overrideAmount)}
      >
        {imposeMutation.isPending ? 'Imposing Penalty...' : 'Impose Penalty'}
      </Button>
    </div>
  );
}
