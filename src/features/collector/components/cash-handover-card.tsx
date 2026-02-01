'use client';

import { Card, CardContent } from '@/components/ui/card';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import type { CollectionTodayItem } from '../types';

interface CashHandoverCardProps {
  items: CollectionTodayItem[];
}

export function CashHandoverCard({ items }: CashHandoverCardProps) {
  const submittedItems = items.filter((i) => i.submittedToday);
  const totalAmount = submittedItems.reduce((sum, i) => sum + i.submittedAmount, 0);

  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="py-4">
        <p className="text-sm opacity-90">Today&apos;s Collections</p>
        <p className="text-2xl font-bold mt-1">
          <CurrencyDisplay amount={totalAmount} />
        </p>
        <p className="text-sm opacity-80 mt-1">
          {submittedItems.length} of {items.length} loans collected
        </p>
      </CardContent>
    </Card>
  );
}
