'use client';

import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { StatusBadge } from '@/components/shared/status-badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useLoanTransactions } from '../hooks/use-loan-transactions';
import { formatDate } from '@/utils/date';
import type { Transaction } from '@/types/entities';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

interface LoanTransactionListProps {
  loanId: string;
}

function TransactionTypeLabel({ type }: { type: string }) {
  const labels: Record<string, string> = {
    INTEREST_PAYMENT: 'Interest',
    PRINCIPAL_RETURN: 'Principal Return',
    DAILY_COLLECTION: 'Collection',
    PENALTY: 'Penalty',
    GUARANTOR_PAYMENT: 'Guarantor',
  };
  return <span>{labels[type] ?? type}</span>;
}

function TransactionRow({ txn }: { txn: Transaction }) {
  const isCorrective = txn.amount < 0;
  const isCorrected = txn.notes?.includes('[CORRECTED]') || false;

  return (
    <div
      className={cn(
        'flex items-center justify-between py-2 px-1 border-b last:border-b-0',
        isCorrected && 'opacity-50',
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className={cn('text-sm font-medium', isCorrected && 'line-through')}>
            <TransactionTypeLabel type={txn.transactionType} />
          </p>
          <StatusBadge status={txn.approvalStatus} variant="approval" />
          {isCorrected && (
            <Badge variant="outline" className="text-[10px]">
              Corrected
            </Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{formatDate(txn.transactionDate)}</p>
      </div>
      <p
        className={cn(
          'text-sm font-semibold flex-shrink-0 ml-3',
          isCorrective && 'text-destructive',
        )}
      >
        {isCorrective ? '- ' : ''}
        <CurrencyDisplay amount={Math.abs(txn.amount)} />
      </p>
    </div>
  );
}

export function LoanTransactionList({ loanId }: LoanTransactionListProps) {
  const { data, isLoading, hasNextPage, isFetchingNextPage, fetchNextPage } =
    useLoanTransactions(loanId);
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
        <TransactionRow key={txn.id} txn={txn} />
      ))}
      <div ref={observerRef} className="h-4">
        {isFetchingNextPage && <Skeleton className="h-12 w-full mt-2" />}
      </div>
    </div>
  );
}
