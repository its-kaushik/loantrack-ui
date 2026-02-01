'use client';

import Link from 'next/link';
import { useQueryClient } from '@tanstack/react-query';
import { useDefaulters } from '@/features/dashboard/hooks/use-defaulters';
import { queryKeys } from '@/lib/query-keys';
import { PullToRefresh } from '@/components/shared/pull-to-refresh';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import { StatusBadge } from '@/components/shared/status-badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Phone } from 'lucide-react';

export default function DefaultersPage() {
  const { data, isLoading, isError } = useDefaulters();
  const queryClient = useQueryClient();

  const handleRefresh = async () => {
    await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.defaulters() });
  };

  if (isLoading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-24 w-full rounded-lg" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Failed to load defaulters data. Pull down to retry.
      </div>
    );
  }

  if (data.defaulters.length === 0) {
    return (
      <div className="p-4">
        <EmptyState
          title="No defaulted loans"
          description="No loans have been marked as defaulted or written off."
        />
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="space-y-2 p-4">
        {data.defaulters.map((item) => (
          <Link key={item.loanId} href={`/loans/${item.loanId}`}>
            <Card className="cursor-pointer transition-colors hover:bg-muted/50">
              <CardContent className="py-3">
                <div className="flex items-start justify-between mb-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium">{item.borrowerName}</p>
                      <StatusBadge status={item.status} variant="loan" />
                    </div>
                    <p className="text-xs text-muted-foreground">{item.loanNumber}</p>
                  </div>
                  <p className="text-sm font-semibold flex-shrink-0 ml-3">
                    <CurrencyDisplay amount={item.outstandingAmount} />
                  </p>
                </div>

                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <a
                    href={`tel:${item.borrowerPhone}`}
                    className="flex items-center gap-1 text-primary hover:underline"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Phone className="h-3 w-3" />
                    {item.borrowerPhone}
                  </a>
                  {item.guarantorName && (
                    <span>
                      Guarantor: {item.guarantorName}
                      {item.guarantorPhone && (
                        <a
                          href={`tel:${item.guarantorPhone}`}
                          className="ml-1 text-primary hover:underline"
                          onClick={(e) => e.stopPropagation()}
                        >
                          ({item.guarantorPhone})
                        </a>
                      )}
                    </span>
                  )}
                </div>

                {item.defaultedAt && (
                  <p className="text-xs text-muted-foreground mt-1">
                    Defaulted: {new Date(item.defaultedAt).toLocaleDateString()}
                    {item.writtenOffAt &&
                      ` · Written off: ${new Date(item.writtenOffAt).toLocaleDateString()}`}
                  </p>
                )}
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </PullToRefresh>
  );
}
