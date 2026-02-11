'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useWaiveInterest } from '../hooks/use-waive-interest';

interface WaiveInterestSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  loanId: string;
  monthlyInterestDue: number;
}

export function WaiveInterestSheet({
  open,
  onOpenChange,
  loanId,
  monthlyInterestDue,
}: WaiveInterestSheetProps) {
  const [waiveAmount, setWaiveAmount] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const waiveMutation = useWaiveInterest(loanId);

  const handleWaive = () => {
    if (!waiveAmount) return;

    waiveMutation.mutate(
      { waiveAmount, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setWaiveAmount(undefined);
          setNotes('');
        },
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Waive Interest</SheetTitle>
          <SheetDescription>
            Waive full or partial interest for the next unsettled billing cycle.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="rounded-lg border p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Monthly Interest Due</span>
              <span className="font-semibold">
                <CurrencyDisplay amount={monthlyInterestDue} />
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Waive Amount</Label>
            <CurrencyInput
              value={waiveAmount}
              onValueChange={setWaiveAmount}
              placeholder="Enter amount to waive"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="waive-interest-notes">Notes (optional)</Label>
            <Textarea
              id="waive-interest-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for waiver..."
              rows={2}
            />
          </div>
        </div>

        <SheetFooter>
          <Button
            onClick={handleWaive}
            disabled={
              !waiveAmount ||
              waiveAmount <= 0 ||
              waiveMutation.isPending
            }
            className="w-full"
          >
            {waiveMutation.isPending ? 'Waiving...' : 'Waive Interest'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
