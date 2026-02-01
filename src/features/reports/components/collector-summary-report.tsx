'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { EmptyState } from '@/components/shared/empty-state';
import { DateRangePicker, getDefaultDateRange } from './date-range-picker';
import { useCollectorSummary } from '../hooks/use-collector-summary';
import type { CollectorSummaryItem } from '../types';

function CollectorCard({ item }: { item: CollectorSummaryItem }) {
  return (
    <Card>
      <CardContent className="py-3">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm font-medium">{item.name}</p>
          <span className="text-sm font-semibold">
            <CurrencyDisplay amount={item.totalAmount} />
          </span>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>Transactions: {item.totalTransactions}</span>
          <span>Loans Serviced: {item.loansServiced}</span>
        </div>
        <div className="flex gap-2 mt-2">
          <Badge variant="outline" className="text-[10px] text-green-700 border-green-200">
            Approved: {item.approved}
          </Badge>
          <Badge variant="outline" className="text-[10px] text-yellow-700 border-yellow-200">
            Pending: {item.pending}
          </Badge>
          {item.rejected > 0 && (
            <Badge variant="outline" className="text-[10px] text-red-700 border-red-200">
              Rejected: {item.rejected}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export function CollectorSummaryReport() {
  const defaults = getDefaultDateRange();
  const [from, setFrom] = useState(defaults.from);
  const [to, setTo] = useState(defaults.to);

  const { data, isLoading } = useCollectorSummary(from, to);

  return (
    <div className="space-y-4">
      <DateRangePicker from={from} to={to} onFromChange={setFrom} onToChange={setTo} />

      {isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-lg" />
          ))}
        </div>
      )}

      {!isLoading && (!data || data.length === 0) && (
        <EmptyState title="No collectors" description="No collector activity found for the selected period." />
      )}

      {data && data.length > 0 && (
        <div className="space-y-2">
          {data.map((item) => (
            <CollectorCard key={item.userId} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
