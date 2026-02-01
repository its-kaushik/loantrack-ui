'use client';

import { PageHeader } from '@/components/shared/page-header';
import { CustomerForm } from '@/features/customers/components/customer-form';
import { useCreateCustomer } from '@/features/customers/hooks/use-create-customer';
import type { CreateCustomerFormValues } from '@/features/customers/schemas';
import type { CreateCustomerRequest } from '@/types/requests';

export default function NewCustomerPage() {
  const createMutation = useCreateCustomer();

  const handleSubmit = (data: CreateCustomerFormValues) => {
    createMutation.mutate(data as CreateCustomerRequest);
  };

  return (
    <div>
      <PageHeader title="New Customer" backHref="/customers" />
      <CustomerForm
        onSubmit={handleSubmit}
        isPending={createMutation.isPending}
        error={createMutation.error}
      />
    </div>
  );
}
