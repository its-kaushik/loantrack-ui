'use client';

import { useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { InfiniteList } from '@/components/shared/infinite-list';
import { EmptyState } from '@/components/shared/empty-state';
import { Fab } from '@/components/shared/fab';
import { TenantCard } from '@/features/platform/components/tenant-card';
import { useTenants } from '@/features/platform/hooks/use-tenants';
import { Plus } from 'lucide-react';
import type { Tenant } from '@/types/entities';

export default function TenantsPage() {
  const [status, setStatus] = useState<string | undefined>();

  const query = useTenants({ status });

  return (
    <div>
      <PageHeader title="Tenants" />
      <div className="p-6 space-y-4">
        <Select
          value={status ?? 'ALL'}
          onValueChange={(v) => setStatus(v === 'ALL' ? undefined : v)}
        >
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="SUSPENDED">Suspended</SelectItem>
            <SelectItem value="DEACTIVATED">Deactivated</SelectItem>
          </SelectContent>
        </Select>

        <InfiniteList<Tenant>
          query={query}
          itemKey={(t) => t.id}
          renderItem={(tenant) => <TenantCard tenant={tenant} />}
          emptyState={
            <EmptyState
              title="No tenants"
              description="No tenants found. Onboard your first tenant to get started."
            />
          }
        />
      </div>
      <Fab icon={Plus} label="Onboard Tenant" href="/platform/tenants/new" />
    </div>
  );
}
