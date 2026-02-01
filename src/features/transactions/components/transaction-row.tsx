'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate } from '@/utils/date';
import { RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TransactionDetail } from '@/types/entities';

const typeLabels: Record<string, string> = {
  INTEREST_PAYMENT: 'Interest',
  PRINCIPAL_RETURN: 'Principal Return',
  DAILY_COLLECTION: 'Collection',
  PENALTY: 'Penalty',
  GUARANTOR_PAYMENT: 'Guarantor',
};

interface TransactionRowProps {
  transaction: TransactionDetail;
  onReverse?: (transaction: TransactionDetail) => void;
}

export function TransactionRow({ transaction, onReverse }: TransactionRowProps) {
  const isCorrective = transaction.amount < 0;
  const isCorrected = transaction.notes?.includes('[CORRECTED]') || false;
  const isApproved = transaction.approvalStatus === 'APPROVED';
  const canReverse = isApproved && !isCorrected && !isCorrective && onReverse;

  return (
    <div
      className={cn(
        'flex items-center justify-between py-3 px-1 border-b last:border-b-0',
        isCorrected && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 flex-wrap">
          <p className={cn('text-sm font-medium', isCorrected && 'line-through')}>
            {typeLabels[transaction.transactionType] ?? transaction.transactionType}
          </p>
          <StatusBadge status={transaction.approvalStatus} variant="approval" />
          {isCorrected && (
            <Badge variant="outline" className="text-[10px]">Corrected</Badge>
          )}
          {isCorrective && (
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive">
              Reversal
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">
          {transaction.loanNumber} — {transaction.borrowerName}
        </p>
        <p className="text-xs text-muted-foreground">
          {formatDate(transaction.transactionDate)}
          {transaction.collectorName && ` • ${transaction.collectorName}`}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0 ml-3">
        <p
          className={cn(
            'text-sm font-semibold',
            isCorrective && 'text-destructive',
          )}
        >
          {isCorrective ? '- ' : ''}
          <CurrencyDisplay amount={Math.abs(transaction.amount)} />
        </p>
        {canReverse && (
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => onReverse(transaction)}
            title="Reverse"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
