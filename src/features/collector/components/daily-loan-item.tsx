'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CurrencyDisplay } from '@/components/shared/currency-display';
import { Phone, Check } from 'lucide-react';
import type { CollectionTodayItem } from '../types';

interface DailyLoanItemProps {
  item: CollectionTodayItem;
}

export function DailyLoanItem({ item }: DailyLoanItemProps) {
  return (
    <Card className={item.submittedToday ? 'opacity-60' : ''}>
      <CardContent className="py-3">
        <div className="flex items-start justify-between">
          <Link
            href={`/today/record?loanId=${item.id}`}
            className="min-w-0 flex-1"
          >
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-medium truncate">{item.borrowerName}</p>
              {item.submittedToday && (
                <Badge variant="secondary" className="text-[10px] gap-0.5 flex-shrink-0">
                  <Check className="h-3 w-3" />
                  Submitted
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{item.loanNumber}</p>
          </Link>

          <div className="flex items-center gap-2 flex-shrink-0 ml-3">
            <div className="text-right">
              <p className="text-sm font-semibold">
                <CurrencyDisplay amount={item.principalAmount} />
              </p>
            </div>
            {item.borrowerPhone && (
              <a
                href={`tel:${item.borrowerPhone}`}
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full hover:bg-muted"
                aria-label="Call borrower"
              >
                <Phone className="h-4 w-4 text-primary" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
