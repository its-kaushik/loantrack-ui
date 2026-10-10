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
import { useCancelLoan } from '../hooks/use-loan-actions';

interface CancelLoanSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
}

export function CancelLoanSheet({ open, onOpenChange, loanId }: CancelLoanSheetProps) {
  const [reason, setReason] = useState('');
  const cancelMutation = useCancelLoan(loanId);

  const handleCancel = () => {
    const trimmed = reason.trim();
    if (!trimmed) return;

    cancelMutation.mutate(trimmed, {
      onSuccess: () => {
        onOpenChange(false);
        setReason('');
      },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Cancel Loan</SheetTitle>
          <SheetDescription>
            Cancelling treats this loan as if it never existed. This action cannot be undone.
          </SheetDescription>
        </SheetHeader>

        <div className="px-4">
          <Label htmlFor="cancellation-reason">Cancellation Reason</Label>
          <Textarea
            id="cancellation-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Loan was created in error"
            rows={3}
            maxLength={2000}
            className="mt-1.5"
          />
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={!reason.trim() || cancelMutation.isPending}
            className="w-full"
          >
            {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Loan'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
