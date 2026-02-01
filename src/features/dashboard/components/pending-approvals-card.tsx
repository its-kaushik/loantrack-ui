'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Clock } from 'lucide-react';

interface PendingApprovalsCardProps {
  count: number;
}

export function PendingApprovalsCard({ count }: PendingApprovalsCardProps) {
  if (count === 0) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 py-4">
          <Clock className="h-5 w-5 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">All caught up! No pending approvals.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Link href="/more/approvals">
      <Card className="cursor-pointer transition-colors hover:bg-muted/50">
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <Clock className="h-5 w-5 text-amber-500" />
            <span className="text-sm font-medium">Pending Approvals</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-amber-100 text-amber-700">
              {count}
            </Badge>
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
