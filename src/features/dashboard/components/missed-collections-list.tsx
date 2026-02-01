'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Phone } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import type { MissedCollectionItem } from '../types';

interface MissedCollectionsListProps {
  items: MissedCollectionItem[];
}

const INITIAL_VISIBLE = 5;

export function MissedCollectionsList({ items }: MissedCollectionsListProps) {
  const [showAll, setShowAll] = useState(false);
  const visibleItems = showAll ? items : items.slice(0, INITIAL_VISIBLE);

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          Missed Today ({items.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length === 0 ? (
          <EmptyState
            title="All caught up!"
            description="All daily collections received today."
          />
        ) : (
          <div className="space-y-1">
            {visibleItems.map((item) => (
              <div
                key={item.loanId}
                className="flex items-center justify-between rounded-md p-2 hover:bg-muted/50"
              >
                <Link href={`/loans/${item.loanId}`} className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{item.borrowerName}</p>
                  <p className="text-xs text-muted-foreground">
                    <CurrencyDisplay amount={item.dailyPaymentAmount} />
                  </p>
                </Link>
                {item.borrowerPhone && (
                  <a
                    href={`tel:${item.borrowerPhone}`}
                    className="ml-2 p-2 rounded-full text-primary hover:bg-primary/10"
                    aria-label={`Call ${item.borrowerName}`}
                  >
                    <Phone className="h-4 w-4" />
                  </a>
                )}
              </div>
            ))}
            {items.length > INITIAL_VISIBLE && !showAll && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-primary"
                onClick={() => setShowAll(true)}
              >
                See all ({items.length})
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
