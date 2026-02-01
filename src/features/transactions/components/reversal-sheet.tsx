'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DatePicker } from '@/components/shared/date-picker';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { useCreateTransaction } from '../hooks/use-create-transaction';
import { generateIdempotencyKey } from '@/utils/idempotency';
import { formatDate } from '@/utils/date';
import { AlertTriangle } from 'lucide-react';
import type { TransactionDetail } from '@/types/entities';

interface ReversalSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  transaction: TransactionDetail | null;
}

const typeLabels: Record<string, string> = {
  INTEREST_PAYMENT: 'Interest Payment',
  PRINCIPAL_RETURN: 'Principal Return',
  DAILY_COLLECTION: 'Daily Collection',
  PENALTY: 'Penalty',
  GUARANTOR_PAYMENT: 'Guarantor Payment',
};

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function ReversalSheet({ open, onOpenChange, transaction }: ReversalSheetProps) {
  const [date, setDate] = useState(todayString());
  const [notes, setNotes] = useState('');
  const idempotencyKeyRef = useRef(generateIdempotencyKey());
  const createMutation = useCreateTransaction();

  const handleConfirm = () => {
    if (!transaction || !notes.trim()) return;

    createMutation.mutate(
      {
        loanId: transaction.loanId,
        transactionType: transaction.transactionType as 'INTEREST_PAYMENT' | 'PRINCIPAL_RETURN' | 'DAILY_COLLECTION' | 'PENALTY' | 'GUARANTOR_PAYMENT',
        amount: -Math.abs(transaction.amount),
        transactionDate: date,
        correctedTransactionId: transaction.id,
        notes: notes.trim(),
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setNotes('');
          setDate(todayString());
          idempotencyKeyRef.current = generateIdempotencyKey();
        },
      },
    );
  };

  if (!transaction) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Reverse Transaction</SheetTitle>
          <SheetDescription>
            Create a corrective transaction to reverse this payment.
          </SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4">
          {/* Original Details */}
          <div className="rounded-lg border p-3 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Loan</span>
              <span className="font-medium">{transaction.loanNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Borrower</span>
              <span className="font-medium">{transaction.borrowerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Type</span>
              <span className="font-medium">
                {typeLabels[transaction.transactionType] ?? transaction.transactionType}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Amount</span>
              <span className="font-medium"><CurrencyDisplay amount={transaction.amount} /></span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Original Date</span>
              <span className="font-medium">{formatDate(transaction.transactionDate)}</span>
            </div>
          </div>

          {/* Reversal Amount */}
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Reversal Amount</span>
              <span className="font-semibold text-destructive">
                - <CurrencyDisplay amount={transaction.amount} />
              </span>
            </div>
          </div>

          {/* Transaction Date */}
          <div className="space-y-2">
            <Label>Transaction Date</Label>
            <DatePicker value={date} onChange={setDate} />
          </div>

          {/* Notes (required) */}
          <div className="space-y-2">
            <Label htmlFor="reversal-notes">Reason for Reversal *</Label>
            <Textarea
              id="reversal-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Enter reason for this reversal..."
              rows={2}
            />
          </div>

          {/* Warning */}
          <div className="flex items-start gap-2 text-xs text-muted-foreground">
            <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-500 mt-0.5" />
            <p>
              This will create a corrective transaction that reverses the original.
              Loan balances will be adjusted automatically.
            </p>
          </div>
        </div>

        <SheetFooter>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={!notes.trim() || createMutation.isPending}
            className="w-full"
          >
            {createMutation.isPending ? 'Reversing...' : 'Confirm Reversal'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
