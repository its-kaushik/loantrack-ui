import type { Tenant } from '@/types/entities';

export interface PlatformStats {
  tenants: {
    active: number;
    suspended: number;
    deactivated: number;
    total: number;
  };
  loans: {
    active: number;
    closed: number;
    defaulted: number;
    writtenOff: number;
    cancelled: number;
    total: number;
  };
  totalUsers: number;
}

export interface TenantDetail extends Tenant {
  activeLoansCount: number;
  totalUsersCount: number;
  totalCustomersCount: number;
}

export interface ListTenantsFilters {
  status?: string;
}
