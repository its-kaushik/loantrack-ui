'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { CurrencyInput } from '@/components/shared/currency-input';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { DatePicker } from '@/components/shared/date-picker';
import { LoanPicker } from '@/components/shared/loan-picker';
import { BulkResultModal } from './bulk-result-modal';
import { useBulkCollect } from '@/features/collector/hooks/use-bulk-collect';
import { generateIdempotencyKey } from '@/utils/idempotency';
import { Plus, Trash2 } from 'lucide-react';
import type { Loan, BulkCollectionResult } from '@/types/entities';
import type { ApiError } from '@/types/api';

interface BulkRow {
  id: string;
  loanId: string;
  selectedLoan: { id: string; loanNumber: string; borrowerName: string; loanType: string } | null;
  amount: number | undefined;
}

function todayString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function createRow(): BulkRow {
  return {
    id: crypto.randomUUID(),
    loanId: '',
    selectedLoan: null,
    amount: undefined,
  };
}

export function BulkCollectionForm() {
  const router = useRouter();
  const bulkMutation = useBulkCollect();
  const idempotencyKeyRef = useRef(generateIdempotencyKey());

  const [transactionDate, setTransactionDate] = useState(todayString());
  const [rows, setRows] = useState<BulkRow[]>([createRow()]);
  const [resultOpen, setResultOpen] = useState(false);
  const [result, setResult] = useState<BulkCollectionResult | null>(null);

  const updateRow = (id: string, updates: Partial<BulkRow>) => {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...updates } : r)));
  };

  const removeRow = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
  };

  const addRow = () => {
    setRows((prev) => [...prev, createRow()]);
  };

  const handleLoanSelect = (rowId: string, loanId: string, loan: Loan) => {
    updateRow(rowId, {
      loanId,
      selectedLoan: {
        id: loan.id,
        loanNumber: loan.loanNumber,
        borrowerName: loan.borrowerName,
        loanType: loan.loanType,
      },
    });
  };

  const validRows = rows.filter((r) => r.loanId && r.amount && r.amount > 0);
  const totalAmount = validRows.reduce((sum, r) => sum + (r.amount ?? 0), 0);

  const handleSubmit = () => {
    if (validRows.length === 0) return;

    const collections = validRows.map((r) => ({
      loanId: r.loanId,
      amount: r.amount!,
      transactionDate,
    }));

    bulkMutation.mutate(
      { collections, idempotencyKey: idempotencyKeyRef.current },
      {
        onSuccess: (data) => {
          setResult(data);
          setResultOpen(true);
          // Generate new key for future submissions
          idempotencyKeyRef.current = generateIdempotencyKey();
        },
      },
    );
  };

  const handleDone = () => {
    setResultOpen(false);
    router.push('/today');
  };

  const handleRetryFailed = () => {
    if (!result) return;

    // Keep only the rows that correspond to failed results
    const failedIndices = new Set<number>();
    result.results.forEach((r, i) => {
      if (!r.success) failedIndices.add(i);
    });

    const failedRows = validRows
      .filter((_, i) => failedIndices.has(i))
      .map((r) => ({ ...r, id: crypto.randomUUID() }));

    setRows(failedRows.length > 0 ? failedRows : [createRow()]);
    setResultOpen(false);
    setResult(null);
    idempotencyKeyRef.current = generateIdempotencyKey();
  };

  const apiError = bulkMutation.error as unknown as ApiError | undefined;

  return (
    <div className="space-y-4 p-4">
      {apiError && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {apiError.message || 'Failed to submit bulk collection.'}
        </div>
      )}

      {/* Date Picker */}
      <div className="space-y-2">
        <Label>Collection Date</Label>
        <DatePicker
          value={transactionDate}
          onChange={setTransactionDate}
          placeholder="Select date"
        />
      </div>

      {/* Rows */}
      <div className="space-y-3">
        {rows.map((row, index) => (
          <Card key={row.id}>
            <CardContent className="py-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  #{index + 1}
                </span>
                {rows.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => removeRow(row.id)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                )}
              </div>
              <LoanPicker
                value={row.loanId}
                selectedLoan={row.selectedLoan}
                onChange={(id, loan) => handleLoanSelect(row.id, id, loan)}
              />
              <CurrencyInput
                value={row.amount}
                onValueChange={(val) => updateRow(row.id, { amount: val })}
                placeholder="Amount"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      <Button variant="outline" onClick={addRow} className="w-full">
        <Plus className="mr-2 h-4 w-4" />
        Add Row
      </Button>

      {/* Summary Footer */}
      <Card className="bg-muted/50">
        <CardContent className="py-3 flex items-center justify-between text-sm">
          <span className="text-muted-foreground">{validRows.length} items</span>
          <span className="font-semibold">
            Total: <CurrencyDisplay amount={totalAmount} />
          </span>
        </CardContent>
      </Card>

      {/* Submit */}
      <Button
        onClick={handleSubmit}
        className="w-full"
        disabled={validRows.length === 0 || bulkMutation.isPending}
      >
        {bulkMutation.isPending ? 'Submitting...' : `Submit ${validRows.length} Collections`}
      </Button>

      <BulkResultModal
        open={resultOpen}
        onOpenChange={setResultOpen}
        result={result}
        onDone={handleDone}
        onRetryFailed={handleRetryFailed}
      />
    </div>
  );
}
