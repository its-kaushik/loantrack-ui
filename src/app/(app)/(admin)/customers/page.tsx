'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { Fab } from '@/components/shared/fab';
import { CustomerCard } from '@/features/customers/components/customer-card';
import { CustomerListFilters } from '@/features/customers/components/customer-list-filters';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus } from 'lucide-react';
import type { Customer } from '@/types/entities';

export default function CustomersPage() {
  const [search, setSearch] = useState('');
  const [defaulterFilter, setDefaulterFilter] = useState<'all' | 'defaulters' | 'non-defaulters'>('all');
  const debouncedSearch = useDebounce(search, 300);

  const isDefaulter =
    defaulterFilter === 'defaulters' ? true :
    defaulterFilter === 'non-defaulters' ? false :
    undefined;

  const query = useCustomers({
    search: debouncedSearch || undefined,
    isDefaulter,
  });

  return (
    <div>
      <PageHeader title="Customers" />
      <div className="p-4 space-y-4">
        <CustomerListFilters
          search={search}
          onSearchChange={setSearch}
          defaulterFilter={defaulterFilter}
          onDefaulterFilterChange={setDefaulterFilter}
        />
        <InfiniteList<Customer>
          query={query}
          renderItem={(customer) => <CustomerCard customer={customer} />}
          itemKey={(customer) => customer.id}
          emptyState={
            <EmptyState
              title="No customers yet"
              description="Add your first customer to get started."
              actionLabel="New Customer"
              actionHref="/customers/new"
            />
          }
        />
      </div>
      <Fab icon={Plus} label="New Customer" href="/customers/new" />
    </div>
  );
}
