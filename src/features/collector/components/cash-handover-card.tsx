'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { MissedTodayLoan, MyCollectionToday } from '@/lib/api/loans.api';

interface CashHandoverCardProps {
  myCollection: MyCollectionToday;
  missedItems: MissedTodayLoan[];
}

export function CashHandoverCard({ myCollection, missedItems }: CashHandoverCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="py-4">
        <p className="text-sm opacity-90">Today&apos;s Collections</p>
        <p className="text-2xl font-bold mt-1">
          <CurrencyDisplay amount={parseFloat(myCollection.totalAmount)} />
        </p>
        <p className="text-sm opacity-80 mt-1">
          {myCollection.count} collected &middot; {missedItems.length} pending
        </p>
      </CardContent>
    </Card>
  );
}
