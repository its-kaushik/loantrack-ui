'use client';

import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { EntryActionsMenu } from '@/features/transactions/components/entry-actions-menu';
import { RemoveEntrySheet } from '@/features/transactions/components/remove-entry-sheet';
import { paymentTypeLabel } from '@/features/transactions/labels';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useLoanTransactions } from '../hooks/use-loan-transactions';
import { formatDate } from '@/utils/date';
import type { Transaction } from '@/types/entities';
import { cn } from '@/lib/utils';

interface LoanTransactionListProps {
  loanId: string;
}

interface TransactionRowProps {
  txn: Transaction;
  /** Given only to admins, and only for entries the server says may be changed. */
  onRemove?: (transactionId: string) => void;
}

function TransactionRow({ txn, onRemove }: TransactionRowProps) {
  const isCorrection = txn.isCorrection || txn.amount < 0;
  const isCorrected = txn.isCorrected === true;

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-1 border-b last:border-b-0',
        isCorrected && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className={cn('text-sm font-medium', isCorrected && 'line-through')}>
            {paymentTypeLabel(txn.transactionType)}
          </p>
          <StatusBadge status={txn.approvalStatus} variant="approval" />
          {isCorrected && (
            <Badge variant="outline" className="text-[10px]">
              Corrected
            </Badge>
          )}
          {isCorrection && (
            <Badge variant="outline" className="text-[10px] text-destructive border-destructive">
              Reversal
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(txn.transactionDate)}</p>
      </div>
      <div className="flex items-center gap-1 flex-shrink-0 ml-3">
        <p className={cn('text-sm font-semibold', isCorrection && 'text-destructive')}>
          {isCorrection ? '- ' : ''}
          <CurrencyDisplay amount={Math.abs(txn.amount)} />
        </p>
        {onRemove && <EntryActionsMenu transactionId={txn.id} onRemove={onRemove} />}
      </div>
    </div>
  );
}

export function LoanTransactionList({ loanId }: LoanTransactionListProps) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLoanTransactions(loanId);
  const { isAdmin } = useAuth();
  const [removeTarget, setRemoveTarget] = useState<string | null>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = observerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      { rootMargin: '100px' },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    );
  }

  const transactions = data?.pages.flatMap((p) => p.data) ?? [];

  if (transactions.length === 0) {
    return <p className="text-sm text-muted-foreground py-4">No transactions yet.</p>;
  }

  return (
    <div>
      {transactions.map((txn) => (
        <TransactionRow
          key={txn.id}
          txn={txn}
          onRemove={isAdmin && txn.canFix ? setRemoveTarget : undefined}
        />
      ))}
      <div ref={observerRef} className="h-4">
        {isFetchingNextPage && <Skeleton className="h-12 w-full mt-2" />}
      </div>

      <RemoveEntrySheet
        open={removeTarget !== null}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        transactionId={removeTarget}
      />
    </div>
  );
}
