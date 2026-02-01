'use client';

import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/utils/date';
import type { Tenant } from '@/types/entities';

const statusStyles: Record<string, string> = {
  ACTIVE: 'text-green-700 border-green-200',
  SUSPENDED: 'text-yellow-700 border-yellow-200',
  DEACTIVATED: 'text-red-700 border-red-200',
};

export function TenantCard({ tenant }: { tenant: Tenant }) {
  return (
    <Link href={`/platform/tenants/${tenant.id}`}>
      <Card className="hover:bg-accent/50 transition-colors">
        <CardContent className="py-3">
          <div className="flex items-start justify-between mb-1">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium truncate">{tenant.name}</p>
              <p className="text-xs text-muted-foreground">{tenant.slug}</p>
            </div>
            <Badge variant="outline" className={`text-[10px] ${statusStyles[tenant.status] ?? ''}`}>
              {tenant.status}
            </Badge>
          </div>
          <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
            <span>{tenant.ownerName} &middot; {tenant.ownerPhone}</span>
            <span>{formatDate(tenant.createdAt)}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
