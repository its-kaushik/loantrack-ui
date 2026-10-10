'use client';

import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { EntryActionsMenu } from './entry-actions-menu';
import { paymentTypeLabel, paymentTypeLabels } from '../labels';
import { formatDate } from '@/utils/date';
import { cn } from '@/lib/utils';
import type { TransactionDetail } from '@/types/entities';

interface TransactionRowProps {
  transaction: TransactionDetail;
  onRemove?: (transactionId: string) => void;
}

export function TransactionRow({ transaction, onRemove }: TransactionRowProps) {
  const isCorrection = transaction.isCorrection || transaction.amount < 0;
  const isCorrected = transaction.isCorrected === true;
  const isApproved = transaction.approvalStatus === 'APPROVED';
  const isPayment = transaction.transactionType in paymentTypeLabels;
  // This list does not know the loan's other entries, so the actions are offered on every
  // approved payment and the server decides (and explains) when one cannot be changed.
  const canAct = isApproved && isPayment && !isCorrected && !isCorrection && onRemove;

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
            {paymentTypeLabel(transaction.transactionType)}
          </p>
          <StatusBadge status={transaction.approvalStatus} variant="approval" />
          {isCorrected && (
            <Badge variant="outline" className="text-[10px]">Corrected</Badge>
          )}
          {isCorrection && (
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
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        <p className={cn('text-sm font-semibold', isCorrection && 'text-destructive')}>
          {isCorrection ? '- ' : ''}
          <CurrencyDisplay amount={Math.abs(transaction.amount)} />
        </p>
        {canAct && <EntryActionsMenu transactionId={transaction.id} onRemove={onRemove} />}
      </div>
    </div>
  );
}
