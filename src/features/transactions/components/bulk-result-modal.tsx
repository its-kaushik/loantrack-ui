'use client';

import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet';
import { CheckCircle2, XCircle } from 'lucide-react';
import type { BulkCollectionResult } from '@/types/entities';

interface BulkResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  result: BulkCollectionResult | null;
  onDone: () => void;
  onRetryFailed: () => void;
}

export function BulkResultModal({
  open,
  onOpenChange,
  result,
  onDone,
  onRetryFailed,
}: BulkResultModalProps) {
  if (!result) return null;

  const total = result.created + result.failed;
  const successRate = total > 0 ? result.created / total : 0;
  const statusColor = successRate >= 0.9 ? 'text-green-600' : successRate >= 0.5 ? 'text-amber-600' : 'text-destructive';

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="rounded-t-xl max-h-[80vh]">
        <SheetHeader>
          <SheetTitle>Bulk Collection Results</SheetTitle>
          <SheetDescription>
            <span className={statusColor}>
              {result.created} of {total} collections submitted
            </span>
          </SheetDescription>
        </SheetHeader>

        <div className="px-4 space-y-3 overflow-y-auto max-h-[50vh]">
          {result.results.map((item, index) => (
            <div
              key={index}
              className="flex items-start gap-2 py-2 border-b last:border-b-0"
            >
              {item.success ? (
                <CheckCircle2 className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              )}
              <div className="min-w-0 flex-1">
                {item.success && item.transaction ? (
                  <div className="text-sm">
                    <span className="font-medium">
                      <CurrencyDisplay amount={item.transaction.amount} />
                    </span>
                    <span className="text-muted-foreground ml-1">— Pending Approval</span>
                  </div>
                ) : (
                  <p className="text-sm text-destructive">{item.error || 'Failed'}</p>
                )}
              </div>
            </div>
          ))}
        </div>

        <SheetFooter className="gap-2">
          {result.failed > 0 && (
            <Button variant="outline" onClick={onRetryFailed} className="flex-1">
              Retry Failed ({result.failed})
            </Button>
          )}
          <Button onClick={onDone} className="flex-1">
            Done
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
