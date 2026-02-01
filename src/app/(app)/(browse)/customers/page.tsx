'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { Fab } from '@/components/shared/fab';
import { CustomerCard } from '@/features/customers/components/customer-card';
import { CustomerListFilters } from '@/features/customers/components/customer-list-filters';
import { useCustomers } from '@/features/customers/hooks/use-customers';
import { useAuthStore } from '@/stores/auth-store';
import { useDebounce } from '@/hooks/use-debounce';
import { Plus } from 'lucide-react';
import type { Customer } from '@/types/entities';

export default function CustomersPage() {
  const isCollector = useAuthStore((s) => s.user?.role === 'COLLECTOR');
  const [search, setSearch] = useState('');
  const [defaulterFilter, setDefaulterFilter] = useState<'all' | 'defaulters' | 'non-defaulters'>('all');
  const debouncedSearch = useDebounce(search, 300);

  const isDefaulter =
    defaulterFilter === 'defaulters' ? true :
    defaulterFilter === 'non-defaulters' ? false :
    undefined;

  const query = useCustomers({
    search: debouncedSearch || undefined,
    isDefaulter: isCollector ? undefined : isDefaulter,
  });

  return (
    <div>
      <PageHeader title="Customers" />
      <div className="p-4 space-y-4">
        {isCollector ? (
          <div className="relative">
            <input
              type="text"
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
          </div>
        ) : (
          <CustomerListFilters
            search={search}
            onSearchChange={setSearch}
            defaulterFilter={defaulterFilter}
            onDefaulterFilterChange={setDefaulterFilter}
          />
        )}
        <InfiniteList<Customer>
          query={query}
          renderItem={(customer) => <CustomerCard customer={customer} />}
          itemKey={(customer) => customer.id}
          emptyState={
            <EmptyState
              title={isCollector ? 'No customers' : 'No customers yet'}
              description={isCollector ? 'No customers found.' : 'Add your first customer to get started.'}
              actionLabel={isCollector ? undefined : 'New Customer'}
              actionHref={isCollector ? undefined : '/customers/new'}
            />
          }
        />
      </div>
      {!isCollector && <Fab icon={Plus} label="New Customer" href="/customers/new" />}
    </div>
  );
}
