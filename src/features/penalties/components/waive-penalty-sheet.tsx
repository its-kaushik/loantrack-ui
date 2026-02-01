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
import { useWaivePenalty } from '../hooks/use-waive-penalty';
import type { Penalty } from '@/types/entities';

interface WaivePenaltySheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  penalty: Penalty | null;
  loanId: string;
}

export function WaivePenaltySheet({ open, onOpenChange, penalty, loanId }: WaivePenaltySheetProps) {
  const [waiveAmount, setWaiveAmount] = useState<number | undefined>();
  const [notes, setNotes] = useState('');
  const waiveMutation = useWaivePenalty(loanId);

  const handleWaive = () => {
    if (!penalty || !waiveAmount) return;

    waiveMutation.mutate(
      { penaltyId: penalty.id, waiveAmount, notes: notes.trim() || undefined },
      {
        onSuccess: () => {
          onOpenChange(false);
          setWaiveAmount(undefined);
          setNotes('');
        },
      },
    );
  };

  if (!penalty) return null;

  const maxWaivable = penalty.netPayable - penalty.amountCollected;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Waive Penalty</SheetTitle>
          <SheetDescription>
            Enter the amount to waive (full or partial).
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          <div className="rounded-lg border p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Penalty Amount</span>
              <span className="font-medium"><CurrencyDisplay amount={penalty.penaltyAmount} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Already Waived</span>
              <span className="font-medium"><CurrencyDisplay amount={penalty.waivedAmount} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Max Waivable</span>
              <span className="font-semibold"><CurrencyDisplay amount={maxWaivable} /></span>
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
            <Label htmlFor="waive-notes">Notes (optional)</Label>
            <Textarea
              id="waive-notes"
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
            disabled={!waiveAmount || waiveAmount <= 0 || waiveMutation.isPending}
            className="w-full"
          >
            {waiveMutation.isPending ? 'Waiving...' : 'Waive Penalty'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
