'use client';

import { PageHeader } from '@/components/shared/page-header';
import { OnboardTenantForm } from '@/features/platform/components/onboard-tenant-form';

export default function OnboardTenantPage() {
  return (
    <div>
      <PageHeader title="Onboard Tenant" backHref="/platform/tenants" />
      <OnboardTenantForm />
    </div>
  );
}
