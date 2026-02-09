'use client';

import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { CashHandoverCard } from './cash-handover-card';
import { DailyLoanItem } from './daily-loan-item';
import { useCollectionsToday } from '../hooks/use-collections-today';
import { Layers } from 'lucide-react';

export function CollectionsToday() {
  const { data: items, isLoading, refetch, isRefetching } = useCollectionsToday();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24 w-full rounded-lg" />
        {Array.from({ length: 5 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  const allItems = items ?? [];

  return (
    <div className="space-y-3">
      <CashHandoverCard items={allItems} />

      {allItems.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-8">
          All collections done for today!
        </p>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">{allItems.length} loans</p>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => refetch()}
              disabled={isRefetching}
              className="text-xs"
            >
              {isRefetching ? 'Refreshing...' : 'Refresh'}
            </Button>
          </div>

          <div className="space-y-2">
            {allItems.map((item) => (
              <DailyLoanItem key={item.loanId} item={item} />
            ))}
          </div>
        </>
      )}

      {allItems.length > 0 && (
        <div className="fixed bottom-20 right-4 z-40">
          <Button size="lg" className="rounded-full shadow-lg" asChild>
            <Link href="/today/bulk">
              <Layers className="mr-2 h-4 w-4" />
              Bulk Submit
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
