'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useEntry, useRemoveEntry } from '../hooks/use-entry';
import { paymentTypeLabel } from '../labels';
import { formatDate } from '@/utils/date';

interface RemoveEntrySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Any row of the payment to remove. */
  transactionId: string | null;
}

function SummaryRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-1.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{children}</span>
    </div>
  );
}

export function RemoveEntrySheet({ open, onOpenChange, transactionId }: RemoveEntrySheetProps) {
  const [reason, setReason] = useState('');
  // What will be removed comes from the server: one payment can be stored as several rows
  const {
    data: entry,
    isLoading,
    isError,
  } = useEntry(open ? (transactionId ?? undefined) : undefined);
  const removeMutation = useRemoveEntry();

  const handleRemove = () => {
    if (!transactionId || !entry?.canFix) return;

    removeMutation.mutate(
      { transactionId, reason: reason.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setReason('');
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Remove Entry</SheetTitle>
          <SheetDescription>
            For a payment that should not have been recorded. It stays in the history, marked as
            corrected, and its effect on the loan is undone.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-3">
          {isLoading && <Skeleton className="h-28 w-full rounded-lg" />}

          {isError && (
            <p className="text-sm text-destructive">Could not load this entry. Please try again.</p>
          )}

          {entry && (
            <div className="divide-y rounded-lg border px-3">
              <SummaryRow label="Loan">
                {entry.loanNumber} — {entry.borrowerName}
              </SummaryRow>
              <SummaryRow label="Type">{paymentTypeLabel(entry.transactionType)}</SummaryRow>
              <SummaryRow label="Amount">
                <CurrencyDisplay amount={entry.amount} />
              </SummaryRow>
              {entry.transactionDate && (
                <SummaryRow label="Date">{formatDate(entry.transactionDate)}</SummaryRow>
              )}
            </div>
          )}

          {entry && entry.rows.length > 1 && (
            <p className="text-xs text-muted-foreground">
              This payment was recorded as {entry.rows.length} rows. All of them will be undone.
            </p>
          )}

          {entry && !entry.canFix && (
            <p role="alert" className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
              {entry.reason ?? 'This entry cannot be changed.'}
            </p>
          )}

          {entry?.canFix && (
            <div>
              <Label htmlFor="remove-entry-reason">Reason (optional)</Label>
              <Textarea
                id="remove-entry-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Recorded twice"
                rows={2}
                maxLength={2000}
                className="mt-1.5"
              />
            </div>
          )}
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            onClick={handleRemove}
            disabled={!entry?.canFix || removeMutation.isPending}
            className="w-full"
          >
            {removeMutation.isPending ? 'Removing...' : 'Remove Entry'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
