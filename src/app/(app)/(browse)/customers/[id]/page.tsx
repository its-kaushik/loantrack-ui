'use client';

import { use } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { useCustomerDetail } from '@/features/customers/hooks/use-customer-detail';
import { useAuthStore } from '@/stores/auth-store';
import { CustomerDetailView } from '@/features/customers/components/customer-detail';

export default function CustomerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: customer, isLoading, isError } = useCustomerDetail(id);
  const isCollector = useAuthStore((s) => s.user?.role === 'COLLECTOR');

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Customer" backHref="/customers" />
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div>
        <PageHeader title="Customer" backHref="/customers" />
        <div className="p-4 text-center text-sm text-muted-foreground">
          Failed to load customer details.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Customer" backHref="/customers" />
      <CustomerDetailView customer={customer} readOnly={isCollector} />
    </div>
  );
}
