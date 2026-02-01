'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { useFundEntries } from '../hooks/use-fund-entries';
import { formatDate } from '@/utils/date';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import type { FundEntry } from '@/types/entities';
import type { FundEntryType } from '@/types/enums';

export function FundEntriesList() {
  const [entryType, setEntryType] = useState<FundEntryType | undefined>();
  const query = useFundEntries({ entryType });

  return (
    <div className="space-y-3">
      <Select
        value={entryType ?? 'ALL'}
        onValueChange={(v) => setEntryType(v === 'ALL' ? undefined : (v as FundEntryType))}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="All types" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All</SelectItem>
          <SelectItem value="INJECTION">Injections</SelectItem>
          <SelectItem value="WITHDRAWAL">Withdrawals</SelectItem>
        </SelectContent>
      </Select>

      <InfiniteList<FundEntry>
        query={query}
        itemKey={(e) => e.id}
        renderItem={(entry) => (
          <Card>
            <CardContent className="py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {entry.entryType === 'INJECTION' ? (
                    <ArrowDownLeft className="h-4 w-4 text-green-600" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4 text-red-600" />
                  )}
                  <div>
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${entry.entryType === 'INJECTION' ? 'text-green-700 border-green-200' : 'text-red-700 border-red-200'}`}
                    >
                      {entry.entryType}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDate(entry.entryDate)}
                    </p>
                    {entry.description && (
                      <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                        {entry.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`text-sm font-semibold ${entry.entryType === 'WITHDRAWAL' ? 'text-red-600' : ''}`}>
                  {entry.entryType === 'WITHDRAWAL' ? '- ' : ''}
                  <CurrencyDisplay amount={entry.amount} />
                </span>
              </div>
            </CardContent>
          </Card>
        )}
        emptyState={
          <EmptyState title="No fund entries" description="No fund entries recorded yet." />
        }
      />
    </div>
  );
}
