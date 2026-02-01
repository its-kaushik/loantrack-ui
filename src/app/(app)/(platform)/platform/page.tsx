'use client';

import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePlatformStats } from '@/features/platform/hooks/use-platform-stats';
import { Building, FileText, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  highlight?: boolean;
}

function StatCard({ label, value, icon: Icon, highlight }: StatCardProps) {
  return (
    <Card className={highlight ? 'bg-primary/5 border-primary/20' : undefined}>
      <CardContent className="py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-md bg-muted p-2">
            <Icon className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={`text-lg font-bold ${highlight ? 'text-primary' : ''}`}>{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PlatformDashboardPage() {
  const { data, isLoading } = usePlatformStats();

  return (
    <div>
      <PageHeader title="Platform Dashboard" />
      <div className="p-6 space-y-6">
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-20 rounded-lg" />
            ))}
          </div>
        )}

        {data && (
          <>
            {/* Tenant Stats */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Tenants</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatCard label="Total" value={data.tenants.total} icon={Building} highlight />
                <StatCard label="Active" value={data.tenants.active} icon={Building} />
                <StatCard label="Suspended" value={data.tenants.suspended} icon={Building} />
                <StatCard label="Deactivated" value={data.tenants.deactivated} icon={Building} />
              </div>
            </div>

            {/* Loan Stats */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Loans (All Tenants)</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="Total Loans" value={data.loans.total} icon={FileText} highlight />
                <StatCard label="Active" value={data.loans.active} icon={FileText} />
                <StatCard label="Closed" value={data.loans.closed} icon={FileText} />
                <StatCard label="Defaulted" value={data.loans.defaulted} icon={FileText} />
                <StatCard label="Written Off" value={data.loans.writtenOff} icon={FileText} />
                <StatCard label="Cancelled" value={data.loans.cancelled} icon={FileText} />
              </div>
            </div>

            {/* Users */}
            <div>
              <h2 className="text-sm font-medium text-muted-foreground mb-3">Users</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                <StatCard label="Total Users" value={data.totalUsers} icon={Users} highlight />
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
