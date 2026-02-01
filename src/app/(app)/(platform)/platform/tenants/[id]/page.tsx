'use client';

import { use, useState } from 'react';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConfirmationDialog } from '@/components/shared/confirmation-dialog';
import { useTenantDetail } from '@/features/platform/hooks/use-tenant-detail';
import { useSuspendTenant, useActivateTenant } from '@/features/platform/hooks/use-tenant-actions';
import { formatDate } from '@/utils/date';
import { Building, Users, FileText, Contact, ShieldOff, ShieldCheck } from 'lucide-react';

const statusStyles: Record<string, string> = {
  ACTIVE: 'text-green-700 border-green-200',
  SUSPENDED: 'text-yellow-700 border-yellow-200',
  DEACTIVATED: 'text-red-700 border-red-200',
};

export default function TenantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: tenant, isLoading } = useTenantDetail(id);

  const suspendMutation = useSuspendTenant();
  const activateMutation = useActivateTenant();

  const [suspendOpen, setSuspendOpen] = useState(false);
  const [activateOpen, setActivateOpen] = useState(false);

  if (isLoading) {
    return (
      <div>
        <PageHeader title="Tenant Detail" backHref="/platform/tenants" />
        <div className="p-6 space-y-4">
          <Skeleton className="h-32 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
      </div>
    );
  }

  if (!tenant) return null;

  return (
    <div>
      <PageHeader title={tenant.name} backHref="/platform/tenants" />
      <div className="p-6 space-y-4">
        {/* Tenant Info */}
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Tenant Information
              </CardTitle>
              <Badge
                variant="outline"
                className={`text-[10px] ${statusStyles[tenant.status] ?? ''}`}
              >
                {tenant.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Slug</span>
              <span className="font-mono">{tenant.slug}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner</span>
              <span>{tenant.ownerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Owner Phone</span>
              <span>{tenant.ownerPhone}</span>
            </div>
            {tenant.ownerEmail && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Owner Email</span>
                <span>{tenant.ownerEmail}</span>
              </div>
            )}
            {tenant.address && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Address</span>
                <span className="text-right max-w-[200px]">{tenant.address}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Created</span>
              <span>{formatDate(tenant.createdAt)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card>
            <CardContent className="py-4 text-center">
              <FileText className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{tenant.activeLoansCount}</p>
              <p className="text-xs text-muted-foreground">Active Loans</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Users className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{tenant.totalUsersCount}</p>
              <p className="text-xs text-muted-foreground">Users</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-4 text-center">
              <Contact className="h-5 w-5 text-muted-foreground mx-auto mb-1" />
              <p className="text-lg font-bold">{tenant.totalCustomersCount}</p>
              <p className="text-xs text-muted-foreground">Customers</p>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Actions</CardTitle>
          </CardHeader>
          <CardContent className="flex gap-2">
            {tenant.status === 'ACTIVE' && (
              <Button
                variant="outline"
                className="text-destructive border-destructive/30"
                onClick={() => setSuspendOpen(true)}
              >
                <ShieldOff className="h-4 w-4 mr-2" />
                Suspend
              </Button>
            )}
            {(tenant.status === 'SUSPENDED' || tenant.status === 'DEACTIVATED') && (
              <Button variant="outline" onClick={() => setActivateOpen(true)}>
                <ShieldCheck className="h-4 w-4 mr-2" />
                Activate
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      <ConfirmationDialog
        open={suspendOpen}
        onOpenChange={setSuspendOpen}
        title="Suspend Tenant"
        description={`Are you sure you want to suspend "${tenant.name}"? All users under this tenant will lose access immediately.`}
        confirmLabel="Suspend"
        onConfirm={() => {
          suspendMutation.mutate(id, {
            onSuccess: () => setSuspendOpen(false),
          });
        }}
        destructive
        loading={suspendMutation.isPending}
      />

      <ConfirmationDialog
        open={activateOpen}
        onOpenChange={setActivateOpen}
        title="Activate Tenant"
        description={`Are you sure you want to activate "${tenant.name}"? This will restore access for all users.`}
        confirmLabel="Activate"
        onConfirm={() => {
          activateMutation.mutate(id, {
            onSuccess: () => setActivateOpen(false),
          });
        }}
        loading={activateMutation.isPending}
      />
    </div>
  );
}
