'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { MissedTodayLoan } from '@/lib/api/loans.api';

interface CashHandoverCardProps {
  items: MissedTodayLoan[];
}

export function CashHandoverCard({ items }: CashHandoverCardProps) {
  return (
    <Card className="bg-primary text-primary-foreground">
      <CardContent className="py-4">
        <p className="text-sm opacity-90">Pending Collections</p>
        <p className="text-2xl font-bold mt-1">
          {items.length} loans pending
        </p>
      </CardContent>
    </Card>
  );
}
