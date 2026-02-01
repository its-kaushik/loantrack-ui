'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useTodaySummary } from '../hooks/use-today-summary';
import { queryKeys } from '@/lib/query-keys';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { Skeleton } from '@/components/ui/skeleton';
import { TotalCollectedCard } from './total-collected-card';
import { CollectionProgressCard } from './collection-progress-card';
import { PendingApprovalsCard } from './pending-approvals-card';
import { MissedCollectionsList } from './missed-collections-list';
import { MonthlyInterestDueList } from './monthly-interest-due-list';

export function TodaySummary() {
  const { data, isLoading, isError } = useTodaySummary();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.today() });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-24 w-full rounded-lg" />
        <Skeleton className="h-32 w-full rounded-lg" />
        <Skeleton className="h-14 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
        <Skeleton className="h-48 w-full rounded-lg" />
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load dashboard data. Pull down to retry.
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-4 p-4">
        <TotalCollectedCard amount={data.totalCollectedToday} />
        <CollectionProgressCard
          expected={data.expectedCollections}
          received={data.receivedCollections}
        />
        <PendingApprovalsCard count={data.pendingApprovalsCount} />
        <MissedCollectionsList items={data.missedToday} />
        <MonthlyInterestDueList items={data.monthlyInterestDueToday} />
      </div>
    </PullToRefresh>
  );
}
