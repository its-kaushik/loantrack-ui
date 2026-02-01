'use client';

import { use } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/shared/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { useCustomerDetail } from '@/features/customers/hooks/use-customer-detail';
import { useUpdateCustomer } from '@/features/customers/hooks/use-update-customer';
import type { CreateCustomerFormValues } from '@/features/customers/schemas';
import type { UpdateCustomerRequest } from '@/types/requests';

export default function EditCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: customer, isLoading, isError } = useCustomerDetail(id);
  const updateMutation = useUpdateCustomer(id);

  const handleSubmit = (data: CreateCustomerFormValues) => {
    updateMutation.mutate(data as unknown as UpdateCustomerRequest, {
      onSuccess: () => router.push(`/customers/${id}`),
    });
  };

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Edit Customer" backHref={`/customers/${id}`} />
        <div className="p-4 space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !customer) {
    return (
      <div>
        <PageHeader title="Edit Customer" backHref={`/customers/${id}`} />
        <div className="p-4 text-center text-sm text-muted-foreground">
          Failed to load customer details.
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Edit Customer" backHref={`/customers/${id}`} />
      <CustomerForm
        initialData={customer}
        onSubmit={handleSubmit}
        isPending={updateMutation.isPending}
        error={updateMutation.error}
        submitLabel="Save Changes"
      />
    </div>
  );
}
