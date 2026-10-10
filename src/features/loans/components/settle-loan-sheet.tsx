'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useSettleLoan } from '../hooks/use-loan-actions';
import type { DailyLoanDetail } from '@/types/entities';

interface SettleLoanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loan: DailyLoanDetail;
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export function SettleLoanSheet({ open, onOpenChange, loan }: SettleLoanSheetProps) {
  const [note, setNote] = useState('');
  const settleMutation = useSettleLoan(loan.id);

  const interestReceived = loan.totalCollected - loan.principalAmount;
  const notCharged = loan.totalRepaymentAmount - loan.totalCollected;

  const handleSettle = () => {
    settleMutation.mutate(
      // The server refuses if this is no longer the amount collected
      { settlementAmount: loan.totalCollected, note: note.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNote('');
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Settle &amp; Close Loan</SheetTitle>
          <SheetDescription>
            Closes this loan at the amount already collected. The rest of the scheduled amount will
            not be charged. This action cannot be undone.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-3">
          <div className="divide-y rounded-lg border px-3">
            <SummaryRow label="Principal">
              <CurrencyDisplay amount={loan.principalAmount} />
            </SummaryRow>
            <SummaryRow label="Collected">
              <CurrencyDisplay amount={loan.totalCollected} />
            </SummaryRow>
            <SummaryRow label="Interest received">
              <CurrencyDisplay amount={interestReceived} />
            </SummaryRow>
            <SummaryRow label="Days since disbursement">{loan.daysElapsed}</SummaryRow>
            <SummaryRow label="Scheduled total">
              <CurrencyDisplay amount={loan.totalRepaymentAmount} />
            </SummaryRow>
            <SummaryRow label="Will not be charged">
              <CurrencyDisplay amount={notCharged} />
            </SummaryRow>
          </div>

          <div>
            <Label htmlFor="settlement-note">Note (optional)</Label>
            <Textarea
              id="settlement-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Repaid in one month, charged one month of interest"
              rows={2}
              maxLength={2000}
              className="mt-1.5"
            />
          </div>
        </div>

        <SheetFooter>
          <Button onClick={handleSettle} disabled={settleMutation.isPending} className="w-full">
            {settleMutation.isPending ? (
              'Settling...'
            ) : (
              <>
                Settle at <CurrencyDisplay amount={loan.totalCollected} className="ml-1" />
              </>
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
