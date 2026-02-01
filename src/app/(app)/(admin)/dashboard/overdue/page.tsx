'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useOverdue } from '@/features/dashboard/hooks/use-overdue';
import { queryKeys } from '@/lib/query-keys';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

export default function OverduePage() {
  const { data, isLoading, isError } = useOverdue();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.overdue() });
  };

  if (isLoading) {
    return (
      <div className="space-y-4 p-4">
        <Skeleton className="h-6 w-40" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 w-full rounded-lg" />
        ))}
        <Skeleton className="h-6 w-48 mt-4" />
        {Array.from({ length: 2 }).map((_, i) => (
          <Skeleton key={`m-${i}`} className="h-20 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load overdue data. Pull down to retry.
      </div>
    );
  }

  const hasNone =
    data.overdueDailyLoans.length === 0 && data.overdueMonthlyLoans.length === 0;

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-6 p-4">
        {hasNone ? (
          <EmptyState
            title="No overdue loans"
            description="All loans are up to date. Great work!"
          />
        ) : (
          <>
            {data.overdueDailyLoans.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Overdue Daily Loans ({data.overdueDailyLoans.length})
                </h3>
                <div className="space-y-2">
                  {data.overdueDailyLoans.map((loan) => (
                    <Link key={loan.loanId} href={`/loans/${loan.loanId}`}>
                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{loan.borrowerName}</p>
                              <p className="text-xs text-muted-foreground">{loan.loanNumber}</p>
                              {loan.guarantorName && (
                                <p className="text-xs text-muted-foreground">
                                  Guarantor: {loan.guarantorName}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <Badge variant="destructive" className="text-xs">
                                {loan.daysOverdue} days
                              </Badge>
                              <p className="text-sm font-semibold mt-1">
                                <CurrencyDisplay amount={loan.amountRemaining} />
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {data.overdueMonthlyLoans.length > 0 && (
              <section>
                <h3 className="text-sm font-semibold text-muted-foreground mb-3">
                  Overdue Monthly Loans ({data.overdueMonthlyLoans.length})
                </h3>
                <div className="space-y-2">
                  {data.overdueMonthlyLoans.map((loan) => (
                    <Link key={loan.loanId} href={`/loans/${loan.loanId}`}>
                      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
                        <CardContent className="py-3">
                          <div className="flex items-start justify-between">
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{loan.borrowerName}</p>
                              <p className="text-xs text-muted-foreground">{loan.loanNumber}</p>
                              {loan.lastPaymentDate && (
                                <p className="text-xs text-muted-foreground">
                                  Last paid: {loan.lastPaymentDate}
                                </p>
                              )}
                            </div>
                            <div className="text-right flex-shrink-0 ml-3">
                              <Badge variant="destructive" className="text-xs">
                                {loan.monthsOverdue} months
                              </Badge>
                              <p className="text-sm font-semibold mt-1">
                                <CurrencyDisplay amount={loan.interestDue} />
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </PullToRefresh>
  );
}
